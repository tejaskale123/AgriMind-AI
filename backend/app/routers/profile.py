import sqlite3
from fastapi import APIRouter, Depends, HTTPException

from backend.app.core.config import DATABASE_PATH
from backend.app.core.security import get_current_user
from backend.app.schemas.profile import ProfileUpdateRequest

router = APIRouter()


# ============================================================
# UPDATE PROFILE API (/auth/profile)
# ============================================================

@router.put("/auth/profile")
def update_profile(
    data: ProfileUpdateRequest,
    current_user = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    new_name = data.full_name.strip()
    if len(new_name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Full name must be at least 2 characters."
        )

    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    if data.avatar:
        cursor.execute(
            """
            UPDATE users
            SET full_name = ?, avatar = ?
            WHERE id = ?
            """,
            (new_name, data.avatar, user_id)
        )
    else:
        cursor.execute(
            """
            UPDATE users
            SET full_name = ?
            WHERE id = ?
            """,
            (new_name, user_id)
        )

    connection.commit()

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
    updated_user = cursor.fetchone()
    connection.close()

    return {
        "success": True,
        "message": "Profile updated successfully.",
        "user": {
            "id": updated_user["id"],
            "user_id": updated_user["id"],
            "userId": f"#AGM-{updated_user['id']:04d}",
            "full_name": updated_user["full_name"],
            "email": updated_user["email"],
            "created_at": updated_user["created_at"],
            "avatar": updated_user["avatar"] or "/images/farmer_avatar.jpg",
            "role": "Farmer",
            "status": "Active",
            "accountType": "Farmer"
        }
    }
