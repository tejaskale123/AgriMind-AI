from typing import Optional
from fastapi import APIRouter, Header

from backend.app.services.search_service import perform_global_search

router = APIRouter()


# ============================================================
# AGRIMIND AI - GLOBAL APPLICATION SEARCH ENDPOINT
# ============================================================

@router.get("/search")
async def global_search(
    q: str = "",
    authorization: Optional[str] = Header(None)
):
    """
    End-to-end global search across crops, diseases, recommendations/advisory,
    detection history (user-specific when authenticated), and AI insights.
    """
    return perform_global_search(raw_query=q, authorization=authorization)
