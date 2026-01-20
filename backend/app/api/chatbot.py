from fastapi import APIRouter
from pydantic import BaseModel
import requests

router = APIRouter(prefix="/bot", tags=["ChatBot"])

class ChatRequest(BaseModel):
    message: str

@router.post("/message")
async def chat_with_bot(payload: ChatRequest):
    msg = payload.message
    
    # -------------------------------------------------------------
    # 🚀 CONFIGURATION: Groq Cloud (Llama 3)
    # -------------------------------------------------------------
    from groq import Groq
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    if not GROQ_API_KEY:
        return {
           "reply": "⚠️ SYSTEM ERROR: Groq API Key missing. Please check backend/.env file.",
           "sentiment": "error"
        }

    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        system_prompt = """You are CyberBot, an elite cybersecurity AI assistant built by CyberBuddy X. 
        Your goal is to help users protect themselves from digital threats.
        - Be concise, professional, but friendly.
        - If asked about hacking, provide defensive education only (White Hat).
        - Use emojis occasionally to be engaging.
        - If the user is panicking (e.g., "I was hacked"), give immediate actionable steps (Disconnect, Change Passwords, 2FA).
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": msg}
            ],
            temperature=0.7,
            max_tokens=300,
            top_p=1,
            stream=False,
            stop=None,
        )

        reply_text = completion.choices[0].message.content

        return {
            "reply": reply_text,
            "sentiment": "neutral" 
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Groq Chat Error: {e}")
        return {
            "reply": f"Use this error code to debug: {str(e)}",
            "sentiment": "error"
        }
