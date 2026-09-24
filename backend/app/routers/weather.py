from typing import Optional
from fastapi import APIRouter, HTTPException

from backend.app.weather_service import fetch_weather_data, search_locations

router = APIRouter()


# ============================================================
# AGRIMIND AI - WEATHER & ADVISORY ENDPOINTS
# ============================================================

@router.get("/weather")
async def get_weather(
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
):
    """
    Get full weather, forecast (hourly/daily), crop advisories, alerts, and farming tips.
    Supports location name (e.g., 'Pune', 'Mumbai') or latitude/longitude coordinates.
    """
    try:
        data = await fetch_weather_data(
            location_query=location,
            latitude=lat,
            longitude=lon
        )
        return data
    except Exception as e:
        print(f"[API /weather] Error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Weather data is temporarily unavailable: {str(e)}"
        )


@router.get("/weather/current")
async def get_current_weather(
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
):
    """
    Get only current weather snapshot.
    """
    try:
        data = await fetch_weather_data(location_query=location, latitude=lat, longitude=lon)
        return {
            "success": True,
            "location": data.get("location"),
            "current": data.get("current"),
            "updatedAt": data.get("updatedAt"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weather/forecast")
async def get_weather_forecast(
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
):
    """
    Get 24-hour and 7-day forecast.
    """
    try:
        data = await fetch_weather_data(location_query=location, latitude=lat, longitude=lon)
        return {
            "success": True,
            "location": data.get("location"),
            "hourly": data.get("hourly"),
            "daily": data.get("daily"),
            "updatedAt": data.get("updatedAt"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weather/advisory")
async def get_weather_advisory(
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
):
    """
    Get crop advisories, weather alerts, and farming tips.
    """
    try:
        data = await fetch_weather_data(location_query=location, latitude=lat, longitude=lon)
        return {
            "success": True,
            "location": data.get("location"),
            "advisory": data.get("advisory"),
            "alerts": data.get("alerts"),
            "farmingTips": data.get("farmingTips"),
            "updatedAt": data.get("updatedAt"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weather/search")
async def search_weather_locations(q: str):
    """
    Search location suggestions for dynamic city/region lookup.
    """
    if not q or len(q.strip()) < 2:
        return {"success": True, "results": []}
    results = await search_locations(q)
    return {"success": True, "results": results}
