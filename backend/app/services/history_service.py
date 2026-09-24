import json
import sqlite3
from backend.app.core.config import DATABASE_PATH
from backend.app.services.recommendation_service import find_recommendation



# ============================================================
# HISTORY BUSINESS & DATA LOGIC
# ============================================================

def fetch_user_history(user_id: int):
    """
    Fetches all past detection history records for the authenticated user,
    ordered by most recent first, with attached recommendation data.
    """
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            filename,
            crop,
            prediction,
            confidence,
            probabilities,
            severity,
            symptoms,
            treatment,
            prevention,
            farmer_action,
            created_at
        FROM detection_history
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    )

    rows = cursor.fetchall()
    connection.close()

    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "filename": row["filename"],
            "crop": row["crop"],
            "prediction": row["prediction"],
            "confidence": row["confidence"],
            "probabilities": row["probabilities"],
            "recommendation": find_recommendation(row["prediction"]),
            "created_at": row["created_at"],
        })

    return {
        "success": True,
        "count": len(history),
        "history": history,
    }


def delete_user_history(user_id: int):
    """
    Deletes all detection history records belonging to the authenticated user.
    """
    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM detection_history
        WHERE user_id = ?
        """,
        (user_id,)
    )

    deleted_count = cursor.rowcount
    connection.commit()
    connection.close()

    return {
        "success": True,
        "message": "Your detection history cleared successfully.",
        "deleted_count": deleted_count,
    }
