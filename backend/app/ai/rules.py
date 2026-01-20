import re

PHISHING_PATTERNS = [
    r"verify your account",
    r"login immediately",
    r"password expired",
]

COMMAND_PATTERNS = [
    r"rm\s+-rf",
    r"curl\s+.*\|\s*sh",
    r"base64\s+-d",
]

def analyze_rules(text: str):
    hits = []
    lowered = text.lower()

    for p in PHISHING_PATTERNS:
        if re.search(p, lowered):
            hits.append("phishing")

    for p in COMMAND_PATTERNS:
        if re.search(p, lowered):
            hits.append("dangerous_command")

    return list(set(hits))
