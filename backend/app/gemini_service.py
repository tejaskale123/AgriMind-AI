from pathlib import Path
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ENV_PATH = PROJECT_ROOT / ".env"

load_dotenv(ENV_PATH)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = "gemini-2.5-flash"


# ============================================================
# GEMINI CLIENT
# ============================================================

def get_gemini_client():

    if not GEMINI_API_KEY:

        raise RuntimeError(
            "GEMINI_API_KEY was not found in .env"
        )

    return genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=types.HttpOptions(
            timeout=30000
        )
    )


# ============================================================
# AI RECOMMENDATION EXPLANATION
# ============================================================

def generate_ai_explanation(
    crop,
    disease,
    recommendation,
):

    recommendation = recommendation or {}

    farmer_action = recommendation.get(
        "farmer_action",
        ""
    )

    # ========================================================
    # SAFE FALLBACK
    # ========================================================

    fallback_explanation = (
        f"AgriMind AI detected {disease} in your {crop} crop. "
        f"{farmer_action}"
    )

    # ========================================================
    # GEMINI CLIENT
    # ========================================================

    try:

        client = get_gemini_client()

    except Exception as error:

        print(
            f"WARNING: Gemini client unavailable: {error}"
        )

        return fallback_explanation


    # ========================================================
    # GEMINI PROMPT
    # ========================================================

    prompt = f"""
Crop: {crop}

Detected condition: {disease}

Farmer action:
{farmer_action}

Explain this result to the farmer in exactly 2 short
complete sentences.

Use simple English.

Use only the information provided.

Do not invent any disease, treatment, pesticide,
dosage, or spray schedule.

Do not claim 100% certainty.
"""


    # ========================================================
    # GEMINI GENERATION
    # ========================================================

    try:

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=100,
                thinking_config=types.ThinkingConfig(
                    thinking_budget=0
                ),
            ),
        )

    except Exception as error:

        print(
            f"WARNING: Gemini AI explanation failed: {error}"
        )

        return fallback_explanation


    # ========================================================
    # RESPONSE CHECK
    # ========================================================

    if not response.text:

        return fallback_explanation


    return response.text.strip()