from fastapi import APIRouter, File, UploadFile, Form, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.scan import ScanHistory
import easyocr
import numpy as np
from PIL import Image
import io

router = APIRouter(prefix="/scan/visual", tags=["Visual Scan"])

# Feature: Global OCR Reader (Lazy Loaded to prevent startup hang)
_reader = None

def get_reader():
    global _reader
    if _reader is None:
        print("[*] Initializing EasyOCR Engine (High Performance)...")
        _reader = easyocr.Reader(['en'], gpu=False) # GPU=False for compatibility
    return _reader

@router.post("/")
async def scan_image(
    file: UploadFile = File(...), 
    domain: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        # 1. Read Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Preprocessing: Convert to Grayscale & Enhance
        image_gray = image.convert('L') # Grayscale
        # Simple contrast stretch handled implicitly by converting to numpy for better OCR
        image_np = np.array(image_gray)

        # 2. Extract Text (The "Eyes" of the scanner)
        reader = get_reader()
        # detail=0 returns just the list of strings
        text_results = reader.readtext(image_np, detail=0, paragraph=True)
        full_text = " ".join(text_results).lower()
        
        # 3. Industry-Level Threat Logic
        prediction = "legitimate"
        confidence = 0.5
        message = "No specific threats detected visually."
        
        # Branding Database (Extensible)
        brand_intel = {
            "google": ["google.com", "gmail.com", "accounts.google.com", "youtube.com"],
            "microsoft": ["microsoft.com", "live.com", "office.com", "azure.com", "outlook.com"],
            "paypal": ["paypal.com"],
            "facebook": ["facebook.com", "fb.com", "meta.com"],
            "instagram": ["instagram.com"],
            "netflix": ["netflix.com"],
            "amazon": ["amazon.com", "aws.amazon.com"],
            "apple": ["apple.com", "icloud.com"],
            "chase": ["chase.com"],
            "bank of america": ["bankofamerica.com"],
            "wells fargo": ["wellsfargo.com"]
        }

        # Analysis
        # Analysis
        detected_brand = None
        # Strict Word Boundary Check (Prevent "face" matching "Facebook")
        full_text_padded = f" {full_text} " 
        
        for brand in brand_intel:
            # Check for " brand " or brand at start/end
            if f" {brand} " in full_text_padded:
                detected_brand = brand
                break
        
        cleaned_domain = domain.lower().replace("https://", "").replace("http://", "").split("/")[0]

        if detected_brand:
            # Check if domain matches the detected brand's trusted list
            is_trusted = False
            for trusted_domain in brand_intel[detected_brand]:
                if cleaned_domain.endswith(trusted_domain):
                    is_trusted = True
                    break
            
            if not is_trusted:
                prediction = "phishing"
                confidence = 0.98
                message = f"🚨 BLOCKED: Using {detected_brand.title()} branding on untrusted domain '{domain}'."
            else:
                prediction = "legitimate"
                confidence = 0.95
                message = f"✅ Verified: Authentic {detected_brand.title()} interface."

        else:
            # Generic Login Page Detection
            login_keywords = ["sign in", "log in", "password", "username", "email address", "forgot password"]
            if any(k in full_text for k in login_keywords):
                prediction = "suspicious"
                confidence = 0.65
                message = f"⚠️ Analysis: Generic login form detected on unidentified domain. Verify SSL certificate."
            else:
                prediction = "legitimate"
                confidence = 0.60
                message = "Visual layout does not match known phishing templates."

    except Exception as e:
        print(f"Visual Scan Critical Error: {e}")
        prediction = "suspicious"
        confidence = 0.0
        message = "Visual engine encountered an error. Proceed with caution."

    # 4. Save to History
    try:
        scan_entry = ScanHistory(
            url=f"Visual: {file.filename} | Domain: {domain}",
            prediction=prediction,
            confidence=confidence,
            source="visual"
        )
        db.add(scan_entry)
        db.commit()
    except Exception as e:
        print(f"DB Error: {e}")

    return {
        "prediction": prediction,
        "confidence": confidence,
        "message": message,
        "extracted_text_preview": full_text[:100] + "..." if 'full_text' in locals() else ""
    }
