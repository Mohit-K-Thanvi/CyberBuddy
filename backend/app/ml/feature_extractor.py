import re
from urllib.parse import urlparse

SENSITIVE_WORDS = [
    "login", "verify", "update", "secure",
    "account", "bank", "free", "confirm"
]

def extract_features(url: str) -> dict:
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""

    features = {}

    # -------- BASIC STRUCTURE --------
    features["NumDots"] = hostname.count(".")
    features["SubdomainLevel"] = max(features["NumDots"] - 1, 0)
    features["PathLevel"] = path.count("/")
    features["UrlLength"] = len(url)
    features["HostnameLength"] = len(hostname)
    features["PathLength"] = len(path)
    features["QueryLength"] = len(query)

    # -------- SYMBOL COUNTS --------
    features["NumDash"] = url.count("-")
    features["NumDashInHostname"] = hostname.count("-")
    features["AtSymbol"] = 1 if "@" in url else 0
    features["TildeSymbol"] = 1 if "~" in url else 0
    features["NumUnderscore"] = url.count("_")
    features["NumPercent"] = url.count("%")
    features["NumAmpersand"] = url.count("&")
    features["NumHash"] = url.count("#")

    # -------- SECURITY SIGNALS --------
    features["NoHttps"] = 0 if parsed.scheme == "https" else 1
    features["IpAddress"] = 1 if re.match(r"\d+\.\d+\.\d+\.\d+", hostname or "") else 0
    features["RandomString"] = 1 if re.search(r"[a-zA-Z0-9]{15,}", url) else 0

    # -------- CONTENT SIGNALS --------
    features["NumNumericChars"] = sum(c.isdigit() for c in url)
    features["NumQueryComponents"] = query.count("=")
    features["DoubleSlashInPath"] = 1 if "//" in path else 0

    features["NumSensitiveWords"] = sum(
        word in url.lower() for word in SENSITIVE_WORDS
    )

    # -------- BINARY HEURISTICS (dataset-style encoding) --------
    features["IframeOrFrame"] = -1
    features["RightClickDisabled"] = -1
    features["PopUpWindow"] = -1
    features["SubmitInfoToEmail"] = -1
    features["FakeLinkInStatusBar"] = -1
    features["ImagesOnlyInForm"] = -1

    return features
