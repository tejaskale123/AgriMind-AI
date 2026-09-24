from torchvision import transforms

# ============================================================
# AGRIMIND AI
# MULTI-CROP CLASSES
# ============================================================

PIGEON_PEA_CLASSES = [
    "Healthy",
    "Leaf_Spot",
    "Leaf_webber",
    "Sterilic_mosaic",
]

COTTON_CLASSES = [
    "Alternaria Leaf Spot",
    "Anthracnose",
    "Bacterial Blight",
    "Boll Rot",
    "Cercospora Leaf Spot",
    "Fusarium Wilt",
    "Grey Areolate Mildew",
    "Healthy Leaf",
    "Verticillium Wilt",
]

SOYBEAN_CLASSES = [
    "Bacterial_Blight",
    "Bacterial_Pustule",
    "Cercospora_Leaf_Blight",
    "Downy_Mildew",
    "Frogeye_Leaf_Spot",
    "Healthy",
    "Rust",
    "Septoria_Brown_Spot",
    "Sudden_Death_Syndrome",
    "Target_Spot",
    "Yellow_Mosaic_Disease",
]

MAIZE_CLASSES = [
    "Asphalt_Stain",
    "Bacterial_Leaf_Streak",
    "Bipolaris",
    "Blight",
    "Common_Rust",
    "Eyespot",
    "Gray_Leaf_Spot",
    "Healthy",
    "Maize_Lethal_Necrosis",
    "Maize_Streak_Disease",
    "Phaeosphaeria_Leaf_Spot",
    "Southern_Rust",
    "Stenocarpella",
]

WHEAT_CLASSES = [
    "Black_Rust",
    "Brown_Rust",
    "Fusarium_Head_Blight",
    "Healthy",
    "Leaf_Blight",
    "Loose_Smut",
    "Powdery_Mildew",
    "Septoria",
    "Tan_Spot",
    "Yellow_Rust",
]

CROP_CLASSES = {
    "pigeon_pea": PIGEON_PEA_CLASSES,
    "cotton": COTTON_CLASSES,
    "soybean": SOYBEAN_CLASSES,
    "maize": MAIZE_CLASSES,
    "wheat": WHEAT_CLASSES,
}


# ============================================================
# MODEL CONFIGURATION
# ============================================================

IMAGE_SIZE = 224


# ============================================================
# IMAGE QUALITY CONFIGURATION
# ============================================================

MIN_IMAGE_WIDTH = 224
MIN_IMAGE_HEIGHT = 224

MIN_BRIGHTNESS = 25
MAX_BRIGHTNESS = 235

MIN_CONTRAST = 15

MIN_CONFIDENCE = 70.0


# ============================================================
# IMAGE TRANSFORM
# MUST MATCH TRAINING / INFERENCE
# ============================================================

IMAGE_TRANSFORM = transforms.Compose(
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
