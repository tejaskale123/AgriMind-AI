from pathlib import Path
import sqlite3
import json
from datetime import datetime
import io

import torch
import torch.nn as nn

from PIL import Image, ImageStat
from torchvision import models, transforms

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse

from pydantic import BaseModel, EmailStr

from fastapi.middleware.cors import CORSMiddleware

from .auth import (
    create_user,
    authenticate_user,
    create_access_token,
    verify_access_token,
)
from .claude_service import stream_claude_recommendation


# ============================================================
# AGRIMIND AI
# FASTAPI + MULTI-CROP DISEASE PREDICTION API
# ============================================================


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATABASE_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "agrimind_history.db"
)

RECOMMENDATION_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "disease_recommendations.json"
)


# ============================================================
# AGRIMIND AI
# MULTI-CROP MODEL CONFIGURATION
# ============================================================

MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "cotton_9class_efficientnet_b0.pth"
)

SOYBEAN_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "soybean_efficientnet_b0.pth"
)

MAIZE_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "maize_efficientnet_b0.pth"
)
WHEAT_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "wheat_efficientnet_b0.pth"
)

COTTON_CLASSES = [
    "Alternaria Leaf Spot",
    "Anthracnose",
    "Bacterial Blight",
    "Boll Rot",
    "Cercospora Leaf Spot",
    "Fusarium Wilt",
    "Grey Areolate Mildew",
    "Healthy Leaf",
    "Verticillium Wilt",
]
SOYBEAN_CLASSES = [
    "Bacterial_Blight",
    "Cercospora_Leaf_Blight",
    "Healthy",
    "Rust",
    "Sudden_Death_Syndrome",
]

MAIZE_CLASSES = [
    "Blight",
    "Common_Rust",
    "Gray_Leaf_Spot",
    "Healthy",
]
WHEAT_CLASSES = [
    "Brown_Rust",
    "Healthy",
    "Yellow_Rust",
]
MODEL_PATHS = {
    "cotton": MODEL_PATH,
    "soybean": SOYBEAN_MODEL_PATH,
    "maize": MAIZE_MODEL_PATH,
    "wheat": WHEAT_MODEL_PATH,
}

CROP_CLASSES = {
    "cotton": COTTON_CLASSES,
    "soybean": SOYBEAN_CLASSES,
    "maize": MAIZE_CLASSES,
    "wheat": WHEAT_CLASSES,
}


# ============================================================
# MODEL CONFIGURATION
# ============================================================

IMAGE_SIZE = 224


# ============================================================
# IMAGE QUALITY CONFIGURATION
# ============================================================

MIN_IMAGE_WIDTH = 224
MIN_IMAGE_HEIGHT = 224

MIN_BRIGHTNESS = 25
MAX_BRIGHTNESS = 235

MIN_CONTRAST = 15

MIN_CONFIDENCE = 70.0


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# IMAGE TRANSFORM
# MUST MATCH TRAINING / INFERENCE
# ============================================================

IMAGE_TRANSFORM = transforms.Compose(
    [
        transforms.Resize(
            (IMAGE_SIZE, IMAGE_SIZE)
        ),

        transforms.ToTensor(),
        transforms.Normalize(
            mean=[
                0.485,
                0.456,
                0.406,
            ],

            std=[
                0.229,
                0.224,
                0.225,
            ],
        ),
    ]
)


# ============================================================
# HISTORY DATABASE
# ============================================================

def init_database():

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

    print(
        "Database initialized successfully."
    )


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

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    cursor = connection.cursor()

    recommendation = recommendation or {}

    severity = recommendation.get(
        "severity"
    )

    symptoms = json.dumps(
        recommendation.get(
            "symptoms",
            []
        ),
        ensure_ascii=False
    )

    treatment = json.dumps(
        recommendation.get(
            "treatment",
            []
        ),
        ensure_ascii=False
    )

    prevention = json.dumps(
        recommendation.get(
            "prevention",
            []
        ),
        ensure_ascii=False
    )

    farmer_action = recommendation.get(
        "farmer_action"
    )

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

# ============================================================
# DISEASE RECOMMENDATIONS
# ============================================================

def load_recommendations():

    if not RECOMMENDATION_PATH.exists():

        print(
            f"WARNING: Recommendation file not found:\n"
            f"{RECOMMENDATION_PATH}"
        )

        return {}

    try:

        with open(
            RECOMMENDATION_PATH,
            "r",
            encoding="utf-8"
        ) as file:

            recommendations = json.load(file)

        print(
            "Disease recommendations loaded successfully."
        )

        return recommendations

    except Exception as error:

        print(
            f"ERROR loading recommendations: {error}"
        )

        return {}


DISEASE_RECOMMENDATIONS = (
    load_recommendations()
)


