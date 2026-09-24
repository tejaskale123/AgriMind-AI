import sqlite3
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException

from backend.app.core.config import DATABASE_PATH
from backend.app.core.security import get_current_user
from backend.app.schemas.settings import UserSettingsPayload

router = APIRouter()


# ============================================================
# USER SETTINGS PERSISTENCE ENDPOINTS
# ============================================================

@router.get("/settings")
def get_user_settings(current_user = Depends(get_current_user)):
    user_id = current_user["user_id"]
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT confidence_threshold, auto_history, show_probabilities, notifications, language, theme, updated_at
        FROM user_settings
        WHERE user_id = ?
        """,
        (user_id,)
    )
    row = cursor.fetchone()
    connection.close()

    if not row:
        return {
            "success": True,
            "settings": {
                "confidenceThreshold": 70,
                "autoHistory": True,
                "showProbabilities": True,
                "notifications": True,
                "language": "English",
                "theme": "Light",
            }
        }

    return {
        "success": True,
        "settings": {
            "confidenceThreshold": row["confidence_threshold"],
            "autoHistory": bool(row["auto_history"]),
            "showProbabilities": bool(row["show_probabilities"]),
            "notifications": bool(row["notifications"]),
            "language": row["language"] or "English",
            "theme": row["theme"] or "Light",
            "updatedAt": row["updated_at"]
        }
    }


@router.put("/settings")
def save_user_settings(
    payload: UserSettingsPayload,
    current_user = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    threshold = max(50, min(95, payload.confidence_threshold or 70))
    now_iso = datetime.now().isoformat()

    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO user_settings (
            user_id, confidence_threshold, auto_history, show_probabilities,
            notifications, language, theme, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            confidence_threshold = excluded.confidence_threshold,
            auto_history = excluded.auto_history,
            show_probabilities = excluded.show_probabilities,
            notifications = excluded.notifications,
            language = excluded.language,
            theme = excluded.theme,
            updated_at = excluded.updated_at
        """,
        (
            user_id,
            threshold,
            1 if payload.auto_history else 0,
            1 if payload.show_probabilities else 0,
            1 if payload.notifications else 0,
            payload.language or "English",
            payload.theme or "Light",
            now_iso
        )
    )
    connection.commit()
    connection.close()

    return {
        "success": True,
        "message": "Settings updated and persisted successfully.",
        "settings": {
            "confidenceThreshold": threshold,
            "autoHistory": payload.auto_history,
            "showProbabilities": payload.show_probabilities,
            "notifications": payload.notifications,
            "language": payload.language,
            "theme": payload.theme,
            "updatedAt": now_iso
        }
    }
