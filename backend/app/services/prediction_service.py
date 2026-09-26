import math
import io
import base64
import torch
import numpy as np
from PIL import Image, ImageStat, ImageFilter
from fastapi import HTTPException

from backend.app.core.config import DEVICE
from backend.app.core.constants import (
    MIN_IMAGE_WIDTH,
    MIN_IMAGE_HEIGHT,
    MIN_BRIGHTNESS,
    MAX_BRIGHTNESS,
    MIN_CONTRAST,
    MIN_CONFIDENCE,
    MIN_PLANT_SPECTRUM_RATIO,
    MIN_EDGE_VARIANCE,
    MAX_ENTROPY_RATIO,
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
import os
import cv2
from backend.app.database.database import save_detection_history
from backend.app.services.leaf_validator import (
    validate_is_plant_leaf,
    validate_crop_match,
)


# ============================================================
# OPENCV HAAR CASCADE CLASSIFIERS (HUMAN DETECTION)
# ============================================================

try:
    FACE_CASCADE = cv2.CascadeClassifier(
        os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    )
    PROFILE_CASCADE = cv2.CascadeClassifier(
        os.path.join(cv2.data.haarcascades, "haarcascade_profileface.xml")
    )
    UPPERBODY_CASCADE = cv2.CascadeClassifier(
        os.path.join(cv2.data.haarcascades, "haarcascade_upperbody.xml")
    )
except Exception:
    FACE_CASCADE = None
    PROFILE_CASCADE = None
    UPPERBODY_CASCADE = None


# ============================================================
# ADVANCED IMAGE & HUMAN CONTENT VALIDATION (SECURITY CHECK)
# ============================================================

def validate_plant_leaf_spectrum(
    image: Image.Image,
    crop: str = "cotton",
):
    """
    Advanced multi-layer security validator combining:
    1. OpenCV Haar cascades (Human face & upper body detection)
    2. YCrCb + RGB skin tone distribution detection
    3. Botanical foliage spectrum & chlorophyll green ratio verification
    """
    cv_img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)

    # 1. Botanical Green & Decay Spectrum
    # Green foliage: Hue 25..88 (OpenCV scale), Saturation >= 25, Value >= 25
    green_mask = (
        (hsv[:, :, 0] >= 25)
        & (hsv[:, :, 0] <= 88)
        & (hsv[:, :, 1] >= 25)
        & (hsv[:, :, 2] >= 25)
    )
    green_ratio = float(np.mean(green_mask))

    r = cv_img[:, :, 2].astype(np.float32)
    g = cv_img[:, :, 1].astype(np.float32)
    b = cv_img[:, :, 0].astype(np.float32)

    decay_mask = (
        (hsv[:, :, 0] >= 10)
        & (hsv[:, :, 0] < 25)
        & (hsv[:, :, 1] >= 35)
        & (g > b * 1.05)
        & (g >= r * 0.70)
    )
    plant_mask = green_mask | decay_mask
    plant_ratio = float(np.mean(plant_mask))

    # 2. Human Face & Upper Body Detection (Haar Cascades)
    # Checked when image does not have overwhelming green coverage
    if green_ratio < 0.20:
        if FACE_CASCADE and not FACE_CASCADE.empty():
            faces = FACE_CASCADE.detectMultiScale(
                gray, scaleFactor=1.15, minNeighbors=4, minSize=(30, 30)
            )
            if len(faces) > 0:
                return (
                    False,
                    "Human face detected. Please upload an image of a crop leaf.",
                )

        if PROFILE_CASCADE and not PROFILE_CASCADE.empty():
            profiles = PROFILE_CASCADE.detectMultiScale(
                gray, scaleFactor=1.15, minNeighbors=4, minSize=(30, 30)
            )
            if len(profiles) > 0:
                return (
                    False,
                    "Human face detected. Please upload an image of a crop leaf.",
                )

        if UPPERBODY_CASCADE and not UPPERBODY_CASCADE.empty():
            upper_bodies = UPPERBODY_CASCADE.detectMultiScale(
                gray, scaleFactor=1.15, minNeighbors=3, minSize=(45, 45)
            )
            if len(upper_bodies) > 0:
                return (
                    False,
                    "Person detected in the image. Please upload a clear photo of a crop leaf.",
                )

    # 3. YCrCb + RGB Skin Tone Detection
    ycrcb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2YCrCb)
    cr = ycrcb[:, :, 1]
    cb = ycrcb[:, :, 2]
    skin_mask = (
        (cr >= 133)
        & (cr <= 173)
        & (cb >= 77)
        & (cb <= 127)
        & (r > g * 1.15)
        & (r > b * 1.25)
        & (r > 70)
    )
    skin_ratio = float(np.mean(skin_mask))

    if skin_ratio > 0.12 and skin_ratio > plant_ratio * 0.6:
        return (
            False,
            "The uploaded image contains human skin or a portrait. Please upload a photo of a crop leaf.",
        )

    # 4. Botanical Foliage Requirement
    # A genuine crop leaf must have either sufficient green foliage (>= 6%) or plant tissue (>= 12%)
    if plant_ratio < 0.12 and green_ratio < 0.06:
        return (
            False,
            f"The uploaded image does not appear to contain a valid {crop} leaf. Please upload a clear photo of a plant leaf.",
        )

    return True, "Plant spectrum valid."


