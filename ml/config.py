# ============================================================
# AGRIMIND AI
# MACHINE LEARNING CONFIGURATION
# ============================================================

from pathlib import Path


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATASETS_DIR = PROJECT_ROOT / "datasets"

RAW_DATA_DIR = DATASETS_DIR / "raw"

PROCESSED_DATA_DIR = DATASETS_DIR / "disease"

MODEL_DIR = PROJECT_ROOT / "models"


# ============================================================
# SUPPORTED CROPS
# ============================================================

SUPPORTED_CROPS = [
    "soybean",
    "cotton",
    "maize",
    "tomato",
    "wheat",
]


# ============================================================
# DISEASE CLASSES
# ============================================================

CROP_CLASSES = {

    "soybean": [
        "Healthy",
        "Bacterial Blight",
        "Cercospora Leaf Blight",
        "Sudden Death Syndrome",
        "Rust",
    ],

    "cotton": [
        "Healthy",
        "Disease",
    ],

    "maize": [
        "Healthy",
        "Cercospora Leaf Spot",
        "Common Rust",
        "Northern Leaf Blight",
    ],

    "tomato": [
        "Healthy",
        "Bacterial Spot",
        "Early Blight",
        "Late Blight",
        "Leaf Mold",
        "Septoria Leaf Spot",
        "Spider Mites",
        "Target Spot",
        "Tomato Yellow Leaf Curl Virus",
        "Tomato Mosaic Virus",
    ],

    "wheat": [
        "Healthy",
        "Disease",
    ],
}


# ============================================================
# DATASET SPLIT
# ============================================================

TRAIN_RATIO = 0.80

VALIDATION_RATIO = 0.10

TEST_RATIO = 0.10


# ============================================================
# IMAGE SETTINGS
# ============================================================

IMAGE_SIZE = 224

IMAGE_CHANNELS = 3


# ============================================================
# REPRODUCIBILITY
# ============================================================

RANDOM_SEED = 42


# ============================================================
# MODEL
# ============================================================

MODEL_NAME = "efficientnet_b0"


# ============================================================
# TRAINING
# ============================================================

BATCH_SIZE = 32

NUM_EPOCHS = 20

LEARNING_RATE = 0.0001


# ============================================================
# INFERENCE
# ============================================================

CONFIDENCE_THRESHOLD = 0.70