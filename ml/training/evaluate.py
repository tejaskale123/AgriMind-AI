from pathlib import Path
import argparse

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)


# ============================================================
# AGRIMIND AI
# COTTON MODEL EVALUATION
# ============================================================


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_ROOT = PROJECT_ROOT / "datasets" / "disease"

MODEL_ROOT = PROJECT_ROOT / "models"


IMAGE_SIZE = 224

BATCH_SIZE = 32


DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# TEST TRANSFORM
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
# LOAD MODEL
# ============================================================

def load_model(model_path, num_classes):

    print("\nLoading EfficientNet-B0...")

    model = models.efficientnet_b0(
        weights=None
    )

    input_features = (
        model.classifier[1].in_features
    )

    model.classifier[1] = nn.Linear(
        input_features,
        num_classes
    )

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model = model.to(DEVICE)

    model.eval()

    return model, checkpoint


# ============================================================
# EVALUATION
# ============================================================

def evaluate_model(crop):

    print("=" * 70)

    print(
        "🌱 AGRIMIND AI - MODEL EVALUATION"
    )

    print("=" * 70)

    print(
        f"\nCrop: {crop}"
    )

    print(
        f"Device: {DEVICE}"
    )


    # --------------------------------------------------------
    # Paths
    # --------------------------------------------------------

    test_dir = (
        DATASET_ROOT
        / crop
        / "test"
    )

    model_path = (
        MODEL_ROOT
        / f"{crop}_efficientnet_b0.pth"
    )


    print(
        "\nTest dataset:"
    )

    print(
        test_dir
    )


    print(
        "\nModel:"
    )

    print(
        model_path
    )


    # --------------------------------------------------------
    # Check paths
    # --------------------------------------------------------

    if not test_dir.exists():

        print(
            "\nERROR: Test dataset not found."
        )

        return


    if not model_path.exists():

        print(
            "\nERROR: Trained model not found."
        )

        return


    # --------------------------------------------------------
    # Load test dataset
    # --------------------------------------------------------

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


    class_names = test_dataset.classes


    print(
        f"\nTest images: "
        f"{len(test_dataset)}"
    )


    print(
        "\nClasses:"
    )


    for index, name in enumerate(
        class_names
    ):

        print(
            f"  {index}: {name}"
        )


    # --------------------------------------------------------
    # Load trained model
    # --------------------------------------------------------

    model, checkpoint = load_model(
        model_path,
        len(class_names)
    )


    print(
        "\n✅ Model loaded successfully."
    )


    if "validation_accuracy" in checkpoint:

        print(
            f"Saved Validation Accuracy: "
            f"{checkpoint['validation_accuracy'] * 100:.2f}%"
        )


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    all_predictions = []

    all_labels = []


    print(
        "\nRunning predictions..."
    )

    print(
        "-" * 70
    )


    with torch.no_grad():

        for images, labels in test_loader:

            images = images.to(DEVICE)

            outputs = model(
                images
            )

            predictions = (
                outputs.argmax(
                    dim=1
                )
            )

            all_predictions.extend(
                predictions.cpu().tolist()
            )

            all_labels.extend(
                labels.tolist()
            )


    # --------------------------------------------------------
    # Accuracy
    # --------------------------------------------------------

    accuracy = accuracy_score(
        all_labels,
        all_predictions
    )


    print(
        "\n" + "=" * 70
    )

    print(
        "📊 FINAL TEST EVALUATION"
    )

    print(
        "=" * 70
    )


    print(
        f"\nTest Images : "
        f"{len(all_labels)}"
    )


    print(
        f"Test Accuracy : "
        f"{accuracy * 100:.2f}%"
    )


    # --------------------------------------------------------
    # Classification Report
    # --------------------------------------------------------

    print(
        "\n" + "=" * 70
    )

    print(
        "📋 CLASSIFICATION REPORT"
    )

    print(
        "=" * 70
    )


    report = classification_report(
        all_labels,
        all_predictions,
        target_names=class_names,
        digits=4,
        zero_division=0
    )


    print(
        report
    )


    # --------------------------------------------------------
    # Confusion Matrix
    # --------------------------------------------------------

    print(
        "=" * 70
    )

    print(
        "🔎 CONFUSION MATRIX"
    )

    print(
        "=" * 70
    )


    matrix = confusion_matrix(
        all_labels,
        all_predictions
    )


    print(
        "\nRows = Actual"
    )

    print(
        "Columns = Predicted\n"
    )


    print(
        matrix
    )


    # --------------------------------------------------------
    # Per-class accuracy
    # --------------------------------------------------------

    print(
        "\n" + "=" * 70
    )

    print(
        "📈 PER-CLASS ACCURACY"
    )

    print(
        "=" * 70
    )


    for index, class_name in enumerate(
        class_names
    ):

        actual_count = matrix[
            index
        ].sum()


        correct_count = matrix[
            index,
            index
        ]


        if actual_count > 0:

            class_accuracy = (
                correct_count
                / actual_count
            )

        else:

            class_accuracy = 0


        print(
            f"{class_name}: "
            f"{class_accuracy * 100:.2f}% "
            f"({correct_count}/{actual_count})"
        )


    # --------------------------------------------------------
    # Final result
    # --------------------------------------------------------

    print(
        "\n" + "=" * 70
    )

    print(
        "✅ MODEL EVALUATION COMPLETE"
    )

    print(
        "=" * 70
    )


# ============================================================
# COMMAND LINE
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description=(
            "Evaluate AgriMind AI "
            "crop disease model"
        )
    )


    parser.add_argument(
        "--crop",
        required=True,
        help="Crop name (example: cotton)"
    )


    args = parser.parse_args()


    evaluate_model(
        args.crop
    )


if __name__ == "__main__":

    main()