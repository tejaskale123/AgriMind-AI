from pathlib import Path

import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import classification_report, confusion_matrix


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_ROOT = PROJECT_ROOT / "datasets" / "processed"

MODEL_PATH = PROJECT_ROOT / "models" / "cotton_9class_efficientnet_b0.pth"


# ============================================================
# SETTINGS
# ============================================================

IMAGE_SIZE = 224
BATCH_SIZE = 32

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# TRANSFORM
# ============================================================

TEST_TRANSFORM = transforms.Compose(
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
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("ðŸŒ± AGRIMIND AI - COTTON MODEL EVALUATION")
    print("=" * 70)

    print(f"\nDevice: {DEVICE}")

    print(f"Model: {MODEL_PATH}")


    # --------------------------------------------------------
    # Check model
    # --------------------------------------------------------

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )


    # --------------------------------------------------------
    # Load test dataset
    # --------------------------------------------------------

    test_dir = (
        DATASET_ROOT
        / "cotton_9class"
        / "test"
    )


    test_dataset = datasets.ImageFolder(
        test_dir,
        transform=TEST_TRANSFORM
    )


    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0
    )


    print(
        f"\nTest images: {len(test_dataset)}"
    )


    print("\nClasses:")

    for index, class_name in enumerate(
        test_dataset.classes
    ):

        print(
            f"  {index}: {class_name}"
        )


    # --------------------------------------------------------
    # Create model
    # --------------------------------------------------------

    model = models.efficientnet_b0(
        weights=None
    )


    input_features = (
        model.classifier[1].in_features
    )


    model.classifier[1] = torch.nn.Linear(
        input_features,
        len(test_dataset.classes)
    )


    # --------------------------------------------------------
    # Load saved model
    # --------------------------------------------------------

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )


    model.load_state_dict(
        checkpoint["model_state_dict"]
    )


    model = model.to(DEVICE)

    model.eval()


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    all_predictions = []
    all_labels = []


    with torch.no_grad():

        for images, labels in test_loader:

            images = images.to(DEVICE)

            outputs = model(images)

            predictions = outputs.argmax(
                dim=1
            )


            all_predictions.extend(
                predictions.cpu().numpy()
            )

            all_labels.extend(
                labels.numpy()
            )


    # --------------------------------------------------------
    # Classification Report
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("ðŸ“Š CLASSIFICATION REPORT")
    print("=" * 70)

    report = classification_report(
        all_labels,
        all_predictions,
        target_names=test_dataset.classes,
        digits=4,
        zero_division=0
    )

    print(report)


    # --------------------------------------------------------
    # Confusion Matrix
    # --------------------------------------------------------

    print("=" * 70)
    print("CONFUSION MATRIX")
    print("=" * 70)

    matrix = confusion_matrix(
        all_labels,
        all_predictions
    )


    print("\nRows = Actual")
    print("Columns = Predicted\n")

    print(
        "Classes:"
    )

    for index, class_name in enumerate(
        test_dataset.classes
    ):

        print(
            f"{index} = {class_name}"
        )


    print("\nMatrix:\n")

    print(matrix)


    # --------------------------------------------------------
    # Overall Accuracy
    # --------------------------------------------------------

    correct = sum(
        prediction == label
        for prediction, label
        in zip(
            all_predictions,
            all_labels
        )
    )


    total = len(all_labels)


    accuracy = (
        correct / total
        if total > 0
        else 0
    )


    print("\n" + "=" * 70)
    print("FINAL EVALUATION")
    print("=" * 70)

    print(
        f"\nCorrect predictions : {correct}"
    )

    print(
        f"Total test images   : {total}"
    )

    print(
        f"Test Accuracy       : {accuracy * 100:.2f}%"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()
