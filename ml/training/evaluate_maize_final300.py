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
# MODEL EVALUATION PIPELINE
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

# IMPORTANT:
# Training uses datasets/processed, so evaluation must use
# the same processed dataset structure.
DATASET_ROOT = PROJECT_ROOT / "datasets" / "processed"

MODEL_ROOT = PROJECT_ROOT / "models"


IMAGE_SIZE = 224

BATCH_SIZE = 32


# ============================================================
# DEVICE
# ============================================================

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

def load_model(model_path, checkpoint):

    print("\nLoading EfficientNet-B0...")

    class_names = checkpoint["classes"]

    num_classes = len(class_names)

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

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model = model.to(DEVICE)

    model.eval()

    return model


# ============================================================
# EVALUATION
# ============================================================

def evaluate_model(crop):

    print("=" * 70)

    print(
        "ðŸŒ± AGRIMIND AI - MODEL EVALUATION"
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
    # Load checkpoint FIRST
    # --------------------------------------------------------

    print(
        "\nLoading checkpoint..."
    )

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE
    )


    if "classes" not in checkpoint:

        print(
            "\nERROR: Model checkpoint does not contain class names."
        )

        return


    model_classes = checkpoint["classes"]


    print(
        "\nModel classes:"
    )

    for index, name in enumerate(
        model_classes
    ):

        print(
            f"  {index}: {name}"
        )


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


    dataset_classes = test_dataset.classes


    print(
        f"\nTest images: "
        f"{len(test_dataset)}"
    )


    print(
        "\nTest dataset classes:"
    )

    for index, name in enumerate(
        dataset_classes
    ):

        print(
            f"  {index}: {name}"
        )


    # --------------------------------------------------------
    # Verify class compatibility
    # --------------------------------------------------------

    if model_classes != dataset_classes:

        print(
            "\nâŒ ERROR: Model classes and test dataset classes do not match."
        )

        print(
            "\nModel classes:"
        )

        print(
            model_classes
        )

        print(
            "\nDataset classes:"
        )

        print(
            dataset_classes
        )

        print(
            "\nEvaluation stopped to prevent an invalid benchmark."
        )

        return


    print(
        "\nâœ… Model classes and dataset classes match."
    )


    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    model = load_model(
        model_path,
        checkpoint
    )


    print(
        "\nâœ… Model loaded successfully."
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
        "ðŸ“Š FINAL TEST EVALUATION"
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
        "ðŸ“‹ CLASSIFICATION REPORT"
    )

    print(
        "=" * 70
    )


    report = classification_report(
        all_labels,
        all_predictions,
        target_names=model_classes,
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
        "ðŸ”Ž CONFUSION MATRIX"
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
        "ðŸ“ˆ PER-CLASS ACCURACY"
    )

    print(
        "=" * 70
    )


    for index, class_name in enumerate(
        model_classes
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
        "âœ… MODEL EVALUATION COMPLETE"
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
        help=(
            "Crop name "
            "(example: soybean)"
        )
    )


    args = parser.parse_args()


    evaluate_model(
        args.crop
    )


if __name__ == "__main__":

    main()
