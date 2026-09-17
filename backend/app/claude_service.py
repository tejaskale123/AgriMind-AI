from pathlib import Path
import asyncio
import json
import os

from dotenv import load_dotenv
from anthropic import Anthropic


# ============================================================
# PATH CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ENV_PATH = PROJECT_ROOT / ".env"

RECOMMENDATIONS_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "disease_recommendations.json"
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv(ENV_PATH)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# We intentionally use Claude Sonnet 4.5.
CLAUDE_MODEL = "claude-haiku-4-5-20251001"


# ============================================================
# CLAUDE CLIENT
# ============================================================

def get_claude_client():
    """
    Create and return the Anthropic client.

    The API key is loaded from the project's .env file.
    """

    if not ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY was not found in .env"
        )

    return Anthropic(
        api_key=ANTHROPIC_API_KEY
    )


# ============================================================
# FALLBACK RECOMMENDATION DATABASE
# ============================================================

def load_recommendations():
    """
    Load the local source-backed recommendation database.

    This database is used ONLY as a safety fallback when
    live Claude/Web Search information is unavailable.
    """

    if not RECOMMENDATIONS_PATH.exists():
        raise FileNotFoundError(
            f"Recommendation file not found: "
            f"{RECOMMENDATIONS_PATH}"
        )

    with open(
        RECOMMENDATIONS_PATH,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def get_verified_recommendation(disease: str):
    """
    Find the local fallback recommendation for the
    predicted disease.

    Returns None if the disease is not present.
    """

    recommendations = load_recommendations()

    # Direct match
    if disease in recommendations:
        return recommendations[disease]

    # Case-insensitive match
    disease_lower = disease.strip().lower()

    for name, recommendation in recommendations.items():
        if name.strip().lower() == disease_lower:
            return recommendation

    return None


# ============================================================
# SAFE UNKNOWN-DISEASE FALLBACK
# ============================================================

def get_unknown_disease_fallback():
    """
    Safe fallback when no verified recommendation exists.
    """

    return {
        "severity": "Unknown",

        "symptoms": (
            "Verified management information is not "
            "available for this predicted condition."
        ),

        "immediate_action": (
            "Inspect the affected plant carefully and "
            "consult a qualified local agriculture expert."
        ),

        "prevention": (
            "Follow locally recommended crop-management, "
            "sanitation and field-monitoring practices."
        ),

        "spray_guidance": (
            "Do not apply a chemical spray based only on "
            "the AI prediction. Follow the current registered "
            "local label or agricultural advisory."
        ),

        "treatment": (
            "No verified treatment information is currently "
            "available in the AgriMind AI fallback database."
        ),

        "farmer_action": (
            "Monitor the crop and seek local agricultural "
            "guidance if symptoms continue or spread."
        ),

        "source": (
            "AgriMind AI verified recommendation database"
        ),
    }


# ============================================================
# RESPONSE LANGUAGE
# ============================================================

SUPPORTED_LANGUAGES = {
    "en": "English",
    "mr": "Marathi",
    "hi": "Hindi",
}


def normalize_language(language: str | None) -> str:
    """Return a supported language code without breaking old callers."""

    if not language:
        return "en"

    language = str(language).strip().lower()

    # Accept common full-name values as well.
    aliases = {
        "english": "en",
        "marathi": "mr",
        "hindi": "hi",
    }

    language = aliases.get(language, language)

    if language not in SUPPORTED_LANGUAGES:
        return "en"

    return language


def get_response_language_instruction(language: str | None) -> str:
    """Create a strict output-language instruction for Claude."""

    code = normalize_language(language)
    language_name = SUPPORTED_LANGUAGES[code]

    return f"""
OUTPUT LANGUAGE REQUIREMENT:

Write ALL farmer-facing recommendation text in {language_name}.

Language code: {code}

Important:
- Keep the JSON field names exactly in English:
  severity, symptoms, immediate_action, prevention,
  spray_guidance, treatment, farmer_action, source.
- Translate the VALUES of those fields into {language_name}.
- Keep scientific names, pathogen names, product names, organization
  names, URLs, units, percentages and other technical identifiers
  accurate.
- Do not translate URLs.
- Do not change the ML prediction itself.
- Do not invent a disease name.
- If an official source title is available, preserve the official
  organization/source name accurately.
- The final JSON must remain valid JSON.
"""


# ============================================================
# CLAUDE RECOMMENDATION GENERATION
# ============================================================

def generate_claude_recommendation(
    crop: str,
    disease: str,
    confidence: float | None = None,
    language: str = "en",
):
    """
    Generate current Plant Care & Management information
    using Claude and live web search in the selected language.

    Flow:

        ML prediction
            ↓
        Claude Sonnet 4.5
            ↓
        Live web search
            ↓
        Trusted agricultural sources
            ↓
        Structured farmer guidance

    The local disease_recommendations.json database is used
    only as a safe fallback if Claude/Web Search fails.
    """

    # --------------------------------------------------------
    # LOCAL FALLBACK
    # --------------------------------------------------------

    verified_recommendation = get_verified_recommendation(
        disease
    )

    if not verified_recommendation:
        verified_recommendation = (
            get_unknown_disease_fallback()
        )

    # --------------------------------------------------------
    # MODEL CONFIDENCE
    # --------------------------------------------------------

    confidence_text = (
        f"{confidence:.2f}%"
        if confidence is not None
        else "Not provided"
    )

    # --------------------------------------------------------
    # LIVE WEB SEARCH PROMPT
    # --------------------------------------------------------

    language_instruction = get_response_language_instruction(language)

    prompt = f"""
You are the agricultural management assistant for AgriMind AI.

The machine-learning model has already analyzed the uploaded
crop image and predicted the condition below.

You MUST NOT change, re-classify, or override the ML prediction.

Crop:
{crop}

Predicted condition:
{disease}

ML model confidence:
{confidence_text}

Your task is to provide CURRENT, PRACTICAL and SOURCE-BACKED
Plant Care & Management guidance for this exact crop and
predicted condition.

You MUST use the web search tool before answering.

SEARCH REQUIREMENTS:

1. Search for CURRENT agricultural information relevant to
   {crop} {disease}.

2. Prefer official Indian agricultural sources, especially:
   - Tamil Nadu Agricultural University (TNAU)
   - Indian Council of Agricultural Research (ICAR)
   - Central Institute for Cotton Research (CICR)
   - Other official Indian agricultural institutions only
   when directly relevant.

3. Prefer recent/current agricultural advisories, disease
   management pages, extension information and official
   agricultural recommendations.

4. Do NOT use information about another crop merely because
   the disease name is similar.

5. For cotton diseases, make sure the information is actually
   relevant to cotton.

6. If a search result is about fruit anthracnose, lupin
   anthracnose, mango anthracnose, chilli anthracnose or
   another non-cotton crop, DO NOT use it for cotton guidance.

7. Do not invent facts when reliable current information
   cannot be found.

SAFETY REQUIREMENTS:

8. Do NOT invent pesticides, fungicides, bactericides,
   biological products, doses, concentrations, spray intervals,
   schedules or application methods.

9. If an official source provides a chemical recommendation,
   report it only as source-backed guidance and preserve any
   local-label, crop-stage, registration or advisory limitations.

10. Never recommend a chemical solely because it is commonly
    used for a similar disease.

11. Prefer sustainable practices when supported by reliable
    sources, including:
    - field sanitation
    - removal of affected plant material
    - drainage
    - canopy management
    - avoiding prolonged leaf/boll wetness
    - crop hygiene
    - monitoring
    - resistant varieties where officially supported
    - biological or cultural practices where officially supported

12. Do not claim that the ML prediction is 100% certain.

13. The recommendation must be understandable to farmers.

14. Do not tell the farmer to blindly follow an AI prediction.
    The prediction is an indication and field verification is
    important.

CURRENT INFORMATION REQUIREMENT:

The answer must be based primarily on information retrieved
during THIS request's web search.

Do not simply reproduce the local fallback database.

The local fallback database may be used only when:
- live web search fails,
- no useful trusted source is found, or
- a specific management detail cannot safely be established.

{language_instruction}

SOURCE REQUIREMENT:

The "source" field must contain the important source name(s)
and URL(s) used for the recommendation.

Do not claim that a source supports information if it does not.

Return ONLY valid JSON matching the required schema.
"""


# ============================================================
# JSON SCHEMA
# ============================================================

recommendation_schema = {
    "type": "object",

    "properties": {
        "severity": {
            "type": "string"
        },

        "symptoms": {
            "type": "string"
        },

        "immediate_action": {
            "type": "string"
        },

        "prevention": {
            "type": "string"
        },

        "spray_guidance": {
            "type": "string"
        },

        "treatment": {
            "type": "string"
        },

        "farmer_action": {
            "type": "string"
        },

        "source": {
            "type": "string"
        }
    },

    "required": [
        "severity",
        "symptoms",
        "immediate_action",
        "prevention",
        "spray_guidance",
        "treatment",
        "farmer_action",
        "source"
    ],

    "additionalProperties": False
}


# ============================================================
# CALL CLAUDE + LIVE WEB SEARCH
# ============================================================

try:
    def _call_claude_with_web_search(
            prompt: str,
            output_schema: dict = None,
        ):
        """
        Call Claude Sonnet 4.5 with Anthropic's server-side
        web search tool.

        Search is restricted to trusted agricultural domains.
        """

        client = get_claude_client()

        response = client.messages.create(
            model=CLAUDE_MODEL,

            max_tokens=1800,

            tools=[
                {
                    "type": "web_search_20250305",
                    "name": "web_search",

                    # Limit the number of searches so the request
                    # remains controlled and predictable.
                    "max_uses": 3,

                    # Trusted agricultural sources.
                    "allowed_domains": [
                        "agritech.tnau.ac.in",
                        "tnau.ac.in",
                        "icar.gov.in",
                        "cicr.gov.in"
                    ]
                }
            ],

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            output_config={
                "format": {
                    "type": "json_schema",
                    "schema": (
                        output_schema
                        or recommendation_schema
                    )
                }
            }
        )

        return response

except Exception:
    _call_claude_with_web_search = None


# ============================================================
# STREAMED SECTION RECOMMENDATIONS
# ============================================================

SECTION_FIELDS = {
    "symptoms": [
        "severity",
        "symptoms",
        "immediate_action",
    ],
    "management": [
        "prevention",
        "spray_guidance",
        "treatment",
    ],
    "follow_up": [
        "farmer_action",
        "source",
    ],
}


def _section_schema(fields):
    return {
        "type": "object",
        "properties": {
            field: {"type": "string"}
            for field in fields
        },
        "required": fields,
        "additionalProperties": False,
    }


def _section_fallback(disease, section):
    fallback = get_verified_recommendation(disease)

    if not fallback:
        fallback = get_unknown_disease_fallback()

    return {
        field: fallback.get(field, "")
        for field in SECTION_FIELDS[section]
    }


def _generate_recommendation_section(
    crop,
    disease,
    confidence,
    section,
    language="en",
):
    fields = SECTION_FIELDS[section]
    confidence_text = (
        f"{confidence:.2f}%"
        if confidence is not None
        else "Not provided"
    )

    language_instruction = get_response_language_instruction(language)

    prompt = f"""
You are one section of AgriMind AI's agricultural assistant.

Crop: {crop}
Predicted condition: {disease}
ML confidence: {confidence_text}

Use web search now. Prefer current official Indian agricultural
sources, especially TNAU, ICAR and CICR. Use only information
relevant to this crop and disease. Do not change the ML prediction.
Do not invent pesticides, doses, concentrations or schedules.
Prefer practical cultural, sanitation, moisture and monitoring
guidance. Mention local labels and expert advice where applicable.

Return only valid JSON with exactly these string fields:
{', '.join(fields)}

{language_instruction}
"""

    if _call_claude_with_web_search is None:
        raise RuntimeError(
            "Claude web-search function is unavailable."
        )

    response = _call_claude_with_web_search(
        prompt,
        output_schema=_section_schema(fields),
    )

    response_text = next(
        (
            block.text
            for block in response.content
            if block.type == "text"
        ),
        None,
    )

    if not response_text:
        raise RuntimeError(
            "Claude returned an empty section response."
        )

    result = json.loads(response_text)

    if any(
        not isinstance(result.get(field), str)
        for field in fields
    ):
        raise RuntimeError(
            "Claude returned an invalid section response."
        )

    return result


async def stream_claude_recommendation(
    crop: str,
    disease: str,
    confidence: float | None = None,
    language: str = "en",
):
    """Yield three concurrent recommendation sections as they finish.

    The language parameter is optional for backward compatibility.
    Existing callers continue to receive English.
    """

    async def run_section(section):
        try:
            result = await asyncio.to_thread(
                _generate_recommendation_section,
                crop,
                disease,
                confidence,
                section,
                language,
            )
        except Exception as error:
            print(
                f"WARNING: Recommendation section failed: {error}"
            )
            result = _section_fallback(disease, section)

        return section, result

    tasks = [
        asyncio.create_task(run_section(section))
        for section in SECTION_FIELDS
    ]

    for task in asyncio.as_completed(tasks):
        section, result = await task

        yield {
            "section": section,
            "data": result,
        }


# ============================================================
# PUBLIC RECOMMENDATION FUNCTION
# ============================================================

def _generate_realtime_recommendation(
    crop: str,
    disease: str,
    confidence: float | None,
    language: str = "en",
):
    """
    Generate a real-time recommendation using Claude
    and live agricultural web search.
    """

    confidence_text = (
        f"{confidence:.2f}%"
        if confidence is not None
        else "Not provided"
    )

    language_instruction = get_response_language_instruction(language)

    prompt = f"""
You are the agricultural management assistant for AgriMind AI.

The ML model has already predicted:

Crop: {crop}
Predicted condition: {disease}
Model confidence: {confidence_text}

Do NOT change the predicted condition.

Use the web search tool NOW.

Find current, reliable and crop-specific agricultural
information for:

{crop} + {disease}

IMPORTANT:

- Prefer official Indian agricultural sources.
- Prefer TNAU, ICAR and CICR.
- Search current disease-management information.
- Make sure the disease information is actually for
  the specified crop.
- Reject results belonging to other crops.
- Do not use generic anthracnose information from fruit,
  lupin or other crops for cotton anthracnose.
- Do not invent chemical products or spray doses.
- If a chemical recommendation is found, report it only
  when clearly supported by the official source.
- Preserve label/local-advisory limitations.
- Prefer sustainable, cultural, sanitation and biological
  management when supported.
- Do not claim 100% certainty.
- Give practical farmer-facing advice.

{language_instruction}

The response MUST contain exactly these fields:

severity
symptoms
immediate_action
prevention
spray_guidance
treatment
farmer_action
source

The source field MUST identify the official sources used,
including their URLs.

Return ONLY valid JSON.
"""

    if _call_claude_with_web_search is None:
        raise RuntimeError(
            "Claude web-search function is unavailable."
        )

    response = _call_claude_with_web_search(prompt)

    response_text = None

    for block in response.content:
        if block.type == "text":
            response_text = block.text
            break

    if not response_text:
        raise RuntimeError(
            "Claude returned an empty response."
        )

    result = json.loads(response_text)

    # --------------------------------------------------------
    # BASIC STRUCTURE VALIDATION
    # --------------------------------------------------------

    required_fields = [
        "severity",
        "symptoms",
        "immediate_action",
        "prevention",
        "spray_guidance",
        "treatment",
        "farmer_action",
        "source"
    ]

    for field in required_fields:
        if field not in result:
            raise RuntimeError(
                f"Claude response missing field: {field}"
            )

        if not isinstance(result[field], str):
            raise RuntimeError(
                f"Claude response field is not a string: {field}"
            )

    return result


# ============================================================
# FINAL PUBLIC API
# ============================================================

def generate_claude_recommendation(
    crop: str,
    disease: str,
    confidence: float | None = None,
    language: str = "en",
):
    """
    Main AgriMind AI recommendation function.

    Priority:

        1. Claude Sonnet 4.5 + live web search
        2. Local verified recommendation database

    This keeps the application working safely even when
    the external API or web search is temporarily unavailable.
    """

    try:

        realtime_result = _generate_realtime_recommendation(
            crop=crop,
            disease=disease,
            confidence=confidence,
            language=language,
        )

        print(
            "INFO: Claude real-time agricultural "
            "web-search recommendation generated."
        )

        return realtime_result

    except Exception as error:

        print(
            "WARNING: Claude real-time recommendation failed: "
            f"{error}"
        )

        # ----------------------------------------------------
        # SAFE FALLBACK
        # ----------------------------------------------------

        fallback = get_verified_recommendation(
            disease
        )

        if fallback:
            print(
                "INFO: Using local verified recommendation "
                "database as fallback."
            )

            return fallback

        return get_unknown_disease_fallback()