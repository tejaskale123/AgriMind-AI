from pathlib import Path


# ============================================================
# AGRIMIND AI
# TRAINING CONFIGURATION
# ============================================================


# ------------------------------------------------------------
# PROJECT ROOT
# ------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]


# ------------------------------------------------------------
# DATASET
# ------------------------------------------------------------

DATASET_ROOT = (
    PROJECT_ROOT
    / "datasets"
    / "processed"
    / "soybean"
)


# ------------------------------------------------------------
# MODEL OUTPUT
# ------------------------------------------------------------

MODEL_ROOT = (
    PROJECT_ROOT
    / "models"
)

MODEL_ROOT.mkdir(
    parents=True,
    exist_ok=True,
)


BEST_MODEL_PATH = (
    MODEL_ROOT
    / "soybean_efficientnet_b0.pth"
)


# ------------------------------------------------------------
# IMAGE CONFIGURATION
# ------------------------------------------------------------

IMAGE_SIZE = 224


# ------------------------------------------------------------
# TRAINING CONFIGURATION
# ------------------------------------------------------------

BATCH_SIZE = 32

NUM_EPOCHS = 15

LEARNING_RATE = 0.0001

WEIGHT_DECAY = 0.0001


# ------------------------------------------------------------
# DATASET CONFIGURATION
# ------------------------------------------------------------

NUM_CLASSES = 5

CLASS_NAMES = [
    "Healthy",
    "Bacterial Blight",
    "Cercospora Leaf Blight",
    "Sudden Death Syndrome",
    "Rust",
]


# ------------------------------------------------------------
# DATA SPLIT
# ------------------------------------------------------------

TRAIN_RATIO = 0.70

VALIDATION_RATIO = 0.15

TEST_RATIO = 0.15


# ------------------------------------------------------------
# RANDOM SEED
# ------------------------------------------------------------

RANDOM_SEED = 42


# ------------------------------------------------------------
# DEVICE
# ------------------------------------------------------------

import torch


DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ------------------------------------------------------------
# PRINT CONFIGURATION
# ------------------------------------------------------------

if __name__ == "__main__":

    print("=" * 60)

    print(
        "🌱 AGRIMIND AI"
    )

    print(
        "TRAINING CONFIGURATION"
    )

    print("=" * 60)

    print(
        f"\nProject Root:"
    )

    print(
        PROJECT_ROOT
    )

    print(
        f"\nDataset:"
    )

    print(
        DATASET_ROOT
    )

    print(
        f"\nModel:"
    )

    print(
        BEST_MODEL_PATH
    )

    print(
        f"\nImage Size: "
        f"{IMAGE_SIZE}"
    )

    print(
        f"Batch Size: "
        f"{BATCH_SIZE}"
    )

    print(
        f"Epochs: "
        f"{NUM_EPOCHS}"
    )

    print(
        f"Learning Rate: "
        f"{LEARNING_RATE}"
    )

    print(
        f"Device: "
        f"{DEVICE}"
    )

    print(
        "\nClasses:"
    )

    for index, name in enumerate(
        CLASS_NAMES
    ):

        print(
            f"{index}: {name}"
        )

    print("\n")

    print(
        "✅ Configuration loaded."
    )