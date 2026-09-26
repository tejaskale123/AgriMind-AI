import os
import re
import math
import torch
import torch.nn as nn
from torchvision import models
from PIL import Image, ImageStat, ImageFilter
import numpy as np
import cv2

from backend.app.core.config import DEVICE
from backend.app.core.constants import (
    MIN_IMAGE_WIDTH,
    MIN_IMAGE_HEIGHT,
    MIN_BRIGHTNESS,
    MAX_BRIGHTNESS,
    MIN_CONTRAST,
    MIN_EDGE_VARIANCE,
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
# PRETRAINED IMAGENET FOUNDATION CLASSIFIER & FEATURE EXTRACTOR
# ============================================================

_imagenet_weights = models.EfficientNet_B0_Weights.DEFAULT
_imagenet_categories = _imagenet_weights.meta["categories"]
_imagenet_preprocess = _imagenet_weights.transforms()

# Pretrained base model
_imagenet_model = models.efficientnet_b0(weights=_imagenet_weights)
_imagenet_model.eval()
_imagenet_model.to(DEVICE)


class _FeatureExtractor(nn.Module):
    def __init__(self, m):
        super().__init__()
        self.features = m.features
        self.avgpool = m.avgpool

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        return x


_feature_extractor = _FeatureExtractor(_imagenet_model)
_feature_extractor.eval()


# ============================================================
# CROP VALIDATOR CLASSIFIER (5 SUPPORTED CROPS)
# ============================================================

SUPPORTED_CROPS = ["cotton", "soybean", "maize", "wheat", "pigeon_pea"]
CROP_DISPLAY_NAMES = {
    "cotton": "Cotton",
    "soybean": "Soybean",
    "maize": "Maize",
    "wheat": "Wheat",
    "pigeon_pea": "Pigeon Pea",
}

_crop_classifier = nn.Linear(1280, len(SUPPORTED_CROPS))
_weights_file = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "crop_validator_weights.pth",
)

if os.path.exists(_weights_file):
    try:
        _crop_classifier.load_state_dict(
            torch.load(_weights_file, map_location=DEVICE)
        )
    except Exception as e:
        print(f"Warning: Failed to load crop validator weights: {e}")
_crop_classifier.eval()
_crop_classifier.to(DEVICE)


# ============================================================
# NON-LEAF OBJECT CATEGORIES (GENERIC BLACKLIST)
# ============================================================

NON_LEAF_KEYWORDS = [
    # Electronics & Devices
    "cellular telephone", "telephone", "dial telephone", "modem", "ipod", "remote control",
    "laptop", "notebook", "computer keyboard", "keyboard", "mouse", "monitor", "screen",
    "television", "radio", "cassette", "tape player", "loudspeaker", "microphone", "web site",
    "digital clock", "analog clock", "wall clock", "stopwatch", "scoreboard", "hand-held computer",
    # Vehicles & Transportation
    "car", "automobile", "sports car", "convertible", "limousine", "minivan", "cab", "beach wagon",
    "jeep", "landrover", "racer", "grille", "car wheel", "bus", "school bus", "trolleybus",
    "truck", "pickup", "trailer truck", "fire engine", "garbage truck", "tow truck",
    "motorcycle", "moped", "bicycle", "mountain bike", "tandem bicycle",
    "tractor", "harvester", "thresher", "plow", "lawn mower",
    "airplane", "airliner", "space shuttle", "speedboat", "canoe", "lifeboat",
    # People & Apparel
    "suit", "sweatshirt", "jersey", "trench coat", "fur coat", "cardigan", "coat",
    "brassiere", "bikini", "swimming trunks", "jean", "skirt", "hoopskirt", "gown",
    "sock", "shoe", "running shoe", "sandal", "boot", "cowboy boot",
    "wig", "hair slide", "hair spray", "sunscreen", "sunglasses", "gasmask", "ski mask",
    # Furniture & Household
    "desk", "dining table", "coffee table", "chair", "folding chair", "rocking chair",
    "barber chair", "toilet seat", "studio couch", "sofa", "bed", "wardrobe", "bookcase",
    "filing cabinet", "refrigerator", "microwave", "toaster", "dishwasher", "vacuum",
    "pillow", "quilt", "doormat", "washbasin", "bathtub",
    # Tools & Hardware
    "hammer", "screwdriver", "wrench", "pliers", "hatchet", "axe", "power drill",
    "chainsaw", "shovel", "nail", "screw", "padlock", "combination lock", "safe",
    # Animals (Domestic & wild mammals, birds, pets)
    "dog", "terrier", "retriever", "hound", "shepherd", "spaniel", "poodle", "collie",
    "cat", "tabby", "siamese", "persian", "cougar", "lion", "tiger", "cheetah", "leopard",
    "bear", "panda", "horse", "zebra", "cow", "ox", "water buffalo", "pig", "wild boar",
    "sheep", "ram", "goat", "llama", "camel", "elephant", "rhino", "hippo", "monkey", "ape",
    "gorilla", "chimpanzee", "baboon", "squirrel", "rabbit", "hare", "mouse", "rat",
    # Food (Prepared food / dishes)
    "pizza", "cheeseburger", "hotdog", "bagel", "pretzel", "burrito", "sandwich",
    "ice cream", "french loaf", "meat loaf", "trifle", "consomme", "espresso",
    # Documents / Print
    "comic book", "book jacket", "envelope", "packet", "carton", "menu", "crossword puzzle"
]


