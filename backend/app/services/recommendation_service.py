import json
from fastapi import HTTPException

from backend.app.core.config import RECOMMENDATION_PATH
from backend.app.core.constants import CROP_CLASSES


# ============================================================
# LOAD DISEASE RECOMMENDATIONS DATA
# ============================================================

def load_recommendations():
    """
    Loads JSON recommendation guidance dataset from RECOMMENDATION_PATH.
    """
    if not RECOMMENDATION_PATH.exists():
        print(
            f"WARNING: Recommendation file not found:\n{RECOMMENDATION_PATH}"
        )
        return {}

    try:
        with open(RECOMMENDATION_PATH, "r", encoding="utf-8") as file:
            recommendations = json.load(file)
        print("Disease recommendations loaded successfully.")
        return recommendations
    except Exception as error:
        print(f"ERROR loading recommendations: {error}")
        return {}


DISEASE_RECOMMENDATIONS = load_recommendations()


# ============================================================
# RECOMMENDATION LOOKUP & FORMATTING
# ============================================================

def find_recommendation(disease_name: str):
    """
    Finds recommendation details for a given disease name, handling spaces,
    underscores, hyphens, and case differences.
    """
    if not disease_name:
        return None

    # Direct match first
    recommendation = DISEASE_RECOMMENDATIONS.get(disease_name)
    if recommendation is not None:
        return recommendation

    # Normalize the requested disease name
    normalized_name = (
        disease_name
        .replace("_", " ")
        .replace("-", " ")
        .strip()
        .casefold()
    )

    # Search all JSON keys using normalized names
    for key, value in DISEASE_RECOMMENDATIONS.items():
        normalized_key = (
            str(key)
            .replace("_", " ")
            .replace("-", " ")
            .strip()
            .casefold()
        )
        if normalized_key == normalized_name:
            return value

    return None


def get_disease_recommendation_payload(disease: str):
    """
    Retrieves the recommendation dictionary payload for GET /recommendation/{disease}.
    Raises HTTP 404 if no matching recommendation is found.
    """
    disease_name = (
        disease
        .replace("-", " ")
        .replace("_", " ")
        .strip()
    )

    recommendation = find_recommendation(disease)

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail=f"No recommendation found for disease: {disease_name}"
        )

    return {
        "success": True,
        "crop": list(CROP_CLASSES.keys()),
        "disease": disease_name,
        "recommendation": recommendation,
    }
