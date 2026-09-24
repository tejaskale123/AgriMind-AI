from typing import Optional
from pydantic import BaseModel


# ============================================================
# USER SETTINGS SCHEMAS
# ============================================================

class UserSettingsPayload(BaseModel):
    confidence_threshold: Optional[int] = 70
    auto_history: Optional[bool] = True
    show_probabilities: Optional[bool] = True
    notifications: Optional[bool] = True
    language: Optional[str] = "English"
    theme: Optional[str] = "Light"
