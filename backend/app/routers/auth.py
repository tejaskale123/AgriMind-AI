import sqlite3
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from backend.app.auth import (
    create_user,
    authenticate_user,
    create_access_token,
)
from backend.app.core.config import DATABASE_PATH
from backend.app.core.security import get_current_user
from backend.app.schemas.auth import RegisterRequest, LoginRequest

router = APIRouter()


# ============================================================
# REGISTER API
# ============================================================

@router.post("/auth/register")
def register(
    data: RegisterRequest
):
    if len(data.full_name.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid full name."
        )

    if len(data.password) < 6:
        raise HTTPException(
            status_code=400,
            detail=(
                "Password must contain at least "
                "6 characters."
            )
        )

    result = create_user(
        full_name=data.full_name,
        email=data.email,
        password=data.password
    )

    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )

    return {
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "id": result["user_id"],
            "full_name": result["full_name"],
            "email": result["email"]
        }
    }


# ============================================================
# OAUTH2 TOKEN API
# Used by Swagger UI "Authorize" button.
# ============================================================

@router.post("/auth/token")
def oauth2_login(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = authenticate_user(
        email=form_data.username,
        password=form_data.password
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    access_token = create_access_token(
        user_id=user["id"],
        email=user["email"]
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ============================================================
# LOGIN API
# Frontend JSON login endpoint.
# ============================================================

@router.post("/auth/login")
def login(
    data: LoginRequest
):
    user = authenticate_user(
        email=data.email,
        password=data.password
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    access_token = create_access_token(
        user_id=user["id"],
        email=user["email"]
    )

    return {
        "success": True,
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "created_at": user["created_at"]
        }
    }


# ============================================================
# GET CURRENT USER API (/auth/me)
# ============================================================

@router.get("/auth/me")
def get_me(
    current_user = Depends(
        get_current_user
    )
):
    user_id = current_user["user_id"]
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute(
        """
        SELECT id, full_name, email, created_at, avatar
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    )
    db_user = cursor.fetchone()
    connection.close()

    if not db_user:
        return {
            "success": True,
            "user": {
                "id": user_id,
                "email": current_user.get("email"),
                "full_name": "Farmer",
                "created_at": datetime.now().isoformat(),
                "role": "Farmer",
                "status": "Active"
            }
        }

    return {
        "success": True,
        "user": {
            "id": db_user["id"],
            "user_id": db_user["id"],
            "userId": f"#AGM-{db_user['id']:04d}",
            "full_name": db_user["full_name"] or "Farmer",
            "email": db_user["email"],
            "created_at": db_user["created_at"],
            "avatar": db_user["avatar"] or "/images/farmer_avatar.jpg",
            "role": "Farmer",
            "status": "Active",
            "accountType": "Farmer"
        }
    }
