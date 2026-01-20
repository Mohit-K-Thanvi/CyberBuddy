import requests
import hashlib
import time

# API Key from resources/virusTotalAPIKEY.txt
API_KEY = "0258428c7fa451a0cc18b13af294b5b3923d97c7dcc049a2dc0df9e9c48b790d"
BASE_URL = "https://www.virustotal.com/api/v3"

def check_url_virustotal(url: str):
    """
    Checks a URL against VirusTotal headers.
    Returns: (malicious_count, total_votes, link_to_report)
    """
    # 1. Encode URL (Base64 without padding)
    import base64
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    
    headers = {
        "x-apikey": API_KEY,
        "accept": "application/json"
    }

    try:
        # Get report
        response = requests.get(f"{BASE_URL}/urls/{url_id}", headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            stats = data["data"]["attributes"]["last_analysis_stats"]
            malicious = stats["malicious"]
            suspicious = stats["suspicious"]
            total = sum(stats.values())
            
            return malicious + suspicious, total, data["data"]["links"]["self"]
        
        elif response.status_code == 404:
            # URL not found in VT database, need to submit it (skip for speed in this demo)
            return 0, 0, None
            
    except Exception as e:
        print(f"VT Error: {e}")
        return 0, 0, None

    return 0, 0, None