# ============================================================
# IMAGE QUALITY & STRUCTURE VALIDATION
# ============================================================

def validate_image_quality(
    image: Image.Image,
    crop: str = "cotton",
):
    width, height = image.size

    # 1. Resolution Check
    if width < MIN_IMAGE_WIDTH or height < MIN_IMAGE_HEIGHT:
        return (
            False,
            (
                "Image resolution is too low. "
                f"Please upload an image of at least "
                f"{MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT} pixels."
            ),
        )

    # 2. Grayscale & Contrast Statistics
    grayscale = image.convert("L")
    statistics = ImageStat.Stat(grayscale)
    brightness = statistics.mean[0]
    contrast = statistics.stddev[0]

    # Brightness Check
    if brightness < MIN_BRIGHTNESS:
        return (
            False,
            (
                "Image is too dark. "
                f"Please upload a brighter and clearer {crop} leaf image."
            ),
        )

    if brightness > MAX_BRIGHTNESS:
        return (
            False,
            (
                "Image is too bright. "
                f"Please upload a clear {crop} leaf image with proper lighting."
            ),
        )

    # Contrast Check
    if contrast < MIN_CONTRAST:
        return (
            False,
            (
                "Image has very low contrast. "
                f"Please upload a clear and visible {crop} leaf image."
            ),
        )

    # 3. Structural Edge / Texture Variance Check
    edges = grayscale.filter(ImageFilter.FIND_EDGES)
    edge_variance = ImageStat.Stat(edges).var[0]
    if edge_variance < MIN_EDGE_VARIANCE:
        return (
            False,
            (
                "Image lacks visible leaf structural details or texture. "
                "Please upload a focused photo of a crop leaf."
            ),
        )

    # 4. Plant Spectrum Check
    spectrum_valid, spectrum_msg = validate_plant_leaf_spectrum(image, crop)
    if not spectrum_valid:
        return False, spectrum_msg

    return (
        True,
        "Image quality is acceptable.",
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
        return {
            "success": False,
            "validation_error": "INVALID_PLANT_LEAF_IMAGE",
            "message": quality_message,
        }

    # 2. Generic Plant-Leaf Validation Security Gate
    is_plant_leaf, leaf_message = validate_is_plant_leaf(image)
    if not is_plant_leaf:
        return {
            "success": False,
            "validation_error": "INVALID_PLANT_LEAF_IMAGE",
            "message": "The uploaded image does not appear to contain a valid plant leaf. Please upload a clear photo of a crop leaf.",
        }

    # 3. Crop Validation Gate (Selected Crop Match)
    crop_matches, crop_message = validate_crop_match(image, crop)
    if not crop_matches:
        return {
            "success": False,
            "validation_error": "CROP_MISMATCH",
            "message": crop_message,
        }

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

    # 7. Entropy Calculation & Low Confidence / OOD Handling
    num_classes = len(selected_classes)
    log_p = torch.log2(probabilities + 1e-12)
    entropy = -torch.sum(probabilities * log_p).item()
    max_entropy = math.log2(num_classes) if num_classes > 1 else 1.0
    entropy_ratio = entropy / max_entropy

    if confidence_value < MIN_CONFIDENCE or entropy_ratio > MAX_ENTROPY_RATIO:
        return {
            "success": False,
            "crop": crop,
            "filename": filename,
            "prediction": predicted_class,
            "confidence": round(confidence_value, 2),
            "confidence_level": "Low",
            "probabilities": all_probabilities,
            "recommendation": None,
            "warning": (
                f"The uploaded image could not be identified as a valid {crop} leaf. "
                "Please upload a clear, focused photo of a plant leaf."
            ),
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
