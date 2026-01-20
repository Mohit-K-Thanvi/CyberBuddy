import pandas as pd
import re
import joblib
import random
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import os
import pathlib

# -------------------- CONFIG -------------------- #
BASE_DIR = pathlib.Path(__file__).parent.resolve()
PROJECT_ROOT = BASE_DIR.parent.parent  # backend/

TRANC0_PATH = PROJECT_ROOT / "data" / "tranco_NN24W.csv"
MODEL_PATH = BASE_DIR / "models" / "url_text_model.pkl"

# Ensure output directory exists
MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

# -------------------- SYNTHETIC DATA GENERATOR -------------------- #
# Since we lack a "Raw Phishing URL" dataset (phishing.csv is features-only),
# we generates synthetic phishing URLs to train the model on patterns.

PHISHING_KEYWORDS = [
    "secure", "login", "account", "update", "verify", "banking", 
    "paypal", "apple-id", "google-docs", "microsoft-online",
    "wallet", "crypto", "binance", "coinbase", "support",
    "admin", "billing", "invoice", "confirm", "safe"
]

TLDS = [".com", ".net", ".org", ".xyz", ".top", ".info"]

def generate_phishing_url(base_domain):
    """Creates a fake phishing URL from a legit domain."""
    strategy = random.choice(["prefix", "subdomain", "ip", "path", "typo"])
    
    clean = base_domain.split('.')[0]
    keyword = random.choice(PHISHING_KEYWORDS)
    tld = random.choice(TLDS)

    if strategy == "prefix":
        return f"{keyword}-{clean}{tld}"
    elif strategy == "subdomain":
        return f"{keyword}.{clean}{tld}"
    elif strategy == "ip":
        ip = f"{random.randint(10,200)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(0,255)}"
        return f"http://{ip}/{keyword}/{clean}"
    elif strategy == "path":
        return f"{clean}{tld}/{keyword}/login.php"
    elif strategy == "typo":
        # simple typo: double a letter
        if len(clean) > 2:
            idx = random.randint(0, len(clean)-1)
            typo = clean[:idx] + clean[idx] + clean[idx:]
            return f"{typo}{tld}"
        return f"{clean}-secure{tld}"
    
    return f"{keyword}-{clean}.com"

# -------------------- LOAD & PREPARE DATA -------------------- #
print("[+] Loading Tranco (Legitimate)...")
try:
    # Read top 20k legitimate sites
    tranco = pd.read_csv(TRANC0_PATH, nrows=20000, header=None)
    # Tranco format is rank,domain. We want column 1.
    legit_urls = tranco.iloc[:, 1].dropna().astype(str).tolist()
    print(f"    Loaded {len(legit_urls)} legitimate URLs.")
except Exception as e:
    print(f"Error loading Tranco: {e}")
    exit(1)

print("[+] Generating Synthetic Phishing Data...")
# Generate an equal amount of phishing URLs
phishing_urls = [generate_phishing_url(url) for url in legit_urls]
print(f"    Generated {len(phishing_urls)} synthetic phishing URLs.")

# Create DataFrame
df_legit = pd.DataFrame({"url": legit_urls, "label": 0})
df_phish = pd.DataFrame({"url": phishing_urls, "label": 1})

data = pd.concat([df_legit, df_phish])

# Check for custom user dataset
CUSTOM_DATA_PATH = PROJECT_ROOT.parent / "cyberbuddy_urls_v1.csv"
if CUSTOM_DATA_PATH.exists():
    print(f"[+] Found custom dataset: {CUSTOM_DATA_PATH}")
    try:
        df_custom = pd.read_csv(CUSTOM_DATA_PATH)
        # Ensure it has 'url' and 'label'
        if {'url', 'label'}.issubset(df_custom.columns):
             # Ensure labels are integers
             df_custom['label'] = pd.to_numeric(df_custom['label'], errors='coerce').fillna(1).astype(int)
             print(f"    Merging {len(df_custom)} custom samples...")
             data = pd.concat([data, df_custom])
        else:
             print("    [!] Custom dataset missing 'url' or 'label' columns. Skipping.")
    except Exception as e:
        print(f"    [!] Error reading custom dataset: {e}")

data = data.sample(frac=1, random_state=42).reset_index(drop=True)

# -------------------- PREPROCESSING -------------------- #
def clean_url_for_model(url: str) -> str:
    # Keep some structure but remove protocol/www for better TF-IDF generalization
    # We WANT to keep slashes and dots for the vectorizer to see them as tokens if using char analyzer
    url = url.lower()
    url = re.sub(r"https?://", "", url)
    url = re.sub(r"www\.", "", url)
    return url

print("[+] Preprocessing...")
X = data["url"].apply(clean_url_for_model)
y = data["label"]

# -------------------- SPLIT & TRAIN -------------------- #
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("[+] Training Model (TF-IDF + RandomForest)...")

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        analyzer="char",       # Character n-grams capture sub-word patterns well
        ngram_range=(3, 5),    # 3-5 chars (e.g., "pay", "pal", "ypa", ".co")
        min_df=3,
        max_features=10000     # Limit features to keep model smallish
    )),
    ("clf", RandomForestClassifier(
        n_estimators=50,       # Fast but decent
        n_jobs=-1,
        random_state=42
    ))
])

pipeline.fit(X_train, y_train)

# -------------------- EVALUATION -------------------- #
print("\n[+] Evaluation:")
score = pipeline.score(X_test, y_test)
print(f"    Accuracy: {score*100:.2f}%")

y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))

# -------------------- SAVE -------------------- #
joblib.dump(pipeline, MODEL_PATH)
print(f"\n✅ Model saved to {MODEL_PATH}")