# ============================================================
# FIND DISEASE RECOMMENDATION
# Handles spaces, underscores, hyphens and case differences
# ============================================================

def find_recommendation(disease_name):

    if not disease_name:
        return None

    # Direct match first
    recommendation = DISEASE_RECOMMENDATIONS.get(
        disease_name
    )

    if recommendation is not None:
        return recommendation

    # Normalize the requested disease name
    normalized_name = (
        disease_name
        .replace("_", " ")
        .replace("-", " ")
        .strip()
        .casefold()
    )

    # Search all JSON keys using normalized names
    for key, value in DISEASE_RECOMMENDATIONS.items():

        normalized_key = (
            str(key)
            .replace("_", " ")
            .replace("-", " ")
            .strip()
            .casefold()
        )

        if normalized_key == normalized_name:
            return value

    return None

# ============================================================
# INITIALIZE DATABASE
# ============================================================

init_database()


# ============================================================
# FASTAPI APP
# ============================================================

# ============================================================
# AUTHENTICATION SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):

    full_name: str

    email: EmailStr

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


# ============================================================
# JWT AUTHENTICATION
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)


app = FastAPI(
    title="AgriMind AI API",

    description=(
        "AI-Powered Smart Agriculture "
        "Decision Support System"
    ),

    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# IMAGE QUALITY VALIDATION
# ============================================================

def validate_image_quality(
    image: Image.Image,
    crop: str = "cotton",
):

    width, height = image.size

    # --------------------------------------------------------
    # Resolution
    # --------------------------------------------------------

    if (
        width < MIN_IMAGE_WIDTH
        or height < MIN_IMAGE_HEIGHT
    ):

        return (
            False,
            (
                "Image resolution is too low. "
                f"Please upload an image of at least "
                f"{MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT} pixels."
            )
        )


    # --------------------------------------------------------
    # Grayscale statistics
    # --------------------------------------------------------

    grayscale = image.convert("L")

    statistics = ImageStat.Stat(
        grayscale
    )

    brightness = statistics.mean[0]

    contrast = statistics.stddev[0]


    # --------------------------------------------------------
    # Brightness
    # --------------------------------------------------------

    if brightness < MIN_BRIGHTNESS:

        return (
            False,
            (
                "Image is too dark. "
                "Please upload a brighter and clearer "
                f"{crop} leaf image."
            )
        )


    if brightness > MAX_BRIGHTNESS:

        return (
            False,
            (
                "Image is too bright. "
                f"Please upload a clear {crop} leaf image "
                "with proper lighting."
            )
        )


    # --------------------------------------------------------
    # Contrast
    # --------------------------------------------------------

    if contrast < MIN_CONTRAST:

        return (
            False,
            (
                "Image has very low contrast. "
                "Please upload a clear and visible "
                f"{crop} leaf image."
            )
        )


    return (
        True,
        "Image quality is acceptable."
    )


# ============================================================
# CREATE MODEL
# ============================================================

def create_model(num_classes):

    model = models.efficientnet_b0(
        weights=None
    )

    input_features = (
        model.classifier[1].in_features
    )

    model.classifier[1] = nn.Linear(
        input_features,
        num_classes,
    )

    return model


# ============================================================
# LOAD MODEL
# ============================================================

def load_model(
    model_path,
    classes,
    crop_name,
):

    if not model_path.exists():

        raise FileNotFoundError(
            f"""
Trained {crop_name} model not found:

{model_path}
"""
        )

    print(
        f"\nLoading AgriMind AI {crop_name} model..."
    )

    model = create_model(
        len(classes)
    )

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE,
        weights_only=False,
    )

    if (
        isinstance(checkpoint, dict)
        and "model_state_dict" in checkpoint
    ):

        model.load_state_dict(
            checkpoint[
                "model_state_dict"
            ]
        )

    else:

        model.load_state_dict(
            checkpoint
        )

    model = model.to(
        DEVICE
    )

    model.eval()

    print(
        f"{crop_name} model loaded successfully."
    )

    print(
        f"Model: {model_path}"
    )

    print(
        f"Device: {DEVICE}"
    )

    print(
        f"Classes: {len(classes)}"
    )

    for index, class_name in enumerate(
        classes
    ):

        print(
            f"   {index}: {class_name}"
        )

    return model


cotton_model = load_model(
    MODEL_PATH,
    COTTON_CLASSES,
    "cotton",
)

soybean_model = load_model(
    SOYBEAN_MODEL_PATH,
    SOYBEAN_CLASSES,
    "soybean",
)

maize_model = load_model(
    MAIZE_MODEL_PATH,
    MAIZE_CLASSES,
    "maize",
)

wheat_model = load_model(
    WHEAT_MODEL_PATH,
    WHEAT_CLASSES,
    "wheat",
)

