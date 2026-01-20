from pydantic import BaseModel
from typing import Optional, List

class AIScanRequest(BaseModel):
    text: str
    source: Optional[str] = "user"  # web | extension | api

class AIScanResponse(BaseModel):
    risk_score: int
    verdict: str
    categories: List[str]
    explanation: str
