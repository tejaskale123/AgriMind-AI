import json
from pathlib import Path


# ============================================================
# ADD WHEAT DISEASE RECOMMENDATIONS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent

recommendation_file = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "disease_recommendations.json"
)


# ------------------------------------------------------------
# Wheat recommendations
# ------------------------------------------------------------

wheat_recommendations = {

    "Brown_Rust": {
        "severity": "Moderate",
        "symptoms": [
            "Small reddish-brown rust-colored pustules may appear on wheat leaves.",
            "Rust spots may increase as the disease develops.",
            "Severely affected leaves may lose green color and show reduced plant vigor."
        ],
        "immediate_action": [
            "Inspect nearby wheat plants for similar symptoms.",
            "Monitor the affected area regularly for disease spread.",
            "Avoid unnecessary movement through affected crop areas."
        ],
        "treatment": [
            "Use integrated disease management practices.",
            "Maintain balanced crop nutrition and avoid unnecessary plant stress.",
            "Use only locally approved disease-management products when recommended by an agricultural expert."
        ],
        "spray_guidance": [
            "Do not select a chemical treatment based only on an AI image prediction.",
            "Use only a product with a current label claim for wheat and the diagnosed disease.",
            "Verify the product, dose, waiting period and application instructions from the product label or local agricultural advisory before spraying."
        ],
        "prevention": [
            "Use healthy and disease-free seed.",
            "Monitor the crop regularly for early symptoms.",
            "Follow locally recommended wheat disease management practices.",
            "Avoid unnecessary movement of plant material between affected and healthy areas."
        ],
        "farmer_action": "Monitor the affected crop and consult a local agriculture expert before applying any chemical treatment."
    },


    "Yellow_Rust": {
        "severity": "High",
        "symptoms": [
            "Yellow to yellow-orange rust-colored pustules may appear in lines on wheat leaves.",
            "Affected leaves may gradually lose green color.",
            "Severe infection may reduce plant vigor and grain development."
        ],
        "immediate_action": [
            "Inspect nearby wheat plants for similar symptoms.",
            "Monitor the crop frequently for increasing disease spread.",
            "Mark areas showing strong symptoms for closer monitoring."
        ],
        "treatment": [
            "Follow locally recommended integrated disease management practices.",
            "Use only an approved treatment when the disease has been confirmed.",
            "Consult a local agriculture expert for the appropriate management decision."
        ],
        "spray_guidance": [
            "Do not rely on an image prediction alone to select a chemical treatment.",
            "Use only a product with a current label claim for wheat and the diagnosed disease.",
            "Verify product, dose, waiting period and safety instructions from the product label or local agricultural advisory."
        ],
        "prevention": [
            "Use healthy seed and suitable wheat varieties recommended for the local area.",
            "Monitor the crop regularly during periods favorable to disease development.",
            "Maintain good crop management practices.",
            "Remove or manage heavily affected areas according to local agricultural guidance."
        ],
        "farmer_action": "Monitor disease spread closely and consult a local agriculture expert before applying chemical treatment."
    },


    "Healthy": {
        "severity": "Healthy",
        "symptoms": [
            "No significant wheat disease symptoms detected.",
            "Leaf appearance is consistent with a healthy wheat plant."
        ],
        "immediate_action": [
            "No disease treatment is currently indicated.",
            "Continue regular crop monitoring."
        ],
        "treatment": [
            "No disease treatment is currently indicated."
        ],
        "spray_guidance": [
            "Do not spray fungicide only because of an AI result showing a healthy leaf.",
            "Use crop protection products only when there is a justified need and an appropriate label recommendation."
        ],
        "prevention": [
            "Continue regular crop monitoring.",
            "Use healthy seed.",
            "Maintain appropriate irrigation and crop nutrition.",
            "Follow locally recommended wheat crop management practices."
        ],
        "farmer_action": "Continue normal crop monitoring and consult a local agriculture expert if new symptoms appear."
    }
}


# ============================================================
# LOAD EXISTING JSON
# ============================================================

with open(
    recommendation_file,
    "r",
    encoding="utf-8"
) as file:
    recommendations = json.load(file)


# ============================================================
# ADD / UPDATE WHEAT ENTRIES
# ============================================================

for disease, data in wheat_recommendations.items():
    recommendations[disease] = data


# ============================================================
# SAVE JSON
# ============================================================

with open(
    recommendation_file,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        recommendations,
        file,
        indent=2,
        ensure_ascii=False
    )


print("=" * 60)
print("WHEAT RECOMMENDATIONS ADDED SUCCESSFULLY")
print("=" * 60)

print("\nAdded diseases:")

for disease in wheat_recommendations:
    print(f"  - {disease}")

print("\nUpdated file:")
print(recommendation_file)

print("\nRecommendation update completed.")