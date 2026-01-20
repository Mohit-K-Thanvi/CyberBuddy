from fastapi import APIRouter, HTTPException
from app.ai.predictor import predict_phishing

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/predict")
def predict(payload: dict):
    try:
        result = predict_phishing(payload)
        return {
            "status": "success",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