# ============================================================
# ROOT API
# ============================================================

@app.get("/")
def root():

    return {

        "message":
            "AgriMind AI API is running",

        "status":
            "success",

        "model":
            "EfficientNet-B0",

        "crop":
            list(CROP_CLASSES.keys()),

        "classes":
            CROP_CLASSES,
    }


# ============================================================
# HEALTH API
# ============================================================

@app.get("/health")
def health():

    return {

        "status":
            "healthy",

    "model_loaded":
        cotton_model is not None
        and soybean_model is not None
        and maize_model is not None
        and wheat_model is not None,

    "models": [
        "cotton_efficientnet_b0",
        "soybean_efficientnet_b0",
        "maize_efficientnet_b0",
        "wheat_efficientnet_b0",
    ],

        "crop":
            list(CROP_CLASSES.keys()),

        "device":
            str(DEVICE),
    }


    # ============================================================
# PREDICTION API
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    crop: str = Form("cotton"),
    token: str = Depends(oauth2_scheme),
):

    current_user = verify_access_token(token)

    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    user_id = current_user["user_id"]

    crop = crop.strip().lower()

    if crop not in [
        "cotton",
        "soybean",
        "maize",
        "wheat",
    ]:

        raise HTTPException(
            status_code=400,
           detail=(
            f"Unsupported crop: {crop}. "
            "Supported crops are cotton, soybean, maize and wheat."
        ),
        )

    # --------------------------------------------------------
    # FILE TYPE
    # --------------------------------------------------------

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]


    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,

            detail=(
                "Invalid image format. "
                "Please upload JPG, PNG or WEBP."
            ),
        )


    # --------------------------------------------------------
    # READ IMAGE
    # --------------------------------------------------------

    try:

        image_bytes = await file.read()

        image = Image.open(
            io.BytesIO(
                image_bytes
            )
        ).convert("RGB")

    except Exception:

        raise HTTPException(
            status_code=400,

            detail=(
                "Could not read the uploaded image."
            ),
        )


    # --------------------------------------------------------
    # IMAGE QUALITY
    # --------------------------------------------------------

    quality_valid, quality_message = (
        validate_image_quality(
            image,
            crop
        )
    )


    if not quality_valid:

        raise HTTPException(
            status_code=400,
            detail=quality_message,
        )


    # --------------------------------------------------------
    # TRANSFORM
    # --------------------------------------------------------

    tensor = IMAGE_TRANSFORM(
        image
    ).unsqueeze(0)

    tensor = tensor.to(
        DEVICE
    )


    # --------------------------------------------------------
    # SELECT MODEL BASED ON CROP
    # --------------------------------------------------------

    if crop == "soybean":

        selected_model = soybean_model
        selected_classes = SOYBEAN_CLASSES

    elif crop == "maize":

        selected_model = maize_model
        selected_classes = MAIZE_CLASSES

    elif crop == "wheat":

        selected_model = wheat_model
        selected_classes = WHEAT_CLASSES

    else:

        selected_model = cotton_model
        selected_classes = COTTON_CLASSES


    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    with torch.no_grad():

        outputs = selected_model(
            tensor
        )

        probabilities = torch.softmax(
            outputs,
            dim=1,
        )[0]

        confidence, predicted_index = (
            torch.max(
                probabilities,
                dim=0,
            )
        )


    predicted_index = (
        predicted_index.item()
    )

    predicted_class = (
        selected_classes[
            predicted_index
        ]
    )

    confidence_value = (
        confidence.item() * 100
    )


    # --------------------------------------------------------
    # CONFIDENCE LEVEL
    # --------------------------------------------------------

    if confidence_value >= 90:

        confidence_level = (
            "Very High"
        )

    elif confidence_value >= 80:

        confidence_level = (
            "High"
        )

    else:

        confidence_level = (
            "Moderate"
        )


    # --------------------------------------------------------
    # ALL PROBABILITIES
    # --------------------------------------------------------

    all_probabilities = {}

    for index, class_name in enumerate(
        selected_classes
    ):

        all_probabilities[
            class_name
        ] = round(
            probabilities[
                index
            ].item() * 100,
            2,
        )


    # --------------------------------------------------------
    # LOW CONFIDENCE
    # --------------------------------------------------------

    if confidence_value < MIN_CONFIDENCE:

        return {

            "success":
                False,

            "crop":
                crop,

            "filename":
                file.filename,

            "prediction":
                predicted_class,

            "confidence":
                round(
                    confidence_value,
                    2,
                ),

            "confidence_level":
                "Low",

            "probabilities":
                all_probabilities,

            "recommendation":
                None,

            "warning":
                f"Please upload a clearer {crop} leaf image.",
        }


    # --------------------------------------------------------
    # SAVE HISTORY
    # --------------------------------------------------------

    save_detection_history(

    user_id=user_id,

    filename=(
        file.filename
        or "unknown.jpg"
    ),

    crop=crop,

    prediction=
        predicted_class,

    confidence=
        round(
            confidence_value,
            2,
        ),

    probabilities=
        all_probabilities,

    recommendation=None,
    )


    # --------------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------------

    return {

        "success":
            True,

        "crop":
            crop,

        "filename":
            file.filename,

        "prediction":
            predicted_class,

        "confidence":
            round(
                confidence_value,
                2,
            ),

        "confidence_level":
            confidence_level,

        "probabilities":
            all_probabilities,

        "recommendation":
            None,
            
       
    }



