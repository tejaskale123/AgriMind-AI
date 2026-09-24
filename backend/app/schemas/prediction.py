from typing import Optional, Dict, Any
from pydantic import BaseModel


# ============================================================
# PREDICTION SCHEMAS
# ============================================================

class PredictionResponse(BaseModel):
    success: bool
    crop: str
    filename: str
    prediction: str
    confidence: float
    confidence_level: Optional[str] = None
    probabilities: Optional[Dict[str, float]] = None
    recommendation: Optional[Dict[str, Any]] = None
    warning: Optional[str] = None
