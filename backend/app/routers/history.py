from fastapi import APIRouter, Depends, HTTPException

from backend.app.auth import verify_access_token
from backend.app.core.security import oauth2_scheme
from backend.app.services.history_service import (
    fetch_user_history,
    delete_user_history,
)

router = APIRouter()


@router.get("/history")
def get_history(
    token: str = Depends(oauth2_scheme)
):
    """
    Retrieves detection history for the authenticated user.
    """
    current_user = verify_access_token(token)

    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    user_id = current_user["user_id"]
    return fetch_user_history(user_id)


@router.delete("/history")
def clear_history(
    token: str = Depends(oauth2_scheme)
):
    """
    Clears all detection history records for the authenticated user.
    """
    current_user = verify_access_token(token)

    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    user_id = current_user["user_id"]
    return delete_user_history(user_id)
