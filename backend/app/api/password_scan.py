from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter(prefix="/scan/password", tags=["Password Scan"])

class PasswordRequest(BaseModel):
    password: str

@router.post("/")
async def check_password_strength(payload: PasswordRequest):
    import requests
    pwd = payload.password
    
    # 1. Basic Local Checks (fast fail)
    score = 0
    feedback = []
    
    if len(pwd) >= 8: score += 1
    if len(pwd) >= 12: score += 1
    if re.search(r"[A-Z]", pwd): score += 1
    if re.search(r"\d", pwd): score += 1
    if re.search(r"[!@#$%^&*]", pwd): score += 1

    # 2. AI Analysis via Hugging Face
    ai_strength = "Moderate"
    ai_score = score
    ai_feedback = feedback

    try:
        from dotenv import load_dotenv
        import os
        load_dotenv()
        HF_TOKEN = os.getenv("HF_TOKEN")
        MODELS = ["microsoft/Phi-3.5-mini-instruct", "google/gemma-1.1-7b-it"]
        API_BASE = "https://api-inference.huggingface.co/models/"
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}

        prompt = f"""<|system|>
You are a password security expert.
Analyze this password: "{pwd}"
Return strictly JSON format:
{{
  "strength": "Weak" | "Moderate" | "Strong",
  "score": 0-6,
  "suggestions": ["tip1", "tip2"]
}}
</s>
<|user|>
Analyze: {pwd}
</s>
<|assistant|>"""

        payload_api = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": 150, "return_full_text": False}
        }
        
        for model_id in MODELS:
            try:
                resp = requests.post(f"{API_BASE}{model_id}", headers=headers, json=payload_api, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list) and len(data) > 0:
                        text = data[0].get("generated_text", "")
                        # Attempt primitive parsing since models might not return perfect JSON
                        if "Strong" in text: ai_strength = "Strong"
                        elif "Weak" in text: ai_strength = "Weak"
                        break
            except:
                continue

    except Exception as e:
        print(f"Password AI Failed: {e}")

    # Final Fallback Calculation
    if score >= 4: ai_strength = "Strong"
    elif score < 3: ai_strength = "Weak"
    
    if not ai_feedback:
        if len(pwd) < 12: ai_feedback.append("Increase length to at least 12 characters.")
        if not re.search(r"[!@#$%^&*]", pwd): ai_feedback.append("Add special symbols like #, $, !.")

    return {
        "strength": ai_strength,
        "score": score,  # Use local score as it's more reliable mathematically
        "feedback": ai_feedback
    }
