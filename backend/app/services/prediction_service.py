import io
import base64
import torch
from PIL import Image, ImageStat
from fastapi import HTTPException

from backend.app.core.config import DEVICE
from backend.app.core.constants import (
    MIN_IMAGE_WIDTH,
    MIN_IMAGE_HEIGHT,
    MIN_BRIGHTNESS,
    MAX_BRIGHTNESS,
    MIN_CONTRAST,
    MIN_CONFIDENCE,
    IMAGE_TRANSFORM,
    PIGEON_PEA_CLASSES,
    COTTON_CLASSES,
    SOYBEAN_CLASSES,
    MAIZE_CLASSES,
    WHEAT_CLASSES,
)
from backend.app.models.model_loader import (
    pigeon_pea_model,
    cotton_model,
    soybean_model,
    maize_model,
    wheat_model,
)
from backend.app.database.database import save_detection_history


# ============================================================
# IMAGE QUALITY VALIDATION
# ============================================================

def validate_image_quality(
    image: Image.Image,
    crop: str = "cotton",
):
    width, height = image.size

    # Resolution
    if width < MIN_IMAGE_WIDTH or height < MIN_IMAGE_HEIGHT:
        return (
            False,
            (
                "Image resolution is too low. "
                f"Please upload an image of at least "
                f"{MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT} pixels."
            )
        )

    # Grayscale statistics
    grayscale = image.convert("L")
    statistics = ImageStat.Stat(grayscale)
    brightness = statistics.mean[0]
    contrast = statistics.stddev[0]

    # Brightness
    if brightness < MIN_BRIGHTNESS:
        return (
            False,
            (
                "Image is too dark. "
                "Please upload a brighter and clearer "
                f"{crop} leaf image."
            )
        )

    if brightness > MAX_BRIGHTNESS:
        return (
            False,
            (
                "Image is too bright. "
                f"Please upload a clear {crop} leaf image "
                "with proper lighting."
            )
        )

    # Contrast
    if contrast < MIN_CONTRAST:
        return (
            False,
            (
                "Image has very low contrast. "
                "Please upload a clear and visible "
                f"{crop} leaf image."
            )
        )

    return (
        True,
        "Image quality is acceptable."
    )


# ============================================================
# PREDICTION BUSINESS LOGIC
# ============================================================

def run_crop_prediction(
    image: Image.Image,
    crop: str,
    filename: str,
    image_bytes: bytes,
    file_content_type: str,
    user_id: int,
):
    """
    Executes PyTorch inference for the specified crop image, evaluates confidence,
    saves detection to SQLite history, and returns the prediction result payload.
    """
    # 1. Image Quality Check
    quality_valid, quality_message = validate_image_quality(image, crop)
    if not quality_valid:
        raise HTTPException(
            status_code=400,
            detail=quality_message,
        )

    # 2. Tensor Transformation
    tensor = IMAGE_TRANSFORM(image).unsqueeze(0).to(DEVICE)

    # 3. Model & Classes Selection
    if crop == "soybean":
        selected_model = soybean_model
        selected_classes = SOYBEAN_CLASSES
    elif crop == "maize":
        selected_model = maize_model
        selected_classes = MAIZE_CLASSES
    elif crop == "pigeon_pea":
        selected_model = pigeon_pea_model
        selected_classes = PIGEON_PEA_CLASSES
    elif crop == "wheat":
        selected_model = wheat_model
        selected_classes = WHEAT_CLASSES
    else:
        selected_model = cotton_model
        selected_classes = COTTON_CLASSES

    # 4. Model Inference
    with torch.no_grad():
        outputs = selected_model(tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        confidence, predicted_index = torch.max(probabilities, dim=0)

    predicted_index = predicted_index.item()
    predicted_class = selected_classes[predicted_index]
    confidence_value = confidence.item() * 100

    # 5. Confidence Level Evaluation
    if confidence_value >= 90:
        confidence_level = "Very High"
    elif confidence_value >= 80:
        confidence_level = "High"
    else:
        confidence_level = "Moderate"

    # 6. All Class Probabilities Dictionary
    all_probabilities = {}
    for index, class_name in enumerate(selected_classes):
        all_probabilities[class_name] = round(
            probabilities[index].item() * 100,
            2,
        )

    # 7. Low Confidence Handling
    if confidence_value < MIN_CONFIDENCE:
        return {
            "success": False,
            "crop": crop,
            "filename": filename,
            "prediction": predicted_class,
            "confidence": round(confidence_value, 2),
            "confidence_level": "Low",
            "probabilities": all_probabilities,
            "recommendation": None,
            "warning": f"Please upload a clearer {crop} leaf image.",
        }

    # 8. Save Detection History in SQLite
    b64_img = base64.b64encode(image_bytes).decode("utf-8")
    content_type = file_content_type or "image/jpeg"
    data_uri = f"data:{content_type};base64,{b64_img}"

    save_detection_history(
        user_id=user_id,
        filename=data_uri,
        crop=crop,
        prediction=predicted_class,
        confidence=round(confidence_value, 2),
        probabilities=all_probabilities,
        recommendation=None,
    )

    # 9. Final Response Payload
    return {
        "success": True,
        "crop": crop,
        "filename": filename,
        "prediction": predicted_class,
        "confidence": round(confidence_value, 2),
        "confidence_level": confidence_level,
        "probabilities": all_probabilities,
        "recommendation": None,
    }
