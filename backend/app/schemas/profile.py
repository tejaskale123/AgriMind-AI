from typing import Optional
from pydantic import BaseModel


# ============================================================
# PROFILE SCHEMAS
# ============================================================

class ProfileUpdateRequest(BaseModel):
    full_name: str
    email: Optional[str] = None
    avatar: Optional[str] = None
