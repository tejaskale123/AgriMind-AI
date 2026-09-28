"""
AgriMind AI - Isolated Plant Leaf Detection & Segmentation Configuration
========================================================================

This configuration module is dedicated exclusively to the future crop-agnostic
Plant Leaf Detection / Segmentation ML component.

IMPORTANT CONSTRAINTS:
- CROP-AGNOSTIC: Detects and segments plant leaves across all crops.
- SINGLE RESPONSIBILITY: Answers only "Where is the plant leaf?".
- DOES NOT CLASSIFY: Does NOT predict Cotton, Soybean, Maize, Wheat, or Pigeon Pea diseases.
- FAIL-SAFE RULE: If a valid leaf is not confidently detected, the image is rejected.
  No fallback to full image.
- PRODUCTION ISOLATION: Production disease models (5 .pth models) remain completely separate.
"""

from pathlib import Path
from typing import Dict, List, Tuple


# =====================================================================
# DIRECTORY PATHS
# =====================================================================

MODULE_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = MODULE_ROOT.parent.parent

# Isolated leaf detection directories
DATASET_DIR = MODULE_ROOT / "dataset"
TRAINING_DIR = MODULE_ROOT / "training"
INFERENCE_DIR = MODULE_ROOT / "inference"
EVALUATION_DIR = MODULE_ROOT / "evaluation"
OUTPUTS_DIR = MODULE_ROOT / "outputs"

# Isolated model checkpoint storage
# (Completely separated from production models in models/*.pth)
LEAF_MODEL_DIR = PROJECT_ROOT / "models" / "leaf_detector"
LEAF_MODEL_WEIGHTS_PATH = LEAF_MODEL_DIR / "leaf_segmenter.onnx"
LEAF_MODEL_PYTORCH_PATH = LEAF_MODEL_DIR / "leaf_segmenter.pth"


# =====================================================================
# TARGET CLASS SPECIFICATION
# =====================================================================

# Crop-agnostic: The model has exactly ONE target class
CLASSES: List[str] = ["leaf"]
NUM_CLASSES: int = len(CLASSES)


# =====================================================================
# INPUT RESOLUTION & PREPROCESSING
# =====================================================================

# Model input dimensions (standard square input for segmentation/detection)
INPUT_WIDTH: int = 256
INPUT_HEIGHT: int = 256
INPUT_CHANNELS: int = 3

# Normalization constants (standard ImageNet statistics)
NORM_MEAN: Tuple[float, float, float] = (0.485, 0.456, 0.406)
NORM_STD: Tuple[float, float, float] = (0.229, 0.224, 0.225)


# =====================================================================
# INFERENCE & DETECTION THRESHOLDS
# =====================================================================

# Minimum model confidence score required to confirm a valid leaf
CONFIDENCE_THRESHOLD: float = 0.70

# Minimum IoU threshold for mask binarization
MASK_THRESHOLD: float = 0.50

# Minimum and maximum expected leaf area relative to total image area
MIN_LEAF_AREA_RATIO: float = 0.05   # Rejects tiny speckles / background weeds (< 5%)
MAX_LEAF_AREA_RATIO: float = 0.98   # Upper bounds


# =====================================================================
# FAIL-SAFE SECURITY RULE
# =====================================================================

# If True: The system rejects the image when leaf detection confidence < CONFIDENCE_THRESHOLD.
# CRITICAL: Must NEVER fallback to passing the full unverified image to the disease models.
REJECT_ON_NO_LEAF: bool = True
ALLOW_FALLBACK_TO_FULL_IMAGE: bool = False


# =====================================================================
# OPENCV CONTOUR & OUTLINE POST-PROCESSING
# =====================================================================

# Contour extraction settings
CONTOUR_MODE: str = "EXTERNAL"           # Extract only outermost boundary
CONTOUR_APPROX_METHOD: str = "SIMPLE"    # Compress horizontal, vertical, diagonal segments

# Polygon smoothing parameter (epsilon factor relative to arc length)
POLYGON_APPROX_EPSILON: float = 0.0025

# ROI padding margin (percentage to expand bounding box before cropping)
ROI_PADDING_PERCENT: float = 0.08        # 8% padding to avoid clipping lesion borders

# UI Vector outline display settings (for frontend overlay)
OUTLINE_STROKE_COLOR: str = "#22c55e"     # AgriMind emerald green
OUTLINE_STROKE_WIDTH: int = 2
OUTLINE_GLOW_COLOR: str = "rgba(34, 197, 94, 0.35)"