# ============================================================
# STREAMED RECOMMENDATION API
# ============================================================

@app.get("/recommendation/stream")
async def recommendation_stream(
    crop: str,
    disease: str,
    confidence: float | None = None,
    token: str = Depends(oauth2_scheme),
):
    current_user = verify_access_token(token)

    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    async def event_stream():
        try:
            async for event in stream_claude_recommendation(
                crop=crop,
                disease=disease,
                confidence=confidence,
            ):
                yield (
                    "data: "
                    + json.dumps(event, ensure_ascii=False)
                    + "\n\n"
                )

            yield "data: {\"done\": true}\n\n"

        except Exception as error:
            yield (
                "data: "
                + json.dumps(
                    {
                        "error": (
                            "Recommendation stream failed: "
                            f"{error}"
                        )
                    },
                    ensure_ascii=False,
                )
                + "\n\n"
            )

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ============================================================
# HISTORY API
# ============================================================


@app.get("/history")
def get_history(
    token: str = Depends(oauth2_scheme)
):

    current_user = verify_access_token(
        token
    )

    if current_user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    user_id = current_user["user_id"]

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = (
        sqlite3.Row
    )

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
        (
            user_id,
        )
    )

    rows = cursor.fetchall()

    connection.close()

    history = []

    for row in rows:

        history.append({

            "id":
                row["id"],

            "filename":
                row["filename"],

            "crop":
                row["crop"],

            "prediction":
                row["prediction"],

            "confidence":
                row["confidence"],

            "probabilities":
                row["probabilities"],

           "recommendation":
                find_recommendation(
                    row["prediction"]
                ),
            "created_at":
                row["created_at"],
        })

    return {

        "success":
            True,

        "count":
            len(history),

        "history":
            history,
    }


# ============================================================
# CLEAR USER HISTORY
# ============================================================

@app.delete("/history")
def clear_history(
    token: str = Depends(oauth2_scheme)
):

    current_user = verify_access_token(
        token
    )

    if current_user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    user_id = current_user["user_id"]

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM detection_history
        WHERE user_id = ?
        """,
        (
            user_id,
        )
    )

    deleted_count = cursor.rowcount

    connection.commit()

    connection.close()

    return {

        "success":
            True,

        "message":
            "Your detection history cleared successfully.",

        "deleted_count":
            deleted_count,
    }


# ============================================================
# DISEASE RECOMMENDATION API
# ============================================================
@app.get(
    "/recommendation/{disease}"
)
def get_recommendation(
    disease: str
):

    disease_name = (
        disease
        .replace("-", " ")
        .replace("_", " ")
        .strip()
    )

    recommendation = find_recommendation(
        disease
    )

    if recommendation is None:

        raise HTTPException(
            status_code=404,
            detail=(
                f"No recommendation found "
                f"for disease: {disease_name}"
            )
        )

    return {

        "success": True,

        "crop": list(
            CROP_CLASSES.keys()
        ),

        "disease": disease_name,

        "recommendation":
            recommendation,
    }

# ============================================================
# REGISTER API
# ============================================================

@app.post("/auth/register")
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

        "message":
            "Account created successfully.",

        "user": {

            "id":
                result["user_id"],

            "full_name":
                result["full_name"],

            "email":
                result["email"]
        }
    }


# ============================================================
# OAUTH2 TOKEN API
# Used by Swagger UI "Authorize" button.
# This is intentionally separate from /auth/login because
# /auth/login accepts JSON for the frontend.
# ============================================================

@app.post("/auth/token")
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

@app.post("/auth/login")
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

        "message":
            "Login successful.",

        "access_token":
            access_token,

        "token_type":
            "bearer",

        "user": {

            "id":
                user["id"],

            "full_name":
                user["full_name"],

            "email":
                user["email"],

            "created_at":
                user["created_at"]
        }
    }


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    user_data = verify_access_token(
        token
    )

    if user_data is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    return user_data


@app.get("/auth/me")
def get_me(
    current_user = Depends(
        get_current_user
    )
):

     return {

        "success": True,
         "user": current_user
    }