def _matches_non_leaf_keyword(category_name: str) -> bool:
    """Checks if a category name contains any non-leaf keyword with word boundary."""
    lower_cat = category_name.lower()
    for kw in NON_LEAF_KEYWORDS:
        pattern = r"\b" + re.escape(kw) + r"\b"
        if re.search(pattern, lower_cat):
            return True
    return False


# ============================================================
# GATE 1: GENERIC PLANT-LEAF VALIDATION
# ============================================================

def validate_is_plant_leaf(image: Image.Image) -> tuple[bool, str]:
    """
    GENERIC PLANT-LEAF VALIDATION SECURITY GATE.
    Verifies that the uploaded image contains a genuine plant leaf suitable
    for crop disease analysis.
    
    Rejects:
    - Mobile phones, laptops, keyboards, mice, electronics
    - People, faces, hands, bodies
    - Cars, bikes, vehicles, tractors, farm equipment
    - Buildings, rooms, furniture, tools
    - Animals, prepared food, documents, screenshots
    - Completely dark, blank, blurry, soil-only or unusable images
    
    Accepts:
    - Genuine plant leaves from all supported crops (healthy, diseased,
      yellow, brown, spotted, dry, camera photos, varied lighting/backgrounds).
    """
    width, height = image.size

    # 1. Minimum Resolution
    if width < MIN_IMAGE_WIDTH or height < MIN_IMAGE_HEIGHT:
        return (
            False,
            f"Image resolution is too low ({width}x{height}). "
            f"Please upload an image of at least {MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT} pixels."
        )

    # 2. Grayscale & Contrast Statistics
    grayscale = image.convert("L")
    stats = ImageStat.Stat(grayscale)
    brightness = stats.mean[0]
    contrast = stats.stddev[0]

    # Brightness Check (completely dark / completely blank)
    if brightness < MIN_BRIGHTNESS:
        return (
            False,
            "The uploaded image is too dark or empty. Please upload a clear photo of a crop leaf."
        )

    if brightness > MAX_BRIGHTNESS:
        return (
            False,
            "The uploaded image is overexposed or blank white. Please upload a clear photo of a crop leaf."
        )

    # Contrast Check (flat / solid color)
    if contrast < MIN_CONTRAST:
        return (
            False,
            "The uploaded image lacks contrast or detail. Please upload a clear photo of a crop leaf."
        )

    # Structural Texture & Edge Variance Check
    edges = grayscale.filter(ImageFilter.FIND_EDGES)
    edge_variance = ImageStat.Stat(edges).var[0]
    if edge_variance < MIN_EDGE_VARIANCE:
        return (
            False,
            "The uploaded image lacks visible structural detail or texture. Please upload a focused photo of a crop leaf."
        )

    # 3. Blur / Sharpness Check (Laplacian Variance)
    cv_img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray_cv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    laplacian_var = float(cv2.Laplacian(gray_cv, cv2.CV_64F).var())
    if laplacian_var < 5.0:
        return (
            False,
            "The uploaded image is too blurry to identify leaf structures. Please upload a sharp, focused crop leaf image."
        )

    # 4. Color Spectrum & Biological Plant Tissue Check
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    # Foliage green (healthy tissue):
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

    # Chlorotic yellow (senescence / disease symptom):
    chlorotic_yellow = (
        (hsv[:, :, 0] >= 18)
        & (hsv[:, :, 0] < 25)
        & (hsv[:, :, 1] >= 25)
        & (hsv[:, :, 2] >= 25)
        & (g > b)
    )
    # Necrotic lesion brown/tan (blight, spots, rust, necrosis):
    necrotic_brown = (
        (hsv[:, :, 0] >= 8)
        & (hsv[:, :, 0] < 18)
        & (hsv[:, :, 1] >= 20)
        & (hsv[:, :, 2] >= 20)
        & (g > b * 1.02)
        & (g >= r * 0.65)
    )
    plant_mask = green_mask | chlorotic_yellow | necrotic_brown
    plant_ratio = float(np.mean(plant_mask))

    # 5. Human Skin Tone Check (YCrCb)
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
            "The uploaded image does not appear to contain a valid plant leaf. Please upload a clear photo of a crop leaf."
        )

    # Human Presence Detection (Haar Cascades)
    # Triggered when potential human skin is detected and green foliage is low
    if green_ratio < 0.20 and skin_ratio > 0.08:
        if FACE_CASCADE and not FACE_CASCADE.empty():
            faces = FACE_CASCADE.detectMultiScale(
                gray_cv, scaleFactor=1.15, minNeighbors=5, minSize=(45, 45)
            )
            if len(faces) > 0:
                return (
                    False,
                    "The uploaded image does not appear to contain a valid plant leaf. Please upload a clear photo of a crop leaf."
                )

        if PROFILE_CASCADE and not PROFILE_CASCADE.empty():
            profiles = PROFILE_CASCADE.detectMultiScale(
                gray_cv, scaleFactor=1.15, minNeighbors=5, minSize=(45, 45)
            )
            if len(profiles) > 0:
                return (
                    False,
                    "The uploaded image does not appear to contain a valid plant leaf. Please upload a clear photo of a crop leaf."
                )

        if UPPERBODY_CASCADE and not UPPERBODY_CASCADE.empty():
            upper_bodies = UPPERBODY_CASCADE.detectMultiScale(
                gray_cv, scaleFactor=1.15, minNeighbors=6, minSize=(60, 60)
            )
            if len(upper_bodies) > 0 and skin_ratio > 0.15:
                return (
                    False,
                    "The uploaded image does not appear to contain a valid plant leaf. Please upload a clear photo of a crop leaf."
                )

    # Any genuine crop leaf (healthy or diseased) must exhibit organic plant tissue.
    # Non-leaf objects (cars, phones, computers, sky, asphalt, bare soil) have < 5% plant tissue.
    if plant_ratio < 0.05 and green_ratio < 0.03:
        return (
            False,
            "The uploaded image does not appear to contain a valid plant leaf. Please upload a clear photo of a crop leaf."
        )

    # 6. Deep Pretrained ImageNet Object Verification
    # ImageNet-1K classifies 1000 common world objects with high accuracy.
    try:
        tensor = _imagenet_preprocess(image).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            outputs = _imagenet_model(tensor)
            probs = torch.softmax(outputs, dim=1)[0]
            top3_prob, top3_idx = torch.topk(probs, 3)

        # Check top-1 and top-3 against non-leaf keywords with word boundaries
        for idx_rank, (p, idx) in enumerate(zip(top3_prob, top3_idx)):
            cat_name = _imagenet_categories[idx.item()]
            prob = p.item()
            if _matches_non_leaf_keyword(cat_name):
                # Strong match on non-leaf object
                if (idx_rank == 0 and prob > 0.10) or prob > 0.18:
                    return (
                        False,
                        "The uploaded image does not appear to contain a valid plant leaf. Please upload a clear photo of a crop leaf."
                    )
    except Exception as e:
        print(f"Warning: ImageNet validation error: {e}")

    return True, "Valid plant leaf detected."


