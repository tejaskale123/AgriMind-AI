from pathlib import Path
import argparse

import torch
import torch.nn as nn
from torch.amp import autocast, GradScaler
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models


# ============================================================
# AGRIMIND AI
# TRAINING PIPELINE
# ============================================================


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_ROOT = PROJECT_ROOT / "datasets" / "processed"

MODEL_ROOT = PROJECT_ROOT / "models"


IMAGE_SIZE = 224

BATCH_SIZE = 24

NUM_EPOCHS = 20

LEARNING_RATE = 0.0001

RANDOM_SEED = 42


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

scaler = GradScaler("cuda", enabled=(DEVICE.type == "cuda"))


# ============================================================
# IMAGE TRANSFORMS
# ============================================================

TRAIN_TRANSFORM = transforms.Compose(
    [
        transforms.Resize(
            (IMAGE_SIZE, IMAGE_SIZE)
        ),

        transforms.RandomHorizontalFlip(),

        transforms.RandomRotation(10),

        transforms.ColorJitter(
            brightness=0.2,
            contrast=0.2,
            saturation=0.2
        ),

        transforms.ToTensor(),

        transforms.Normalize(
            mean=[
                0.485,
                0.456,
                0.406
            ],
            std=[
                0.229,
                0.224,
                0.225
            ]
        ),
    ]
)


VAL_TEST_TRANSFORM = transforms.Compose(
    [
        transforms.Resize(
            (IMAGE_SIZE, IMAGE_SIZE)
        ),

        transforms.ToTensor(),

        transforms.Normalize(
            mean=[
                0.485,
                0.456,
                0.406
            ],
            std=[
                0.229,
                0.224,
                0.225
            ]
        ),
    ]
)


# ============================================================
# DATASET LOADER
# ============================================================

def load_data(crop):

    if crop == "soybean_11class":
        crop_dir = DATASET_ROOT / "soybean_11class_balanced"
    else:
        crop_dir = DATASET_ROOT / "maize_extended_final300"

    train_dir = crop_dir / "train"

    val_dir = DATASET_ROOT / "maize_extended" / "val"

    test_dir = DATASET_ROOT / "maize_extended" / "test"


    if not train_dir.exists():

        raise FileNotFoundError(
            f"Training dataset not found: {train_dir}"
        )


    if not val_dir.exists():

        raise FileNotFoundError(
            f"Validation dataset not found: {val_dir}"
        )


    if not test_dir.exists():

        raise FileNotFoundError(
            f"Test dataset not found: {test_dir}"
        )


    train_dataset = datasets.ImageFolder(
        train_dir,
        transform=TRAIN_TRANSFORM
    )


    val_dataset = datasets.ImageFolder(
        val_dir,
        transform=VAL_TEST_TRANSFORM
    )


    test_dataset = datasets.ImageFolder(
        test_dir,
        transform=VAL_TEST_TRANSFORM
    )


    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=0,
        pin_memory=False
    )


    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0,
        pin_memory=False
    )


    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0,
        pin_memory=False
    )


    return (
        train_dataset,
        val_dataset,
        test_dataset,
        train_loader,
        val_loader,
        test_loader
    )


# ============================================================
# MODEL
# ============================================================

def create_model(num_classes):

    weights = (
        models.EfficientNet_B0_Weights.DEFAULT
    )


    model = models.efficientnet_b0(
        weights=weights
    )


    input_features = (
        model.classifier[1].in_features
    )


    model.classifier[1] = nn.Linear(
        input_features,
        num_classes
    )


    return model


# ============================================================
# TRAINING
# ============================================================

def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer
):

    model.train()

    total_loss = 0.0

    correct = 0

    total = 0


    for images, labels in loader:

        images = images.to(DEVICE)

        labels = labels.to(DEVICE)


        optimizer.zero_grad()


        with autocast("cuda", enabled=(DEVICE.type == "cuda")):
            outputs = model(images)
            loss = criterion(
                outputs,
                labels
            )

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()


        total_loss += (
            loss.item()
            * images.size(0)
        )


        predictions = (
            outputs.argmax(dim=1)
        )


        correct += (
            predictions == labels
        ).sum().item()


        total += labels.size(0)


    average_loss = (
        total_loss / total
        if total > 0
        else 0
    )


    accuracy = (
        correct / total
        if total > 0
        else 0
    )


    return average_loss, accuracy


# ============================================================
# VALIDATION
# ============================================================

def evaluate(
    model,
    loader,
    criterion
):

    model.eval()

    total_loss = 0.0

    correct = 0

    total = 0


    with torch.no_grad():

        for images, labels in loader:

            images = images.to(DEVICE)

            labels = labels.to(DEVICE)


            outputs = model(images)


            loss = criterion(
                outputs,
                labels
            )


            total_loss += (
                loss.item()
                * images.size(0)
            )


            predictions = (
                outputs.argmax(dim=1)
            )


            correct += (
                predictions == labels
            ).sum().item()


            total += labels.size(0)


    average_loss = (
        total_loss / total
        if total > 0
        else 0
    )


    accuracy = (
        correct / total
        if total > 0
        else 0
    )


    return average_loss, accuracy


