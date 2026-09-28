"""
AgriMind AI - Automatic Leaf Annotation Prototype Configuration
===============================================================

Phase 3E: Safe Automatic Leaf Annotation Prototype (5-Image Test)

STRICT SAFETY CONSTRAINTS:
- 100% read-only on datasets/processed/
- Zero image copy, move, rename, delete, resize, or modification
- Process ONLY the first 5 candidates from candidate_selection.csv
- Never fall back to the full image
- Strict validation rules; reject poor quality masks as REVIEW_REQUIRED
"""

from pathlib import Path

# Paths
MODULE_DIR = Path(__file__).resolve().parent
ANNOTATION_ROOT = MODULE_DIR.parent
LEAF_DETECTION_ROOT = ANNOTATION_ROOT.parent
ML_ROOT = LEAF_DETECTION_ROOT.parent
PROJECT_ROOT = ML_ROOT.parent

CANDIDATE_SELECTION_PATH = LEAF_DETECTION_ROOT / "candidate_selection.csv"
OUTPUTS_DIR = MODULE_DIR / "outputs"
JSON_DIR = OUTPUTS_DIR / "json"
MASKS_DIR = OUTPUTS_DIR / "masks"
PREVIEWS_DIR = OUTPUTS_DIR / "previews"

# Operational parameters
NUM_CANDIDATES = 5
TARGET_CATEGORY = "leaf"
CATEGORY_ID = 1

# Quality & Validation thresholds
MIN_POINTS = 3
MAX_POINTS = 120
MIN_AREA_RATIO = 0.05      # Reject regions < 5% of total image
MAX_AREA_RATIO = 0.98      # Reject regions covering > 98% (avoid full image fallback)
CONFIDENCE_THRESHOLD = 0.65 # Minimum confidence score required

# Morphology & Contour parameters
BORDER_MARGIN = 12         # Pixels near image border to treat as background boundary
MORPH_KERNEL_SIZE = 7      # Structuring element kernel size for morphological operations
POLYGON_EPSILON_FACTOR = 0.0035  # approxPolyDP epsilon multiplier (0.35% of contour perimeter)
