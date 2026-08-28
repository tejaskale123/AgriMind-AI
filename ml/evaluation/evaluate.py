from pathlib import Path
import argparse

import torch
import torch.nn as nn

from torchvision import datasets
from torchvision import transforms
from torchvision import models

from torch.utils.data import DataLoader

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

import numpy as np


# ============================================================
# AGRIMIND AI
# MODEL EVALUATION PIPELINE
# ============================================================


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_ROOT = (
    PROJECT_ROOT
    / "datasets"
    / "disease"
)

MODEL_ROOT = (
    PROJECT_ROOT
    / "models"
)


# ============================================================
# CONFIGURATION
# ============================================================

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
# LOAD MODEL
# ============================================================

def load_model(model_path, num_classes):

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE,
        weights_only=False,
    )

    model = models.efficientnet_b0(
        weights=None
    )

    input_features = (
        model.classifier[1].in_features
    )

    model.classifier[1] = nn.Linear(
        input_features,
        num_classes,
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model = model.to(DEVICE)

    model.eval()

    return model


# ============================================================
# LOAD TEST DATA
# ============================================================

def load_test_dataset(crop):

    test_dir = (
        DATASET_ROOT
        / crop
        / "test"
    )

    if not test_dir.exists():

        raise FileNotFoundError(
            f"Test dataset not found: {test_dir}"
        )

    dataset = datasets.ImageFolder(
        test_dir,
        transform=TEST_TRANSFORM,
    )

    loader = DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0,
    )

    return dataset, loader


# ============================================================
# RUN PREDICTIONS
# ============================================================

def get_predictions(
    model,
    loader,
):

    all_labels = []

    all_predictions = []

    all_probabilities = []

    model.eval()

    with torch.no_grad():

        for images, labels in loader:

            images = images.to(DEVICE)

            outputs = model(images)

            probabilities = torch.softmax(
                outputs,
                dim=1,
            )

            predictions = (
                probabilities.argmax(
                    dim=1
                )
            )

            all_labels.extend(
                labels.cpu().numpy()
            )

            all_predictions.extend(
                predictions.cpu().numpy()
            )

            all_probabilities.extend(
                probabilities.cpu().numpy()
            )

    return (
        np.array(all_labels),
        np.array(all_predictions),
        np.array(all_probabilities),
    )


# ============================================================
# CALCULATE METRICS
# ============================================================

def calculate_metrics(
    labels,
    predictions,
):

    accuracy = accuracy_score(
        labels,
        predictions,
    )

    precision = precision_score(
        labels,
        predictions,
        average="weighted",
        zero_division=0,
    )

    recall = recall_score(
        labels,
        predictions,
        average="weighted",
        zero_division=0,
    )

    f1 = f1_score(
        labels,
        predictions,
        average="weighted",
        zero_division=0,
    )

    return (
        accuracy,
        precision,
        recall,
        f1,
    )


# ============================================================
# PRINT CONFUSION MATRIX
# ============================================================

def print_confusion_matrix(
    matrix,
    class_names,
):

    print("\n")
    print("=" * 70)
    print("CONFUSION MATRIX")
    print("=" * 70)

    print(
        "\nRows = Actual"
    )

    print(
        "Columns = Predicted\n"
    )

    print(
        "Classes:"
    )

    for index, name in enumerate(
        class_names
    ):

        print(
            f"{index}: {name}"
        )

    print("\nMatrix:\n")

    print(matrix)


# ============================================================
# MAIN EVALUATION
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
    # Model path
    # --------------------------------------------------------

    model_path = (
        MODEL_ROOT
        / f"{crop}_efficientnet_b0.pth"
    )


    if not model_path.exists():

        print(
            "\n❌ Trained model not found."
        )

        print(
            f"\nExpected:"
        )

        print(
            model_path
        )

        print(
            "\nTrain the model first."
        )

        return


    # --------------------------------------------------------
    # Load test dataset
    # --------------------------------------------------------

    test_dataset, test_loader = (
        load_test_dataset(crop)
    )


    print(
        f"\nTest images: "
        f"{len(test_dataset)}"
    )


    print(
        "\nClasses:"
    )

    for index, name in enumerate(
        test_dataset.classes
    ):

        print(
            f"  {index}: {name}"
        )


    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    model = load_model(
        model_path,
        len(test_dataset.classes),
    )


    print(
        "\n✅ Model loaded successfully."
    )


    # --------------------------------------------------------
    # Predictions
    # --------------------------------------------------------

    (
        labels,
        predictions,
        probabilities,
    ) = get_predictions(
        model,
        test_loader,
    )


    # --------------------------------------------------------
    # Metrics
    # --------------------------------------------------------

    (
        accuracy,
        precision,
        recall,
        f1,
    ) = calculate_metrics(
        labels,
        predictions,
    )


    # --------------------------------------------------------
    # Print metrics
    # --------------------------------------------------------

    print("\n")
    print("=" * 70)
    print("📊 MODEL PERFORMANCE")
    print("=" * 70)

    print(
        f"\nAccuracy  : {accuracy * 100:.2f}%"
    )

    print(
        f"Precision : {precision * 100:.2f}%"
    )

    print(
        f"Recall    : {recall * 100:.2f}%"
    )

    print(
        f"F1 Score  : {f1 * 100:.2f}%"
    )


    # --------------------------------------------------------
    # Classification report
    # --------------------------------------------------------

    print("\n")
    print("=" * 70)
    print("📋 CLASSIFICATION REPORT")
    print("=" * 70)

    report = classification_report(
        labels,
        predictions,
        target_names=test_dataset.classes,
        zero_division=0,
    )

    print(report)


    # --------------------------------------------------------
    # Confusion matrix
    # --------------------------------------------------------

    matrix = confusion_matrix(
        labels,
        predictions,
    )

    print_confusion_matrix(
        matrix,
        test_dataset.classes,
    )


    # --------------------------------------------------------
    # SAVE EVALUATION RESULTS
    # --------------------------------------------------------

    result_file = (
        PROJECT_ROOT
        / "ml"
        / "evaluation"
        / "evaluation_results.json"
    )

    evaluation_results = {
        "project": "AgriMind AI",
        "crop": crop,
        "model": "EfficientNet-B0",
        "image_size": "224x224",
        "test_images": len(test_dataset),
        "accuracy": round(accuracy * 100, 2),
        "precision": round(precision * 100, 2),
        "recall": round(recall * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "classes": test_dataset.classes,
        "confusion_matrix": matrix.tolist(),
    }

    with open(
        result_file,
        "w",
        encoding="utf-8",
    ) as file:

        import json

        json.dump(
            evaluation_results,
            file,
            indent=2,
        )

    print()
    print(
        f"💾 Evaluation results saved: {result_file}"
    )


    # --------------------------------------------------------
    # Final
    # --------------------------------------------------------

    print("\n")
    print("=" * 70)
    print("✅ MODEL EVALUATION COMPLETE")
    print("=" * 70)


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
        ),
    )

    args = parser.parse_args()

    evaluate_model(
        args.crop
    )


if __name__ == "__main__":

    main()
