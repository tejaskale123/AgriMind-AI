# ============================================================
# AGRIMIND AI
# AUTHENTICATION MODULE
# REGISTER + LOGIN + JWT
# ============================================================

from pathlib import Path
from datetime import datetime, timedelta
import sqlite3
import os

import bcrypt

from jose import JWTError, jwt
from dotenv import load_dotenv


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ENV_PATH = PROJECT_ROOT / ".env"

load_dotenv(ENV_PATH)


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "change-this-secret-key"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# ============================================================
# DATABASE
# ============================================================

DATABASE_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "agrimind_history.db"
)


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:

    password_bytes = password.encode(
        "utf-8"
    )

    salt = bcrypt.gensalt()

    hashed_password = bcrypt.hashpw(
        password_bytes,
        salt
    )

    return hashed_password.decode(
        "utf-8"
    )


# ============================================================
# PASSWORD VERIFICATION
# ============================================================

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# ============================================================
# CREATE USER
# ============================================================

def create_user(
    full_name: str,
    email: str,
    password: str
):

    email = email.strip().lower()

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    cursor = connection.cursor()

    # --------------------------------------------------------
    # Check existing user
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:

        connection.close()

        return {
            "success": False,
            "message": "Email already registered."
        }


    # --------------------------------------------------------
    # Hash password
    # --------------------------------------------------------

    password_hash = hash_password(
        password
    )


    # --------------------------------------------------------
    # Save user
    # --------------------------------------------------------

    cursor.execute(
        """
        INSERT INTO users
        (
            full_name,
            email,
            password_hash,
            created_at
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            full_name.strip(),
            email,
            password_hash,
            datetime.now().isoformat()
        )
    )

    connection.commit()

    user_id = cursor.lastrowid

    connection.close()


    return {
        "success": True,
        "user_id": user_id,
        "full_name": full_name.strip(),
        "email": email
    }


# ============================================================
# GET USER BY EMAIL
# ============================================================

def get_user_by_email(email: str):

    email = email.strip().lower()

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            full_name,
            email,
            password_hash,
            created_at
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    user = cursor.fetchone()

    connection.close()

    return user


# ============================================================
# LOGIN USER
# ============================================================

def authenticate_user(
    email: str,
    password: str
):

    user = get_user_by_email(
        email
    )

    if user is None:

        return None


    password_valid = verify_password(
        password,
        user["password_hash"]
    )

    if not password_valid:

        return None


    return user


# ============================================================
# CREATE JWT TOKEN
# ============================================================

def create_access_token(
    user_id: int,
    email: str
):

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {

        "sub": str(user_id),

        "email": email,

        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# ============================================================
# VERIFY JWT TOKEN
# ============================================================

def verify_access_token(
    token: str
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get(
            "sub"
        )

        email = payload.get(
            "email"
        )

        if user_id is None:

            return None

        return {
            "user_id": int(user_id),
            "email": email
        }

    except JWTError:

        return None