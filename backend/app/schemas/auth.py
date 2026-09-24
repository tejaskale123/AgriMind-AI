from pydantic import BaseModel


# ============================================================
# AUTHENTICATION SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str
