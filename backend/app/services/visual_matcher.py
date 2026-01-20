import json
import os

# Load the hash database
HASH_DB_PATH = "resources/imgs.json"
HASH_DB = {}

if os.path.exists(HASH_DB_PATH):
    with open(HASH_DB_PATH, 'r') as f:
        HASH_DB = json.load(f)

def match_image_hash(upload_sha256: str):
    """
    Checks if an uploaded image hash matches known brand logos/screens.
    In a real industry app, we'd map these hashes to 'Target Brands' (e.g., PayPal Login).
    If we see the PayPal Login hash but the domain is NOT PayPal, it's a phishing attack.
    """
    for filename, hashes in HASH_DB.items():
        if hashes.get("sha256") == upload_sha256:
            # Found a match!
            # For this demo, we assume the DB contains "Known Brand Assets".
            # The filenames often give a clue (or we'd need a mapping file).
            return {
                "match": True,
                "file": filename,
                "confidence": 1.0
            }
    return {"match": False}