# ============================================================
# MAIN TRAINING FUNCTION
# ============================================================

def train_model(crop):

    print("=" * 70)

    print(
        "ðŸŒ± AGRIMIND AI - MODEL TRAINING"
    )

    print("=" * 70)


    print(
        f"\nCrop: {crop}"
    )

    print(
        f"Device: {DEVICE}"
    )


    # --------------------------------------------------------
    # Load data
    # --------------------------------------------------------

    (
        train_dataset,
        val_dataset,
        test_dataset,
        train_loader,
        val_loader,
        test_loader
    ) = load_data(crop)


    print(
        f"\nTraining images   : "
        f"{len(train_dataset)}"
    )

    print(
        f"Validation images : "
        f"{len(val_dataset)}"
    )

    print(
        f"Test images       : "
        f"{len(test_dataset)}"
    )


    print(
        f"\nClasses:"
    )

    for index, class_name in enumerate(
        train_dataset.classes
    ):

        print(
            f"  {index}: {class_name}"
        )


    # --------------------------------------------------------
    # Create model
    # --------------------------------------------------------

    model = create_model(
        len(train_dataset.classes)
    )


    model = model.to(DEVICE)


    if crop == "soybean_11class":
        class_counts = torch.bincount(
            torch.tensor(train_dataset.targets),
            minlength=len(train_dataset.classes)
        ).float()

        class_weights = class_counts.sum() / (
            len(train_dataset.classes) * class_counts
        )

        class_weights = class_weights.to(DEVICE)

        print("\nSoybean 11-class weighted loss enabled.")
        print("Class weights:")
        for class_name, weight in zip(
            train_dataset.classes,
            class_weights.tolist()
        ):
            print(f"  {class_name}: {weight:.3f}")

        criterion = nn.CrossEntropyLoss(weight=class_weights)
    else:
        criterion = nn.CrossEntropyLoss()


    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=LEARNING_RATE
    )


    # --------------------------------------------------------
    # Training loop
    # --------------------------------------------------------

    best_val_accuracy = 0.0


    MODEL_ROOT.mkdir(
        parents=True,
        exist_ok=True
    )


    model_path = (
        MODEL_ROOT
        / "maize_extended_final300_efficientnet_b0.pth"
    )


    for epoch in range(
        1,
        NUM_EPOCHS + 1
    ):

        train_loss, train_accuracy = (
            train_one_epoch(
                model,
                train_loader,
                criterion,
                optimizer
            )
        )


        val_loss, val_accuracy = (
            evaluate(
                model,
                val_loader,
                criterion
            )
        )


        print(
            f"\nEpoch "
            f"{epoch}/{NUM_EPOCHS}"
        )


        print(
            f"Train Loss: "
            f"{train_loss:.4f}"
        )


        print(
            f"Train Accuracy: "
            f"{train_accuracy * 100:.2f}%"
        )


        print(
            f"Val Loss: "
            f"{val_loss:.4f}"
        )


        print(
            f"Val Accuracy: "
            f"{val_accuracy * 100:.2f}%"
        )


        # ----------------------------------------------------
        # Save best model
        # ----------------------------------------------------

        if val_accuracy > best_val_accuracy:

            best_val_accuracy = val_accuracy


            torch.save(
                {
                    "model_state_dict":
                        model.state_dict(),

                    "classes":
                        train_dataset.classes,

                    "crop":
                        crop,

                    "image_size":
                        IMAGE_SIZE,

                    "model_name":
                        "efficientnet_b0",

                    "validation_accuracy":
                        val_accuracy,
                },
                model_path
            )


            print(
                f"ðŸ’¾ Best model saved: "
                f"{model_path}"
            )


    # --------------------------------------------------------
    # Load best model before final test evaluation
    # --------------------------------------------------------

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    print(
        "\nBest model loaded for final test evaluation."
    )

    # --------------------------------------------------------
    # Final test evaluation
    # --------------------------------------------------------

    test_loss, test_accuracy = (
        evaluate(
            model,
            test_loader,
            criterion
        )
    )


    print("\n" + "=" * 70)

    print(
        "ðŸ“Š FINAL TEST RESULT"
    )

    print("=" * 70)


    print(
        f"\nTest Loss: "
        f"{test_loss:.4f}"
    )


    print(
        f"Test Accuracy: "
        f"{test_accuracy * 100:.2f}%"
    )


    print(
        f"\nBest Validation Accuracy: "
        f"{best_val_accuracy * 100:.2f}%"
    )


    print(
        f"\nModel: "
        f"{model_path}"
    )


    print("=" * 70)


# ============================================================
# COMMAND LINE
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description=(
            "Train AgriMind AI "
            "crop disease model"
        )
    )


    parser.add_argument(
        "--crop",
        required=True,
        help=(
            "Crop name "
            "(example: soybean)"
        )
    )


    args = parser.parse_args()


    train_model(
        args.crop
    )


if __name__ == "__main__":

    main()

