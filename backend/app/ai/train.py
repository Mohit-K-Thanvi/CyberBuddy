import pandas as pd
import numpy as np
import re
import math
import joblib

from urllib.parse import urlparse
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import FeatureUnion
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.metrics import classification_report

class URLFeatureExtractor(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, urls):
        features = []
        for url in urls:
            parsed = urlparse(url)
            hostname = parsed.hostname or ""
            path = parsed.path or ""

            features.append([
                len(url),
                hostname.count('.'),
                hostname.count('-'),
                1 if re.match(r"\d+\.\d+\.\d+\.\d+", hostname) else 0,
                1 if url.startswith("https") else 0,
                self._entropy(url),
                len(path),
                sum(c.isdigit() for c in url),
            ])
        return np.array(features)

    def _entropy(self, s):
        prob = [float(s.count(c)) / len(s) for c in set(s)]
        return -sum(p * math.log2(p) for p in prob)


import pathlib
BASE_DIR = pathlib.Path(__file__).parent.resolve()
PROJECT_ROOT = BASE_DIR.parents[2] 
DATA_PATH = PROJECT_ROOT / "cyberbuddy_urls_v1.csv"

print(f"[+] Loading dataset from {DATA_PATH}...")
if not DATA_PATH.exists():
    raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

df = pd.read_csv(DATA_PATH)

X = df["url"]
y = df["label"]

tfidf = TfidfVectorizer(
    analyzer="char",
    ngram_range=(3, 5),
    min_df=5,
    max_features=5000
)

url_features = URLFeatureExtractor()

features = FeatureUnion([
    ("tfidf", tfidf),
    ("url_features", url_features)
])

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=25,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced"
)


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("[+] Training model...")
X_train_features = features.fit_transform(X_train)
model.fit(X_train_features, y_train)

X_test_features = features.transform(X_test)
y_pred = model.predict(X_test_features)

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))

# -----------------------------
# SAVE MODEL
# -----------------------------
# Save to backend/app/ml/models/hybrid_url_model.pkl
# BASE_DIR is backend/app/ai -> parent is backend/app -> ml/models
MODEL_DIR = BASE_DIR.parent / "ml" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "hybrid_url_model.pkl"

joblib.dump(
    {
        "model": model,
        "features": features
    },
    MODEL_PATH
)

print(f"\n✅ Hybrid model saved at {MODEL_PATH}")
