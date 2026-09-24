import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from backend.app.auth import verify_access_token
from backend.app.core.security import oauth2_scheme
from backend.app.claude_service import stream_claude_recommendation
from backend.app.services.recommendation_service import (
    get_disease_recommendation_payload,
)

router = APIRouter()


@router.get("/recommendation/stream")
async def recommendation_stream(
    crop: str,
    disease: str,
    confidence: float | None = None,
    language: str = "en",
    token: str = Depends(oauth2_scheme),
):
    """
    Server-Sent Events (SSE) streaming endpoint for AI agricultural advice from Claude.
    """
    current_user = verify_access_token(token)

    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    async def event_stream():
        try:
            async for event in stream_claude_recommendation(
                crop=crop,
                disease=disease,
                confidence=confidence,
                language=language,
            ):
                yield (
                    "data: "
                    + json.dumps(event, ensure_ascii=False)
                    + "\n\n"
                )

            yield "data: {\"done\": true}\n\n"

        except Exception as error:
            yield (
                "data: "
                + json.dumps(
                    {
                        "error": (
                            "Recommendation stream failed: "
                            f"{error}"
                        )
                    },
                    ensure_ascii=False,
                )
                + "\n\n"
            )

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/recommendation/{disease}")
def get_recommendation(disease: str):
    """
    Retrieves comprehensive plant care, spray schedule, and prevention guidance
    for a given crop disease.
    """
    return get_disease_recommendation_payload(disease)
