from pathlib import Path
import sqlite3
import json
from datetime import datetime
import io

import torch
import torch.nn as nn

from PIL import Image, ImageStat
from torchvision import models, transforms

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# AGRIMIND AI
# FASTAPI + COTTON DISEASE PREDICTION API
# ============================================================


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "cotton_efficientnet_b0.pth"
)

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
# COTTON CLASSES
# IMPORTANT:
# These MUST match training.py and predict.py
# ============================================================

COTTON_CLASSES = [
    "Alternaria Leaf Spot",
    "Bacterial Blight",
    "Fusarium Wilt",
    "Healthy Leaf",
    "Verticillium Wilt",
]


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
        CREATE TABLE IF NOT EXISTS detection_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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

    existing_columns = {
        row[1]
        for row in cursor.execute(
            "PRAGMA table_info(detection_history)"
        ).fetchall()
    }

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


# ============================================================
# SAVE DETECTION HISTORY
# ============================================================

def save_detection_history(
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
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
# INITIALIZE DATABASE
# ============================================================

init_database()


# ============================================================
# FASTAPI APP
# ============================================================

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
    image: Image.Image
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
                "cotton leaf image."
            )
        )


    if brightness > MAX_BRIGHTNESS:

        return (
            False,
            (
                "Image is too bright. "
                "Please upload a clear cotton leaf image "
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
                "cotton leaf image."
            )
        )


    return (
        True,
        "Image quality is acceptable."
    )


# ============================================================
# CREATE MODEL
# ============================================================

def create_model():

    model = models.efficientnet_b0(
        weights=None
    )

    input_features = (
        model.classifier[1].in_features
    )

    model.classifier[1] = nn.Linear(
        input_features,
        len(COTTON_CLASSES),
    )

    return model


# ============================================================
# LOAD COTTON MODEL
# ============================================================

def load_model():

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            f"""
Trained cotton model not found:

{MODEL_PATH}

Please train the cotton model first.
"""
        )


    print(
        "\n🌱 Loading AgriMind AI Cotton model..."
    )

    model = create_model()


    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE,
        weights_only=False,
    )


    # --------------------------------------------------------
    # Support both checkpoint formats
    # --------------------------------------------------------

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
        "✅ Cotton model loaded successfully."
    )

    print(
        f"📂 Model: {MODEL_PATH}"
    )

    print(
        f"💻 Device: {DEVICE}"
    )

    print(
        f"🌱 Classes: {len(COTTON_CLASSES)}"
    )

    for index, class_name in enumerate(
        COTTON_CLASSES
    ):

        print(
            f"   {index}: {class_name}"
        )


    return model


# ============================================================
# LOAD MODEL ONCE
# ============================================================

model = load_model()


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
            "cotton",

        "classes":
            COTTON_CLASSES,
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
            model is not None,

        "model":
            "cotton_efficientnet_b0",

        "crop":
            "cotton",

        "device":
            str(DEVICE),
    }


# ============================================================
# PREDICTION API
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

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
            image
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
    # MODEL PREDICTION
    # --------------------------------------------------------

    with torch.no_grad():

        outputs = model(
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
        COTTON_CLASSES[
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
        COTTON_CLASSES
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
                "cotton",

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
                (
                    "AI confidence is too low. "
                    "Please upload a clearer "
                    "cotton leaf image."
                ),
        }


    # --------------------------------------------------------
    # RECOMMENDATION
    # --------------------------------------------------------

    recommendation = (
        DISEASE_RECOMMENDATIONS.get(
            predicted_class
        )
    )


    # --------------------------------------------------------
    # SAVE HISTORY
    # --------------------------------------------------------

    save_detection_history(

        filename=(
            file.filename
            or "unknown.jpg"
        ),

        crop="cotton",

        prediction=
            predicted_class,

        confidence=
            round(
                confidence_value,
                2,
            ),

        probabilities=
            all_probabilities,

        recommendation=
            recommendation,
    )


    # --------------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------------

    return {

        "success":
            True,

        "crop":
            "cotton",

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
            recommendation,
    }


# ============================================================
# HISTORY API
# ============================================================

@app.get("/history")
def get_history():

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
        ORDER BY id DESC
        """
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
                DISEASE_RECOMMENDATIONS.get(
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
# CLEAR HISTORY
# ============================================================

@app.delete("/history")
def clear_history():

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM detection_history"
    )

    connection.commit()

    connection.close()


    return {

        "success":
            True,

        "message":
            "Detection history cleared successfully.",
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
        disease.replace(
            "-",
            " "
        )
    )


    recommendation = (
        DISEASE_RECOMMENDATIONS.get(
            disease_name
        )
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

        "success":
            True,

        "crop":
            "cotton",

        "disease":
            disease_name,

        "recommendation":
            recommendation,
    }