"""
AgriMind-AI — Human Verification Workspace Configuration
=========================================================
Strictly Isolated, Read-Only Data Binding, Safe Verification Config.
"""

from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parents[3]

MANIFEST_PATH = BASE_DIR / "verification_manifest.csv"
DECISIONS_DIR = BASE_DIR / "decisions"
EXPORTS_DIR = BASE_DIR / "exports"
LOGS_DIR = BASE_DIR / "logs"

# Ensure runtime directories exist
DECISIONS_DIR.mkdir(parents=True, exist_ok=True)
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Server Configuration
SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8088

# Decision Labels
DECISION_LABELS = [
    "APPROVED",
    "MINOR_REVIEW",
    "REJECT_BACKGROUND",
    "REJECT_WRONG_BOUNDARY",
    "REJECT_WHOLE_FRAME",
    "UNCERTAIN"
]

# Population Allocations
POPULATION_TARGETS = {
    "Population A": 150,
    "Population B": 81,
    "Total": 231
}

CROP_TARGETS = {
    "Cotton": 49,
    "Soybean": 37,
    "Maize": 73,
    "Wheat": 5,
    "Pigeon Pea": 67,
    "Total": 231
}

# Label Definitions for UI
LABEL_DESCRIPTIONS = {
    "APPROVED": "Single target leaf is correctly segmented and background is sufficiently excluded.",
    "MINOR_REVIEW": "Main leaf is correct but small boundary defects exist, such as minor tip/petiole clipping.",
    "REJECT_BACKGROUND": "Significant soil, background, or adjacent foliage is included.",
    "REJECT_WRONG_BOUNDARY": "Polygon/mask does not follow the target leaf boundary.",
    "REJECT_WHOLE_FRAME": "Segmentation captures most of the image rather than the target leaf.",
    "UNCERTAIN": "Human reviewer cannot confidently decide."
}
