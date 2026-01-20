from app.ai.rules import analyze_rules
from app.ai.features import extract_features

def run_ai_engine(text: str):
    categories = analyze_rules(text)
    features = extract_features(text)

    risk_score = 5

    # Rule-based impact
    if categories:
        risk_score += len(categories) * 20

    # Feature-based impact
    if features["is_shortened"]:
        risk_score += 15
        categories.append("shortened_url")

    if features["has_ip"]:
        risk_score += 25
        categories.append("ip_url")

    if features["url_entropy"] > 4:
        risk_score += 20
        categories.append("obfuscated_url")

    verdict = "Safe" if risk_score < 30 else "Suspicious"

    return {
        "risk_score": min(100, risk_score),
        "verdict": verdict,
        "categories": list(set(categories)),
        "explanation": f"Analysis based on rules + URL features"
    }
