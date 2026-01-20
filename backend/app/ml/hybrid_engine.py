from urllib.parse import urlparse
import re

# Small trusted domains list (can be expanded)
TRUSTED_DOMAINS = [
    "google.com", "github.com", "amazon.com",
    "microsoft.com", "apple.com", "youtube.com"
]

def heuristic_score(url: str) -> float:
    score = 0.0

    if not url.startswith("https"):
        score += 0.2

    if re.search(r"\d+\.\d+\.\d+\.\d+", url):
        score += 0.4  # IP-based URL

    if len(url) > 75:
        score += 0.2

    if url.count("-") > 3:
        score += 0.2

    return min(score, 1.0)

def is_trusted_domain(url: str) -> bool:
    domain = urlparse(url).netloc.replace("www.", "")
    return domain in TRUSTED_DOMAINS

from app.services.virustotal import check_url_virustotal

def hybrid_decision(url: str, ml_pred: int, ml_conf: float):
    # Returns: (prediction, confidence, list_of_reasons)
    heur = heuristic_score(url)
    trusted = is_trusted_domain(url)
    reasons = []

    # 1. Trusted Domain Override
    if trusted:
        return "legitimate", max(0.95, ml_conf), ["Verified trusted domain"]

    # 2. VirusTotal Check (The Industry Standard Check)
    # Note: Free API has limits, in production this would be queued or cached
    vt_score, vt_total, _ = check_url_virustotal(url)
    if vt_score > 0:
        reasons.append(f"Flagged by {vt_score} security vendors on VirusTotal")
        return "phishing", 1.0, reasons

    # 3. Gather Local Reasons
    if heur > 0.4:
        reasons.append("Suspicious URL structure")
    
    if ml_pred == 1:
        reasons.append("AI model detected phishing patterns")
    
    # 4. Decision Logic
    if (ml_pred == 1 and ml_conf >= 0.70) or (heur >= 0.6):
        if not reasons: reasons.append("Matched phishing heuristics")
        return "phishing", max(ml_conf, heur), reasons

    # Suspicious
    if (0.45 <= ml_conf < 0.70) or (heur >= 0.2):
        if not reasons: reasons.append("Low trust score")
        score = 0.5 + (heur / 2)
        return "suspicious", round(min(score, 0.85), 2), reasons

    # Legitimate
    return "legitimate", ml_conf, ["Safe structure", "No threats found"]
