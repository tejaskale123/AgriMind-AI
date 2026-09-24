from pathlib import Path
import torch

# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

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
    / "soybean_11class_efficientnet_b0.pth"
)

MAIZE_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "maize_extended_efficientnet_b0.pth"
)

WHEAT_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "wheat_efficientnet_b0.pth"
)

PIGEON_PEA_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "pigeon_pea_targeted_efficientnet_b0.pth"
)

MODEL_PATHS = {
    "pigeon_pea": PIGEON_PEA_MODEL_PATH,
    "cotton": MODEL_PATH,
    "soybean": SOYBEAN_MODEL_PATH,
    "maize": MAIZE_MODEL_PATH,
    "wheat": WHEAT_MODEL_PATH,
}


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)
