from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, HttpUrl
from datetime import datetime

from app.ml.predictor import predict_url
from app.core.database import get_db
from app.models.scan import ScanHistory

router = APIRouter(prefix="/scan", tags=["AI Scan"])


# ✅ schemas
class ScanRequest(BaseModel):
    url: HttpUrl
    source: str = "web"

class ScanResponse(BaseModel):
    prediction: str
    confidence: float
    message: Optional[str] = None
    domain_age: Optional[str] = None
    ip_address: Optional[str] = None
    server_location: Optional[str] = None
    asn: Optional[str] = None
    explanation: Optional[str] = None

class HistoryItem(BaseModel):
    id: int
    url: str
    prediction: str
    confidence: float
    source: str
    timestamp: datetime

    class Config:
        from_attributes = True


@router.post("/input", response_model=ScanResponse)
def scan_input(payload: ScanRequest, db: Session = Depends(get_db)):
    """
    Scans a URL and saves the result to history.
    """
    url_str = str(payload.url)
    
    # 1. Run AI Prediction
    result = predict_url(url_str)
    
    # 2. Enrich with WHOIS/GeoIP
    from app.services.enrichment import get_enhanced_url_data
    enrichment = get_enhanced_url_data(url_str)
    result.update(enrichment)

    # 3. Generate "Explain Like I'm 12" Explanation using Groq (Llama 3)
    try:
        from groq import Groq
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        
        if not GROQ_API_KEY:
            print("[-] Groq API Key missing in .env")
            raise Exception("Missing API Key")
            
        client = Groq(api_key=GROQ_API_KEY)
        
        age = enrichment.get("domain_age", "Unknown")
        loc = enrichment.get("server_location", "Unknown")
        status = result["prediction"]

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a cybersecurity expert explaining website safety to a 12-year-old kid. Keep it extremely simple, short (1 sentence), and fun."
                },
                {
                    "role": "user",
                    "content": f"Explain this website:\nURL: {url_str}\nStatus: {status}\nAge: {age}\nLocation: {loc}"
                }
            ],
            temperature=0.7,
            max_tokens=100,
            top_p=1,
            stream=False,
            stop=None,
        )

        explanation = completion.choices[0].message.content
        result["explanation"] = explanation.replace('"', '').strip()

    except Exception as e:
        print(f"Groq AI Failed: {e}")
        # Fallback to old logic if needed, but for now we skip to Manual Fallback logic below

    except Exception as e:
        print(f"HF Explanation failed: {e}")
        
    if "explanation" not in result:
        # Final Manual Fallback
        if result["prediction"] == "legitimate":
            result["explanation"] = "This site looks properly registered and safe to visit."
        else:
            result["explanation"] = "This site uses tricks to hide its identity. It is not safe."

    # 4. Save to DB
    scan_entry = ScanHistory(
        url=url_str,
        prediction=result["prediction"],
        confidence=result["confidence"],
        source=payload.source
    )
    db.add(scan_entry)
    db.commit()
    db.refresh(scan_entry)
    
    return result


@router.get("/history", response_model=List[HistoryItem])
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    """
    Get recent scan history.
    """
    history = db.query(ScanHistory).order_by(ScanHistory.timestamp.desc()).limit(limit).all()
    return history


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """
    Get aggregated statistics for dashboard visualization.
    """
    total_scans = db.query(ScanHistory).count()
    
    malicious_count = db.query(ScanHistory).filter(ScanHistory.prediction != "legitimate").count()
    safe_count = db.query(ScanHistory).filter(ScanHistory.prediction == "legitimate").count()
    
    # Calculate percentages
    risk_score = 0
    if total_scans > 0:
        risk_score = round((malicious_count / total_scans) * 100, 1)

    return {
        "total": total_scans,
        "malicious": malicious_count,
        "safe": safe_count,
        "risk_percentage": risk_score
    }

