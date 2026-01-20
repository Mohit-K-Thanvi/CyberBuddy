import joblib
import re
import numpy as np
from app.ml.hybrid_engine import hybrid_decision

# Path must match where the server is running (backend root)
MODEL_PATH = "app/ml/models/url_text_model.pkl"
model = joblib.load(MODEL_PATH)


def clean_url(url: str) -> str:
    """Same preprocessing as used in training (train.py)."""
    url = url.lower()
    url = re.sub(r"https?://", "", url)
    url = re.sub(r"www\.", "", url)
    return url


def predict_url(url: str):
    """
    Predicts if a URL is phishing or legitimate using the loaded TF-IDF pipeline
    AND a hybrid heuristic engine.
    """
    cleaned_url = clean_url(url)

    # The pipeline expects a list/iterable of strings
    X = [cleaned_url]

    # Get probabilities for both classes [prob_legit, prob_phishing]
    # We want probability of being PHISHING (class 1) usually, or max confidence.
    # The hybrid engine expects 'ml_pred' (0 or 1) and 'ml_conf' (float 0-1).
    proba_all = model.predict_proba(X)[0]
    pred = int(model.predict(X)[0])
    conf = float(np.max(proba_all))

    # Use hybrid engine for final decision
    final_label, final_conf, reasons = hybrid_decision(url, pred, conf)

    return {
        "prediction": final_label,
        "confidence": final_conf,
        "message": "; ".join(reasons)
    }
