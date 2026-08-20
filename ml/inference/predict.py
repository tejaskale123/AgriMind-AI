from pathlib import Path
import argparse

import torch
import torch.nn as nn

from PIL import Image

from torchvision import models, transforms


# ============================================================
# AGRIMIND AI
# MULTI-CROP SINGLE IMAGE DISEASE PREDICTION
# ============================================================


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = (
    Path(__file__).resolve().parents[2]
)

MODEL_ROOT = (
    PROJECT_ROOT / "models"
)


# ============================================================
# CONFIGURATION
# ============================================================

DEFAULT_IMAGE_SIZE = 224


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# IMAGE TRANSFORMATION
# Same preprocessing used for validation/test
# ============================================================

IMAGE_TRANSFORM = transforms.Compose(
    [
        transforms.Resize(
            (
                DEFAULT_IMAGE_SIZE,
                DEFAULT_IMAGE_SIZE
            )
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
# CREATE MODEL
# ============================================================

def create_model(num_classes):

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

    return model


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

def load_model(
    crop
):

    model_path = (
        MODEL_ROOT
        / f"{crop}_efficientnet_b0.pth"
    )


    print(
        "\nLoading trained model..."
    )


    print(
        f"Model path:\n{model_path}"
    )


    # --------------------------------------------------------
    # Check model
    # --------------------------------------------------------

    if not model_path.exists():

        raise FileNotFoundError(
            f"\nTrained model not found:\n"
            f"{model_path}\n\n"
            f"Train the {crop} model first."
        )


    # --------------------------------------------------------
    # Load checkpoint
    # --------------------------------------------------------

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE,
        weights_only=False
    )


    # --------------------------------------------------------
    # Read saved information
    # --------------------------------------------------------

    if not isinstance(
        checkpoint,
        dict
    ):

        raise ValueError(
            "\nInvalid model checkpoint."
        )


    if (
        "model_state_dict"
        not in checkpoint
    ):

        raise ValueError(
            "\nModel checkpoint does not "
            "contain model_state_dict."
        )


    # --------------------------------------------------------
    # Classes saved during training
    # --------------------------------------------------------

    classes = checkpoint.get(
        "classes"
    )


    if not classes:

        raise ValueError(
            "\nClass names were not found "
            "inside the model checkpoint."
        )


    # --------------------------------------------------------
    # Image size saved during training
    # --------------------------------------------------------

    image_size = checkpoint.get(
        "image_size",
        DEFAULT_IMAGE_SIZE
    )


    # --------------------------------------------------------
    # Create model
    # --------------------------------------------------------

    model = create_model(
        len(classes)
    )


    # --------------------------------------------------------
    # Load trained weights
    # --------------------------------------------------------

    model.load_state_dict(
        checkpoint[
            "model_state_dict"
        ]
    )


    # --------------------------------------------------------
    # Move model to device
    # --------------------------------------------------------

    model = model.to(
        DEVICE
    )


    # --------------------------------------------------------
    # Evaluation mode
    # --------------------------------------------------------

    model.eval()


    print(
        "\n✅ Model loaded successfully."
    )


    return (
        model,
        classes,
        image_size,
        checkpoint
    )


# ============================================================
# LOAD IMAGE
# ============================================================

def load_image(
    image_path
):

    image_path = Path(
        image_path
    )


    if not image_path.exists():

        raise FileNotFoundError(
            f"\nImage not found:\n"
            f"{image_path}"
        )


    print(
        "\nLoading image..."
    )


    image = Image.open(
        image_path
    ).convert(
        "RGB"
    )


    tensor = IMAGE_TRANSFORM(
        image
    )


    tensor = tensor.unsqueeze(
        0
    )


    tensor = tensor.to(
        DEVICE
    )


    return tensor


# ============================================================
# PREDICT IMAGE
# ============================================================

def predict_image(
    model,
    image,
    class_names
):

    with torch.no_grad():

        outputs = model(
            image
        )


        probabilities = (
            torch.softmax(
                outputs,
                dim=1
            )
        )


        confidence, predicted_index = (
            torch.max(
                probabilities,
                dim=1
            )
        )


    predicted_index = (
        predicted_index.item()
    )


    confidence = (
        confidence.item()
    )


    predicted_class = (
        class_names[
            predicted_index
        ]
    )


    return (
        predicted_class,
        confidence,
        probabilities
    )


# ============================================================
# DISPLAY RESULT
# ============================================================

def display_result(
    crop,
    image_path,
    predicted_class,
    confidence,
    probabilities,
    classes
):

    print(
        "\n" + "=" * 70
    )

    print(
        "🔬 PREDICTION RESULT"
    )

    print(
        "=" * 70
    )


    print(
        f"\nCrop              : "
        f"{crop}"
    )


    print(
        f"Image             : "
        f"{image_path}"
    )


    print(
        f"\nPredicted Disease : "
        f"{predicted_class}"
    )


    print(
        f"Confidence        : "
        f"{confidence * 100:.2f}%"
    )


    # --------------------------------------------------------
    # All class probabilities
    # --------------------------------------------------------

    print(
        "\nClass Probabilities:"
    )

    print(
        "-" * 70
    )


    for index, class_name in enumerate(
        classes
    ):

        probability = (
            probabilities[0][index]
            .item()
            * 100
        )


        print(
            f"{class_name:<30}"
            f"{probability:>7.2f}%"
        )


    print(
        "\n" + "=" * 70
    )


    print(
        "✅ PREDICTION COMPLETE"
    )


    print(
        "=" * 70
    )


# ============================================================
# MAIN PREDICTION FUNCTION
# ============================================================

def predict(
    image_path,
    crop
):

    print(
        "=" * 70
    )


    print(
        "🌱 AGRIMIND AI"
    )


    print(
        "SINGLE IMAGE DISEASE PREDICTION"
    )


    print(
        "=" * 70
    )


    print(
        f"\nCrop   : {crop}"
    )


    print(
        f"Device : {DEVICE}"
    )


    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    (
        model,
        classes,
        image_size,
        checkpoint
    ) = load_model(
        crop
    )


    # --------------------------------------------------------
    # Display model information
    # --------------------------------------------------------

    print(
        f"\nModel name:"
    )


    print(
        checkpoint.get(
            "model_name",
            "efficientnet_b0"
        )
    )


    print(
        f"\nTraining image size:"
    )


    print(
        image_size
    )


    print(
        f"\nSaved validation accuracy:"
    )


    validation_accuracy = checkpoint.get(
        "validation_accuracy"
    )


    if validation_accuracy is not None:

        print(
            f"{validation_accuracy * 100:.2f}%"
        )


    # --------------------------------------------------------
    # Display classes
    # --------------------------------------------------------

    print(
        "\nClasses:"
    )


    for index, class_name in enumerate(
        classes
    ):

        print(
            f"  {index}: {class_name}"
        )


    # --------------------------------------------------------
    # Load image
    # --------------------------------------------------------

    image = load_image(
        image_path
    )


    # --------------------------------------------------------
    # Predict
    # --------------------------------------------------------

    (
        predicted_class,
        confidence,
        probabilities
    ) = predict_image(
        model,
        image,
        classes
    )


    # --------------------------------------------------------
    # Display result
    # --------------------------------------------------------

    display_result(
        crop,
        image_path,
        predicted_class,
        confidence,
        probabilities,
        classes
    )


    # --------------------------------------------------------
    # Return structured result
    # --------------------------------------------------------

    probabilities_dict = {}


    for index, class_name in enumerate(
        classes
    ):

        probabilities_dict[
            class_name
        ] = float(
            probabilities[0][index]
            .item()
        )


    return {
        "crop": crop,

        "predicted_class":
            predicted_class,

        "confidence":
            float(confidence),

        "probabilities":
            probabilities_dict
    }


# ============================================================
# COMMAND LINE INTERFACE
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description=(
            "AgriMind AI "
            "Single Image Disease Prediction"
        )
    )


    parser.add_argument(
        "--image",
        required=True,
        help=(
            "Path to crop leaf image"
        )
    )


    parser.add_argument(
        "--crop",
        default="cotton",
        help=(
            "Crop name "
            "(example: cotton)"
        )
    )


    args = parser.parse_args()


    predict(
        args.image,
        args.crop.lower()
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()