# ============================================================
# GATE 2: CROP VALIDATION GATE (MATCH WITH SELECTED CROP)
# ============================================================

def validate_crop_match(image: Image.Image, selected_crop: str) -> tuple[bool, str]:
    """
    CROP VALIDATION GATE.
    Verifies that the plant leaf corresponds to the crop selected by the user.
    Example:
    If User selected Cotton, but uploaded image is a Soybean leaf -> REJECT (CROP_MISMATCH).
    """
    crop_key = selected_crop.strip().lower()
    if crop_key not in SUPPORTED_CROPS:
        return False, f"Unsupported crop: {selected_crop}."

    display_name = CROP_DISPLAY_NAMES.get(crop_key, crop_key.title())

    try:
        tensor = _imagenet_preprocess(image).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            features = _feature_extractor(tensor)
            logits = _crop_classifier(features)
            probs = torch.softmax(logits, dim=1)[0]

        crop_idx = SUPPORTED_CROPS.index(crop_key)
        selected_prob = probs[crop_idx].item()

        best_prob, best_idx = torch.max(probs, dim=0)
        best_crop = SUPPORTED_CROPS[best_idx.item()]

        # If predicted crop is clearly different and selected crop has low confidence
        if best_crop != crop_key and best_prob.item() > 0.60 and selected_prob < 0.20:
            return (
                False,
                f"The uploaded image does not appear to be a {display_name} leaf. Please upload a clear {display_name} leaf image."
            )

    except Exception as e:
        print(f"Warning: Crop match validation error: {e}")

    return True, f"Crop matches {display_name}."
