from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional

from app.services.email_analyzer import email_analyzer
from app.ml.predictor import predict_url
from app.api.ai_scan import ScanResponse

router = APIRouter(prefix="/scan/email", tags=["Email Scan"])

class EmailRequest(BaseModel):
    sender: str
    subject: str
    body: str

class EmailResponse(BaseModel):
    prediction: str
    confidence: float
    threats: List[str]
    message: str


from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.scan import ScanHistory

@router.post("/", response_model=EmailResponse)
def scan_email(payload: EmailRequest, db: Session = Depends(get_db)):
    """
    Analyzes email content for phishing indicators using Hybrid AI (Hugging Face) + Heuristics.
    """
    import requests
    import json
    
    # --- 1. CONFIGURATION ---
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    # --- 1. CONFIGURATION ---
    HF_TOKEN = os.getenv("HF_TOKEN")
    MODELS = ["microsoft/Phi-3.5-mini-instruct", "google/gemma-1.1-7b-it"]
    API_BASE = "https://api-inference.huggingface.co/models/"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    
    # --- 2. HEURISTICS CHECK (Fast & Reliable) ---
    threats_found = []
    
    # A. Domain mismatch patterns
    if "@" in payload.sender:
        domain = payload.sender.split('@')[-1].lower()
        free_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'protonmail.com']
        
        # Check if corporate-sounding subject comes from public email
        corporate_keywords = ['invoice', 'payroll', 'hr update', 'security alert', 'bank', 'verify', 'action required', 'bill']
        if domain in free_domains and any(k in payload.subject.lower() for k in corporate_keywords):
            threats_found.append("Sender Domain Mismatch (Public Email for Business)")

    # B. Urgency Patterns
    urgency_words = ['immediate', 'urgent', 'accountexpiring', '24 hours', 'suspended', 'lock', 'unauthorized', 'click here', 'reset password']
    if any(w in payload.body.lower().replace(" ", "") for w in urgency_words):
        threats_found.append("Urgency/Fear Tactics Detected")
        
    # --- 3. AI ANALYSIS (Deep Insight) ---
    # Default to suspicious if heuristics trigger
    ai_prediction = "legitimate" if len(threats_found) == 0 else "suspicious"
    ai_confidence = 0.85
    ai_explanation = "This email looks safe and standard."
    
    try:
        # Prompt for JSON output
        # Prompt for JSON output (Chain Of Thought)
        prompt = f"""<|system|>
You are a senior cybersecurity analyst. Analyze the following email for phishing specific indicators.
1. Check the Sender Domain: Does it match the company in the Subject/Body?
2. Check for Urgency: Are they threatening account deletion?
3. Check for Generic Greetings: "Dear Customer"?

Based on this, output valid JSON:
{{
  "prediction": "phishing" or "legitimate",
  "confidence": 0.95,
  "explanation": "State the key evidence found."
}}
</s>
<|user|>
From: {payload.sender}
Subject: {payload.subject}
Body: {payload.body}
</s>
<|assistant|>"""

        payload_api = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": 200, "return_full_text": False}
        }

        for model_id in MODELS:
            try:
                resp = requests.post(f"{API_BASE}{model_id}", headers=headers, json=payload_api, timeout=6)
                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list) and len(data) > 0:
                        text = data[0].get("generated_text", "")
                        # Cleanup text to find JSON
                        start = text.find('{')
                        end = text.rfind('}') + 1
                        if start != -1 and end != -1:
                            json_str = text[start:end]
                            ai_data = json.loads(json_str)
                            ai_prediction = ai_data.get("prediction", "suspicious").lower()
                            ai_confidence = float(ai_data.get("confidence", 0.5))
                            ai_explanation = ai_data.get("explanation", "AI detected suspicious patterns.")
                            break # Success
            except Exception as e:
                continue

    except Exception as e:
        print(f"AI Email Scan Failed: {e}")
        # Logic Fallback
        if len(threats_found) > 0:
            ai_prediction = "suspicious"
            ai_explanation = f"Detected {len(threats_found)} red flags like urgency or mismatches."
    # --- 4. MERGE RESULTS ---
    final_pred = ai_prediction
    if len(threats_found) >= 2: final_pred = "phishing"
    elif len(threats_found) == 1 and final_pred == "legitimate": final_pred = "suspicious"

    message = f"Verdict: {final_pred.upper()}. {ai_explanation}"

    # --- 5. SAVE TO DB ---
    try:
        scan_entry = ScanHistory(
            url=f"Email: {payload.sender} | {payload.subject}",
            prediction=final_pred,
            confidence=ai_confidence,
            source="email"
        )
        db.add(scan_entry)
        db.commit()
        db.refresh(scan_entry)
    except Exception as e:
        print(f"DB Save Error: {e}")

    return {
        "prediction": final_pred,
        "confidence": ai_confidence,
        "threats": threats_found,
        "message": message
    }
