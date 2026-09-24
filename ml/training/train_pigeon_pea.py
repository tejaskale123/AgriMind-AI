from pathlib import Path
import torch
import torch.nn as nn
from torch.amp import autocast, GradScaler
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_ROOT = PROJECT_ROOT / "datasets" / "processed" / "pigeon_pea_split"
MODEL_ROOT = PROJECT_ROOT / "models"

IMAGE_SIZE = 224
BATCH_SIZE = 24
NUM_EPOCHS = 20
LEARNING_RATE = 0.0001
RANDOM_SEED = 42

torch.manual_seed(RANDOM_SEED)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
scaler = GradScaler("cuda", enabled=(DEVICE.type == "cuda"))

TRAIN_TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

VAL_TEST_TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])


def load_data():

    train_dir = DATASET_ROOT / "train"
    val_dir = DATASET_ROOT / "val"
    test_dir = DATASET_ROOT / "test"

    for directory in [train_dir, val_dir, test_dir]:
        if not directory.exists():
            raise FileNotFoundError(
                f"Dataset folder not found: {directory}"
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
        num_workers=2,
        pin_memory=True
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=2,
        pin_memory=True
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=2,
        pin_memory=True
    )

    return (
        train_dataset,
        val_dataset,
        test_dataset,
        train_loader,
        val_loader,
        test_loader
    )


def create_model(num_classes):

    weights = models.EfficientNet_B0_Weights.DEFAULT

    model = models.efficientnet_b0(
        weights=weights
    )

    input_features = model.classifier[1].in_features

    model.classifier[1] = nn.Linear(
        input_features,
        num_classes
    )

    return model


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

        with autocast(
            "cuda",
            enabled=(DEVICE.type == "cuda")
        ):
            outputs = model(images)
            loss = criterion(outputs, labels)

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item() * images.size(0)

        predictions = outputs.argmax(dim=1)

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    average_loss = (
        total_loss / total
        if total > 0 else 0
    )

    accuracy = (
        correct / total
        if total > 0 else 0
    )

    return average_loss, accuracy


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

            predictions = outputs.argmax(dim=1)

            correct += (
                predictions == labels
            ).sum().item()

            total += labels.size(0)

    average_loss = (
        total_loss / total
        if total > 0 else 0
    )

    accuracy = (
        correct / total
        if total > 0 else 0
    )

    return average_loss, accuracy


def train_model():

    print("=" * 70)
    print("AGRIMIND AI - PIGEON PEA MODEL TRAINING")
    print("=" * 70)

    print(f"\nDataset : {DATASET_ROOT}")
    print(f"Device  : {DEVICE}")
    print(f"Epochs  : {NUM_EPOCHS}")
    print(f"Batch   : {BATCH_SIZE}")
    print(f"LR      : {LEARNING_RATE}")

    (
        train_dataset,
        val_dataset,
        test_dataset,
        train_loader,
        val_loader,
        test_loader
    ) = load_data()

    print(f"\nTraining images   : {len(train_dataset)}")
    print(f"Validation images : {len(val_dataset)}")
    print(f"Test images       : {len(test_dataset)}")

    print("\nClasses:")

    for index, class_name in enumerate(
        train_dataset.classes
    ):
        print(f"  {index}: {class_name}")

    model = create_model(
        len(train_dataset.classes)
    )

    model = model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=LEARNING_RATE
    )

    best_val_accuracy = 0.0

    MODEL_ROOT.mkdir(
        parents=True,
        exist_ok=True
    )

    model_path = (
        MODEL_ROOT /
        "pigeon_pea_efficientnet_b0.pth"
    )

    for epoch in range(
        1,
        NUM_EPOCHS + 1
    ):

        train_loss, train_accuracy = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer
        )

        val_loss, val_accuracy = evaluate(
            model,
            val_loader,
            criterion
        )

        print(
            f"\nEpoch {epoch}/{NUM_EPOCHS}"
        )

        print(
            f"Train Loss: {train_loss:.4f}"
        )

        print(
            f"Train Accuracy: "
            f"{train_accuracy * 100:.2f}%"
        )

        print(
            f"Val Loss: {val_loss:.4f}"
        )

        print(
            f"Val Accuracy: "
            f"{val_accuracy * 100:.2f}%"
        )

        if val_accuracy > best_val_accuracy:

            best_val_accuracy = val_accuracy

            torch.save(
                {
                    "model_state_dict":
                        model.state_dict(),

                    "classes":
                        train_dataset.classes,

                    "crop":
                        "pigeon_pea",

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
                f"Best model saved: {model_path}"
            )

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

    test_loss, test_accuracy = evaluate(
        model,
        test_loader,
        criterion
    )

    print("\n" + "=" * 70)
    print("FINAL PIGEON PEA TEST RESULT")
    print("=" * 70)

    print(
        f"\nTest Loss: {test_loss:.4f}"
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
        f"\nModel: {model_path}"
    )

    print("=" * 70)


if __name__ == "__main__":
    train_model()
