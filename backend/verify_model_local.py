import joblib
from app.ml.predictor import clean_url, hybrid_decision
import numpy as np

try:
    model = joblib.load("app/ml/models/url_text_model.pkl")
    urls = [
        "https://google.com", 
        "http://secure-login-update-account.com",
        "http://192.168.1.1/login"
    ]
    print("Direct Model Verification:")
    for u in urls:
        cleaned = clean_url(u)
        X = [cleaned]
        proba_all = model.predict_proba(X)[0]
        pred = int(model.predict(X)[0])
        conf = float(np.max(proba_all))
        
        # Also test hybrid
        final_label, final_conf = hybrid_decision(u, pred, conf)
        
        print(f"URL: {u}")
        print(f"  ML Raw: Pred={pred}, Conf={conf:.4f}")
        print(f"  Hybrid: {final_label} ({final_conf:.4f})")
        print("-" * 20)
        
except Exception as e:
    print(e)
