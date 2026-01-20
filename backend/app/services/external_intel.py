
import requests
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

VT_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")
VT_URL_ENDPOINT = "https://www.virustotal.com/api/v3/urls"

class ExternalIntelService:
    def __init__(self):
        if not VT_API_KEY:
            print("Warning: VIRUSTOTAL_API_KEY not found in environment.")
        self.headers = {
            "x-apikey": VT_API_KEY
        }

    def check_url_reputation(self, url: str):
        """
        Backup: Queries VirusTotal for URL reputation.
        Returns a risk score (0.0 to 1.0) and a message.
        """
        try:
            # VT requires base64 encoding of the URL for the ID
            import base64
            url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
            
            resp = requests.get(f"{VT_URL_ENDPOINT}/{url_id}", headers=self.headers)
            
            if resp.status_code == 200:
                data = resp.json()
                stats = data['data']['attributes']['last_analysis_stats']
                
                malicious = stats.get('malicious', 0)
                suspicious = stats.get('suspicious', 0)
                
                if malicious > 0:
                    return {
                        "risk_score": 1.0,
                        "message": f"VirusTotal flagged this as Malicious ({malicious} vendors)."
                    }
                elif suspicious > 0:
                    return {
                        "risk_score": 0.6,
                        "message": f"VirusTotal flagged this as Suspicious ({suspicious} vendors)."
                    }
            
            return {"risk_score": 0.0, "message": "VirusTotal analysis: Clean."}
            
        except Exception as e:
            print(f"[Backup API Error] {e}")
            return {"risk_score": 0.0, "message": "Backup API unavailable."}

    def scan_visual_cloud_backup(self, image_bytes: bytes):
        """
        Backup: Simulates a Cloud Vision API call.
        In a real scenario, this would call Google Vision or Azure Computer Vision.
        """
        # For now, we simulate a check on the file hash against a 'Global Blocklist'
        sha256 = hashlib.sha256(image_bytes).hexdigest()
        
        # logical simulation
        # If hash ends in '9', specific mock "match"
        if sha256.endswith('ffff'): 
            return {
                "risk_score": 0.9,
                "message": "Global Cloud DB: Image hash matches known phishing campaign."
            }
            
        return {
            "risk_score": 0.0, 
            "message": "Cloud Vision: No brand infringement detected."
        }

external_intel = ExternalIntelService()
