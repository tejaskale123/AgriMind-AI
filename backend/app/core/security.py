from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from backend.app.auth import verify_access_token


# ============================================================
# OAUTH2 SECURITY SCHEME & DEPENDENCY
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)


def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    """
    FastAPI security dependency that extracts and verifies the bearer token.
    Returns authenticated user payload dictionary or raises HTTP 401.
    """
    user_data = verify_access_token(token)

    if user_data is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    return user_data
