import sqlite3
import json
from datetime import datetime
from backend.app.core.config import DATABASE_PATH


# ============================================================
# DATABASE CONNECTION HELPER
# ============================================================

def get_db_connection():
    """
    Returns a sqlite3 database connection configured with sqlite3.Row factory.
    """
    DATABASE_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


# ============================================================
# INITIALIZE DATABASE & MIGRATIONS
# ============================================================

def init_database():
    """
    Initializes the SQLite database tables (users, detection_history, user_settings)
    and executes schema migrations safely without altering existing data.
    """
    DATABASE_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            created_at TEXT NOT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS detection_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            filename TEXT NOT NULL,
            crop TEXT NOT NULL,
            prediction TEXT NOT NULL,
            confidence REAL NOT NULL,
            probabilities TEXT NOT NULL,
            severity TEXT,
            symptoms TEXT,
            treatment TEXT,
            prevention TEXT,
            farmer_action TEXT,
            created_at TEXT NOT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_settings (
            user_id INTEGER PRIMARY KEY,
            confidence_threshold INTEGER DEFAULT 70,
            auto_history INTEGER DEFAULT 1,
            show_probabilities INTEGER DEFAULT 1,
            notifications INTEGER DEFAULT 1,
            language TEXT DEFAULT 'English',
            theme TEXT DEFAULT 'Light',
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """
    )

    existing_user_columns = {
        row[1]
        for row in cursor.execute(
            "PRAGMA table_info(users)"
        ).fetchall()
    }

    if "full_name" not in existing_user_columns:
        cursor.execute(
            """
            ALTER TABLE users
            ADD COLUMN full_name TEXT
            """
        )

    if "avatar" not in existing_user_columns:
        cursor.execute(
            """
            ALTER TABLE users
            ADD COLUMN avatar TEXT
            """
        )

    existing_columns = {
        row[1]
        for row in cursor.execute(
            "PRAGMA table_info(detection_history)"
        ).fetchall()
    }

    if "user_id" not in existing_columns:
        cursor.execute(
            """
            ALTER TABLE detection_history
            ADD COLUMN user_id INTEGER
            """
        )

    new_columns = {
        "severity": "TEXT",
        "symptoms": "TEXT",
        "treatment": "TEXT",
        "prevention": "TEXT",
        "farmer_action": "TEXT",
    }

    for column_name, column_type in new_columns.items():
        if column_name not in existing_columns:
            cursor.execute(
                f"""
                ALTER TABLE detection_history
                ADD COLUMN {column_name} {column_type}
                """
            )

    connection.commit()
    connection.close()

    print("Database initialized successfully.")


# ============================================================
# SAVE DETECTION HISTORY
# ============================================================

def save_detection_history(
    user_id,
    filename,
    crop,
    prediction,
    confidence,
    probabilities,
    recommendation,
):
    """
    Saves a disease detection record into the detection_history table.
    """
    connection = sqlite3.connect(
        DATABASE_PATH
    )

    cursor = connection.cursor()

    recommendation = recommendation or {}

    severity = recommendation.get("severity")

    symptoms = json.dumps(
        recommendation.get("symptoms", []),
        ensure_ascii=False
    )

    treatment = json.dumps(
        recommendation.get("treatment", []),
        ensure_ascii=False
    )

    prevention = json.dumps(
        recommendation.get("prevention", []),
        ensure_ascii=False
    )

    farmer_action = recommendation.get("farmer_action")

    cursor.execute(
        """
        INSERT INTO detection_history
        (
            user_id,
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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            filename,
            crop,
            prediction,
            confidence,
            json.dumps(
                probabilities,
                ensure_ascii=False
            ),
            severity,
            symptoms,
            treatment,
            prevention,
            farmer_action,
            datetime.now().isoformat(),
        )
    )

    connection.commit()
    connection.close()
