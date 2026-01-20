import re
from typing import List, Dict

URGENCY_KEYWORDS = [
    "immediately", "urgent", "24 hours", "suspended", "restricted", 
    "unauthorized", "verify your identity", "account locked", "action required"
]

FINANCIAL_KEYWORDS = [
    "bank", "credit card", "wallet", "btc", "bitcoin", "payment", 
    "invoice", "billing", "paypal", "withdraw"
]

SUSPICIOUS_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]

class EmailAnalyzer:
    def __init__(self):
        pass

    def extract_urls(self, text: str) -> List[str]:
        # Basic regex for URLs
        return re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+', text)

    def analyze_headers(self, sender: str) -> float:
        score = 0
        # Check if sender claims to be official but uses public domain
        # e.g. "PayPal Support <paypal-support@gmail.com>"
        sender_lower = sender.lower()
        
        is_public_domain = any(d in sender_lower for d in SUSPICIOUS_DOMAINS)
        claims_official = any(k in sender_lower for k in ["support", "admin", "security", "verify", "official"])
        
        if claims_official and is_public_domain:
            return 0.9 # High probability of phishing
            
        return 0.0

    def analyze_body(self, text: str) -> Dict:
        text_lower = text.lower()
        keywords_found = []
        score = 0.0

        # Urgency Check
        urgency_count = sum(1 for k in URGENCY_KEYWORDS if k in text_lower)
        if urgency_count > 0:
            score += 0.3 + (0.1 * urgency_count)
            keywords_found.append("Sense of urgency")

        # Financial Check
        fin_count = sum(1 for k in FINANCIAL_KEYWORDS if k in text_lower)
        if fin_count > 0:
            score += 0.2
            keywords_found.append("Financial request")

        # Formatting/Grammar (Simple heuristics)
        if "dear customer" in text_lower or "dear user" in text_lower:
            score += 0.2
            keywords_found.append("Generic greeting")

        # Credentials harvesting
        if any(k in text_lower for k in ["password", "login", "sign in", "credential", "update account"]):
            # Context matters, but usually asking for credentials in email body is sus
            score += 0.1
            keywords_found.append("Credential request")

        return {
            "score": min(score, 1.0),
            "reasons": keywords_found
        }

email_analyzer = EmailAnalyzer()
