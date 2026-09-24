import io
from PIL import Image
from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Depends

from backend.app.auth import verify_access_token
from backend.app.core.security import oauth2_scheme
from backend.app.services.prediction_service import run_crop_prediction

router = APIRouter()


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    crop: str = Form("cotton"),
    token: str = Depends(oauth2_scheme),
):
    """
    Multi-crop AI disease prediction endpoint.
    Accepts crop leaf image file and crop type ('cotton', 'soybean', 'maize', 'wheat', 'pigeon_pea').
    """
    current_user = verify_access_token(token)

    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    user_id = current_user["user_id"]
    crop_name = crop.strip().lower()

    if crop_name not in [
        "cotton",
        "soybean",
        "maize",
        "wheat",
        "pigeon_pea",
    ]:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported crop: {crop_name}. "
                "Supported crops are cotton, soybean, maize and wheat."
            ),
        )

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid image format. "
                "Please upload JPG, PNG or WEBP."
            ),
        )

    try:
        image_bytes = await file.read()
        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the uploaded image.",
        )

    return run_crop_prediction(
        image=image,
        crop=crop_name,
        filename=file.filename,
        image_bytes=image_bytes,
        file_content_type=file.content_type or "image/jpeg",
        user_id=user_id,
    )
