# ============================================================
# AGRIMIND AI
# FASTAPI + MULTI-CROP DISEASE PREDICTION API
# Application Entry Point
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import DEVICE
from .core.constants import CROP_CLASSES, IMAGE_SIZE
from .database.database import init_database
from .models.model_loader import (
    cotton_model,
    soybean_model,
    maize_model,
    wheat_model,
)

# Routers
from .routers.auth import router as auth_router
from .routers.prediction import router as prediction_router
from .routers.history import router as history_router
from .routers.recommendation import router as recommendation_router
from .routers.profile import router as profile_router
from .routers.settings import router as settings_router
from .routers.weather import router as weather_router
from .routers.search import router as search_router


# ============================================================
# INITIALIZE DATABASE
# ============================================================

init_database()


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="AgriMind AI API",
    description="AI-Powered Smart Agriculture Decision Support System",
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
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REGISTER ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(prediction_router)
app.include_router(history_router)
app.include_router(recommendation_router)
app.include_router(profile_router)
app.include_router(settings_router)
app.include_router(weather_router)
app.include_router(search_router)


# ============================================================
# ROOT API
# ============================================================

@app.get("/")
def root():
    return {
        "message": "AgriMind AI API is running",
        "status": "success",
        "model": "EfficientNet-B0",
        "crop": list(CROP_CLASSES.keys()),
        "classes": CROP_CLASSES,
    }


# ============================================================
# HEALTH API
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": (
            cotton_model is not None
            and soybean_model is not None
            and maize_model is not None
            and wheat_model is not None
        ),
        "models": [
            "cotton_efficientnet_b0",
            "soybean_efficientnet_b0",
            "maize_efficientnet_b0",
            "wheat_efficientnet_b0",
        ],
        "crop": list(CROP_CLASSES.keys()),
        "device": str(DEVICE),
    }


# ============================================================
# REAL AI MODEL & RUNTIME INFO ENDPOINT
# ============================================================

@app.get("/system/model-info")
def get_system_model_info():
    """
    Returns actual loaded multi-crop AI models, input parameters, and runtime devices.
    """
    return {
        "success": True,
        "modelName": "EfficientNet-B0",
        "supportedCrops": list(CROP_CLASSES.keys()),
        "totalCrops": len(CROP_CLASSES),
        "inputImageSize": f"{IMAGE_SIZE} × {IMAGE_SIZE}",
        "device": str(DEVICE).upper(),
        "totalDiseaseClasses": sum(len(v) for v in CROP_CLASSES.values()),
        "status": "Online & Calibrated"
    }
