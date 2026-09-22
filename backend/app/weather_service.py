"""
AGRIMIND AI - WEATHER & ADVISORY SERVICE
Integrates real-time meteorological APIs, geocoding, 7-day & hourly forecasting,
dynamic crop advisories, and weather risk alerts.
"""

import os
import httpx
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

# Weather API Environment Configuration
OPENWEATHER_API_KEY = os.getenv("WEATHER_API_KEY") or os.getenv("OPENWEATHER_API_KEY", "")

# Weather Code (WMO) Mapping to Descriptions & Icons
WMO_WEATHER_MAP = {
    0: {"condition": "Clear Sky", "icon": "sunny", "category": "clear"},
    1: {"condition": "Mainly Clear", "icon": "mainly-clear", "category": "clear"},
    2: {"condition": "Partly Cloudy", "icon": "partly-cloudy", "category": "cloudy"},
    3: {"condition": "Overcast", "icon": "overcast", "category": "cloudy"},
    45: {"condition": "Foggy", "icon": "fog", "category": "fog"},
    48: {"condition": "Depositing Rime Fog", "icon": "fog", "category": "fog"},
    51: {"condition": "Light Drizzle", "icon": "drizzle", "category": "rain"},
    53: {"condition": "Moderate Drizzle", "icon": "drizzle", "category": "rain"},
    55: {"condition": "Dense Drizzle", "icon": "drizzle", "category": "rain"},
    56: {"condition": "Light Freezing Drizzle", "icon": "drizzle", "category": "rain"},
    57: {"condition": "Dense Freezing Drizzle", "icon": "drizzle", "category": "rain"},
    61: {"condition": "Slight Rain", "icon": "rain", "category": "rain"},
    62: {"condition": "Moderate Rain", "icon": "rain", "category": "rain"},
    63: {"condition": "Moderate Rain", "icon": "rain", "category": "rain"},
    65: {"condition": "Heavy Rain", "icon": "heavy-rain", "category": "rain"},
    66: {"condition": "Light Freezing Rain", "icon": "rain", "category": "rain"},
    67: {"condition": "Heavy Freezing Rain", "icon": "heavy-rain", "category": "rain"},
    71: {"condition": "Slight Snow Fall", "icon": "snow", "category": "snow"},
    73: {"condition": "Moderate Snow Fall", "icon": "snow", "category": "snow"},
    75: {"condition": "Heavy Snow Fall", "icon": "snow", "category": "snow"},
    77: {"condition": "Snow Grains", "icon": "snow", "category": "snow"},
    80: {"condition": "Slight Rain Showers", "icon": "rain-showers", "category": "rain"},
    81: {"condition": "Moderate Rain Showers", "icon": "rain-showers", "category": "rain"},
    82: {"condition": "Violent Rain Showers", "icon": "heavy-rain", "category": "rain"},
    85: {"condition": "Slight Snow Showers", "icon": "snow", "category": "snow"},
    86: {"condition": "Heavy Snow Showers", "icon": "snow", "category": "snow"},
    95: {"condition": "Thunderstorm", "icon": "thunderstorm", "category": "storm"},
    96: {"condition": "Thunderstorm with Slight Hail", "icon": "thunderstorm", "category": "storm"},
    99: {"condition": "Thunderstorm with Heavy Hail", "icon": "thunderstorm", "category": "storm"},
}

# OpenWeather Icon code to AgriMind UI Icon name mapping
OWM_ICON_MAP = {
    "01d": "sunny", "01n": "sunny",
    "02d": "partly-cloudy", "02n": "partly-cloudy",
    "03d": "cloudy", "03n": "cloudy",
    "04d": "overcast", "04n": "overcast",
    "09d": "drizzle", "09n": "drizzle",
    "10d": "rain", "10n": "rain",
    "11d": "thunderstorm", "11n": "thunderstorm",
    "13d": "snow", "13n": "snow",
    "50d": "fog", "50n": "fog"
}

def get_wmo_info(code: int) -> Dict[str, str]:
    return WMO_WEATHER_MAP.get(code, {"condition": "Partly Cloudy", "icon": "partly-cloudy", "category": "cloudy"})

# Default fallback coordinate (Pune, Maharashtra)
DEFAULT_LOCATION = {
    "name": "Pune",
    "region": "Maharashtra",
    "country": "India",
    "latitude": 18.5204,
    "longitude": 73.8567,
}

async def geocode_location(query: str) -> Dict[str, Any]:
    """
    Search coordinates and location metadata for a city/region name.
    Multi-stage fallback: Open-Meteo direct -> Open-Meteo primary token -> OpenStreetMap Nominatim.
    """
    query_clean = query.strip()
    if not query_clean:
        return DEFAULT_LOCATION

    # If coordinates are passed in query format "lat,lon"
    if "," in query_clean:
        parts = [p.strip() for p in query_clean.split(",")]
        try:
            lat = float(parts[0])
            lon = float(parts[1])
            return await reverse_geocode(lat, lon)
        except ValueError:
            pass

    # 1. Try Open-Meteo search with full query
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={httpx.URL('', params={'q': query_clean}).params.get('q')}&count=5&language=en&format=json"
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(f"https://geocoding-api.open-meteo.com/v1/search?name={query_clean}&count=5&language=en&format=json")
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                if results:
                    top = results[0]
                    return {
                        "name": top.get("name", query_clean.title()),
                        "region": top.get("admin1", ""),
                        "country": top.get("country", ""),
                        "latitude": float(top.get("latitude")),
                        "longitude": float(top.get("longitude")),
                    }
    except Exception as e:
        print(f"[WeatherService] Open-Meteo geocoding error for '{query_clean}': {e}")

    # 2. If query contains comma (e.g. "Pune, Maharashtra" or "Asalgaon, India"), try primary city/place name
    if "," in query_clean:
        primary_name = query_clean.split(",")[0].strip()
        if primary_name:
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(f"https://geocoding-api.open-meteo.com/v1/search?name={primary_name}&count=5&language=en&format=json")
                    if resp.status_code == 200:
                        data = resp.json()
                        results = data.get("results", [])
                        if results:
                            top = results[0]
                            return {
                                "name": top.get("name", primary_name.title()),
                                "region": top.get("admin1", ""),
                                "country": top.get("country", ""),
                                "latitude": float(top.get("latitude")),
                                "longitude": float(top.get("longitude")),
                            }
            except Exception as e:
                print(f"[WeatherService] Open-Meteo primary token geocoding error: {e}")

    # 3. Fallback to OpenStreetMap Nominatim (High resolution for Indian villages, talukas & districts)
    try:
        headers = {"User-Agent": "AgriMind-AI/1.0 (Smart Agriculture Weather)"}
        async with httpx.AsyncClient(timeout=8.0) as client:
            osm_resp = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": query_clean, "format": "json", "addressdetails": 1, "limit": 1},
                headers=headers
            )
            if osm_resp.status_code == 200:
                osm_results = osm_resp.json()
                if osm_results:
                    top_osm = osm_results[0]
                    addr = top_osm.get("address", {})
                    place_name = (
                        addr.get("village")
                        or addr.get("town")
                        or addr.get("city")
                        or addr.get("city_district")
                        or addr.get("county")
                        or top_osm.get("name")
                        or query_clean.title()
                    )
                    state_name = addr.get("state", addr.get("state_district", ""))
                    country_name = addr.get("country", "India")
                    return {
                        "name": place_name,
                        "region": state_name,
                        "country": country_name,
                        "latitude": float(top_osm.get("lat")),
                        "longitude": float(top_osm.get("lon")),
                    }
    except Exception as e:
        print(f"[WeatherService] Nominatim fallback geocoding error for '{query_clean}': {e}")

    # Final Fallback to default Pune if search fails
    return {
        "name": query_clean.title(),
        "region": "Maharashtra",
        "country": "India",
        "latitude": DEFAULT_LOCATION["latitude"],
        "longitude": DEFAULT_LOCATION["longitude"],
    }

async def search_locations(query: str, limit: int = 6) -> List[Dict[str, Any]]:
    """
    Search multiple location suggestions for auto-complete.
    Uses Open-Meteo with fallback to Nominatim.
    """
    query_clean = query.strip()
    if not query_clean:
        return []

    # 1. Try Open-Meteo
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={query_clean}&count={limit}&language=en&format=json"
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                if results:
                    formatted = []
                    for item in results:
                        name = item.get("name", "")
                        admin1 = item.get("admin1", "")
                        country = item.get("country", "")
                        formatted.append({
                            "name": name,
                            "region": admin1,
                            "country": country,
                            "latitude": float(item.get("latitude")),
                            "longitude": float(item.get("longitude")),
                            "label": f"{name}{', ' + admin1 if admin1 else ''}{', ' + country if country else ''}",
                        })
                    return formatted
    except Exception as e:
        print(f"[WeatherService] Search error Open-Meteo: {e}")

    # 2. Nominatim auto-complete fallback
    try:
        headers = {"User-Agent": "AgriMind-AI/1.0 (Smart Agriculture Weather)"}
        async with httpx.AsyncClient(timeout=6.0) as client:
            osm_resp = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": query_clean, "format": "json", "addressdetails": 1, "limit": limit},
                headers=headers
            )
            if osm_resp.status_code == 200:
                osm_results = osm_resp.json()
                formatted = []
                for item in osm_results:
                    addr = item.get("address", {})
                    name = (
                        addr.get("village")
                        or addr.get("town")
                        or addr.get("city")
                        or addr.get("city_district")
                        or addr.get("county")
                        or item.get("name")
                        or query_clean.title()
                    )
                    admin1 = addr.get("state", addr.get("state_district", ""))
                    country = addr.get("country", "")
                    formatted.append({
                        "name": name,
                        "region": admin1,
                        "country": country,
                        "latitude": float(item.get("lat")),
                        "longitude": float(item.get("lon")),
                        "label": f"{name}{', ' + admin1 if admin1 else ''}{', ' + country if country else ''}",
                    })
                return formatted
    except Exception as e:
        print(f"[WeatherService] Search error Nominatim: {e}")

    return []

async def reverse_geocode(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Reverse geocode coordinates into city and state/country.
    """
    url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json&zoom=10"
    headers = {"User-Agent": "AgriMind-AI/1.0 (Smart Agriculture Weather)"}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                address = data.get("address", {})
                city = (
                    address.get("city")
                    or address.get("town")
                    or address.get("village")
                    or address.get("county")
                    or address.get("state_district")
                    or "My Location"
                )
                state = address.get("state", "")
                country = address.get("country", "")
                return {
                    "name": city,
                    "region": state,
                    "country": country,
                    "latitude": latitude,
                    "longitude": longitude,
                }
    except Exception as e:
        print(f"[WeatherService] Reverse geocoding error: {e}")

    return {
        "name": "Current Location",
        "region": "",
        "country": "",
        "latitude": latitude,
        "longitude": longitude,
    }

def generate_crop_advisories(
    current_temp: float,
    humidity: int,
    wind_speed: float,
    rain_sum_next_24h: float,
    max_temp_week: float,
    min_temp_week: float,
    crop_name: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generates intelligent agronomic advisories based on real meteorological parameters.
    """
    # 1. Irrigation Advisory
    if rain_sum_next_24h >= 10.0:
        irrigation = {
            "title": "Irrigation Advisory",
            "tag": "Delay Irrigation",
            "status": "warning",
            "advice": f"Substantial rainfall (~{rain_sum_next_24h:.1f} mm) is expected within the next 24-48 hours. Postpone scheduled irrigation to avoid waterlogging and root rot."
        }
    elif rain_sum_next_24h >= 2.0:
        irrigation = {
            "title": "Irrigation Advisory",
            "tag": "Hold Off",
            "status": "info",
            "advice": "Light to moderate showers predicted soon. Hold off irrigation and check natural soil moisture depth before re-watering."
        }
    elif humidity < 40 and current_temp > 30:
        irrigation = {
            "title": "Irrigation Advisory",
            "tag": "Irrigate Today",
            "status": "urgent",
            "advice": "High temperatures and low atmospheric humidity increase evapotranspiration. Schedule drip/furrow irrigation during early morning or evening hours."
        }
    else:
        irrigation = {
            "title": "Irrigation Advisory",
            "tag": "Optimal Moisture",
            "status": "good",
            "advice": "Current soil and atmospheric moisture levels are balanced. Maintain routine field irrigation schedules according to crop growth stage."
        }

    # 2. Pest & Disease Weather Risk
    if humidity >= 75 and current_temp >= 22:
        pest = {
            "title": "Pest & Disease Risk",
            "tag": "High Fungal Risk",
            "status": "danger",
            "advice": f"High relative humidity ({humidity}%) and warm temperatures ({current_temp}°C) create ideal conditions for foliar blight, rust, and fungal spore proliferation. Scout crop canopies closely."
        }
    elif humidity >= 65 and current_temp >= 28:
        pest = {
            "title": "Pest & Disease Risk",
            "tag": "Moderate Sucking Pest",
            "status": "warning",
            "advice": "Warm and humid microclimate can promote whitefly, thrips, and aphid buildup. Inspect leaf undersides and install yellow sticky traps."
        }
    else:
        pest = {
            "title": "Pest & Disease Risk",
            "tag": "Low Risk",
            "status": "good",
            "advice": "Current weather parameters do not favor rapid pest or disease outbreaks. Continue standard weekly crop scouting."
        }

    # 3. Fertilizer Application Advisory
    if rain_sum_next_24h >= 12.0:
        fertilizer = {
            "title": "Fertilizer Application",
            "tag": "Avoid Spraying",
            "status": "danger",
            "advice": "Heavy rainfall will cause surface runoff and nutrient leaching. Do not apply urea, foliar micronutrients, or pesticides until the rain passes."
        }
    elif wind_speed > 25.0:
        fertilizer = {
            "title": "Fertilizer Application",
            "tag": "High Drift Risk",
            "status": "warning",
            "advice": f"Gusty winds ({wind_speed:.1f} km/h) will cause spray drift and uneven droplet coverage. Postpone foliar nutrient sprays until wind speeds drop below 15 km/h."
        }
    else:
        fertilizer = {
            "title": "Fertilizer Application",
            "tag": "Suitable Window",
            "status": "good",
            "advice": "Calm winds and dry atmospheric conditions are ideal for soil top-dressing and foliar fertilizer absorption over the next 48 hours."
        }

    # 4. Sowing & Field Operations
    if rain_sum_next_24h > 35.0:
        sowing = {
            "title": "Sowing & Operations",
            "tag": "Heavy Rain Caution",
            "status": "warning",
            "advice": "Soil saturation and pooling will impede seed emergence. Delay direct sowing and machinery operations until excess water drains."
        }
    elif min_temp_week < 10.0:
        sowing = {
            "title": "Sowing & Operations",
            "tag": "Low Temp Alert",
            "status": "info",
            "advice": "Cold night temperatures may slow germination. Ensure certified cold-tolerant seed varieties are selected."
        }
    else:
        sowing = {
            "title": "Sowing & Operations",
            "tag": "Favorable Conditions",
            "status": "good",
            "advice": "Soil temperature and moisture profiles are well-suited for planned field preparation, inter-cultivation, and sowing activities."
        }

    return [
        {
            "id": "irrigation",
            "type": "irrigation",
            "title": irrigation["title"],
            "timeframe": irrigation["tag"],
            "description": irrigation["advice"],
            "status": irrigation["status"],
        },
        {
            "id": "pest",
            "type": "pest",
            "title": pest["title"],
            "timeframe": pest["tag"],
            "description": pest["advice"],
            "status": pest["status"],
        },
        {
            "id": "fertilizer",
            "type": "fertilizer",
            "title": fertilizer["title"],
            "timeframe": fertilizer["tag"],
            "description": fertilizer["advice"],
            "status": fertilizer["status"],
        },
        {
            "id": "sowing",
            "type": "sowing",
            "title": sowing["title"],
            "timeframe": sowing["tag"],
            "description": sowing["advice"],
            "status": sowing["status"],
        },
    ]

def generate_weather_alerts(
    current_temp: float,
    humidity: int,
    wind_speed: float,
    daily_precip_max: float,
    daily_temp_max: float,
    daily_temp_min: float,
) -> List[Dict[str, Any]]:
    """
    Generates real actionable meteorological alerts when risk thresholds are met.
    """
    alerts = []

    # 1. Heavy Precipitation Alert
    if daily_precip_max >= 25.0:
        alerts.append({
            "id": "heavy_rain",
            "title": "Heavy Rainfall Expected",
            "severity": "High",
            "badgeColor": "red",
            "description": f"Significant rainfall predicted (up to {daily_precip_max:.1f} mm). Risk of waterlogging in low-lying crop beds.",
            "farmerAction": "Clear field drainage channels and move harvested produce to covered shelters."
        })
    elif daily_precip_max >= 12.0:
        alerts.append({
            "id": "mod_rain",
            "title": "Moderate Rain Anticipated",
            "severity": "Medium",
            "badgeColor": "amber",
            "description": f"Light to moderate showers likely ({daily_precip_max:.1f} mm). May affect field spray efficacy.",
            "farmerAction": "Plan field harvesting and pesticide applications around rain windows."
        })

    # 2. Strong Wind Alert
    if wind_speed >= 35.0:
        alerts.append({
            "id": "strong_wind",
            "title": "Strong Wind Advisory",
            "severity": "High",
            "badgeColor": "red",
            "description": f"Gusty winds reaching {wind_speed:.1f} km/h may cause crop lodging in tall crops (Maize, Sugarcane, Banana).",
            "farmerAction": "Provide earthing-up and mechanical staking for vulnerable plants."
        })
    elif wind_speed >= 22.0:
        alerts.append({
            "id": "breeze_wind",
            "title": "Brisk Wind Notice",
            "severity": "Medium",
            "badgeColor": "amber",
            "description": f"Wind speeds around {wind_speed:.1f} km/h. High potential for pesticide drift.",
            "farmerAction": "Avoid foliar spraying during peak afternoon wind hours."
        })

    # 3. Heat Wave / Temperature Rise Alert
    if daily_temp_max >= 38.0:
        alerts.append({
            "id": "heat_wave",
            "title": "High Heat Wave Warning",
            "severity": "High",
            "badgeColor": "red",
            "description": f"Peak daytime temperatures will reach {daily_temp_max:.1f}°C. Severe moisture stress on flowering crops.",
            "farmerAction": "Apply light, frequent evening irrigations and organic mulching to conserve root zone moisture."
        })
    elif daily_temp_max >= 34.0 and current_temp < 32:
        alerts.append({
            "id": "temp_rise",
            "title": "Temperature Rise Ahead",
            "severity": "Low",
            "badgeColor": "blue",
            "description": f"Daytime temperatures expected to climb to {daily_temp_max:.1f}°C over the upcoming days.",
            "farmerAction": "Ensure irrigation channels and sprinklers are primed."
        })

    # 4. Cold Snap Alert
    if daily_temp_min <= 8.0:
        alerts.append({
            "id": "cold_wave",
            "title": "Cold Wave / Frost Warning",
            "severity": "High",
            "badgeColor": "red",
            "description": f"Nighttime temperatures will drop to {daily_temp_min:.1f}°C. Risk of frost injury to sensitive vegetable crops.",
            "farmerAction": "Provide light evening irrigation or straw covering over young nursery seedlings."
        })

    return alerts

def generate_farming_tips(
    current_temp: float,
    humidity: int,
    rain_sum_next_24h: float,
    wind_speed: float,
) -> List[Dict[str, Any]]:
    """
    Generates actionable farmer-friendly tips aligned with current weather.
    """
    tips = [
        {
            "id": "soil_health",
            "title": "Improve Soil Health",
            "description": "Incorporate well-decomposed organic compost and bio-fertilizers to enhance moisture retention and beneficial soil microbes.",
            "category": "Soil Care",
            "image": "/images/crop_soil.jpg",
            "icon": "🌱"
        },
        {
            "id": "drainage",
            "title": "Field Drainage Maintenance",
            "description": "Keep border furrows and outlet trenches clear to prevent standing water accumulation after seasonal showers.",
            "category": "Water Management",
            "image": "/images/crop_cotton.jpg",
            "icon": "💧"
        },
        {
            "id": "scouting",
            "title": "Timely Pest Scouting",
            "description": "Inspect 20 random plants across each acre weekly for early symptoms of leaf spots, blights, and bollworm entries.",
            "category": "Crop Protection",
            "image": "/images/crop_soybean.jpg",
            "icon": "🔍"
        }
    ]

    if rain_sum_next_24h > 5:
        tips.insert(0, {
            "id": "rain_prep",
            "title": "Protect Crops from Rain",
            "description": "Ensure drainage ditches are unblocked and delay chemical sprays until leaves remain dry for at least 4 hours.",
            "category": "Weather Alert",
            "image": "/images/crop_maize.jpg",
            "icon": "🌧️"
        })
    elif humidity > 70:
        tips.insert(0, {
            "id": "humidity_care",
            "title": "High Humidity Precautions",
            "description": "Maintain adequate plant spacing to encourage air circulation through the canopy and discourage fungal spores.",
            "category": "Disease Prevention",
            "image": "/images/crop_wheat.jpg",
            "icon": "🛡️"
        })

    return tips[:3]

async def fetch_weather_data(
    location_query: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Fetches real-time weather and forecast data from Open-Meteo API,
    normalizes all fields into predictable UI schema.
    """
    target_lat = lat if lat is not None else latitude
    target_lon = lon if lon is not None else longitude

    # 1. Resolve Location Coordinates
    if target_lat is not None and target_lon is not None:
        loc_meta = await reverse_geocode(target_lat, target_lon)
    elif location_query:
        loc_meta = await geocode_location(location_query)
    else:
        loc_meta = DEFAULT_LOCATION

    latitude = loc_meta["latitude"]
    longitude = loc_meta["longitude"]

    # 2. Query Real-Time Weather Data
    raw_data = None
    openweather_success = False

    if OPENWEATHER_API_KEY:
        try:
            owm_url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHER_API_KEY}&units=metric"
            async with httpx.AsyncClient(timeout=8.0) as client:
                owm_resp = await client.get(owm_url)
                if owm_resp.status_code == 200:
                    owm_json = owm_resp.json()
                    openweather_success = True
        except Exception as e:
            print(f"[WeatherService] OpenWeather API call failed or timed out: {e}")

    # Standard High-Resolution Meteorological Forecast (Open-Meteo)
    open_meteo_url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude}&longitude={longitude}"
        f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m"
        f"&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,visibility"
        f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,uv_index_max"
        f"&timezone=auto"
        f"&forecast_days=7"
    )

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(open_meteo_url)
        if resp.status_code != 200:
            raise Exception(f"Weather API responded with status {resp.status_code}")
        raw_data = resp.json()

    current_raw = raw_data.get("current", {})
    hourly_raw = raw_data.get("hourly", {})
    daily_raw = raw_data.get("daily", {})

    # 3. Parse Current Weather
    curr_weather_code = int(current_raw.get("weather_code", 2))
    wmo_info = get_wmo_info(curr_weather_code)

    curr_temp = float(current_raw.get("temperature_2m", 28.0))
    curr_feels = float(current_raw.get("apparent_temperature", curr_temp))
    curr_humidity = int(current_raw.get("relative_humidity_2m", 65))
    curr_wind = float(current_raw.get("wind_speed_10m", 12.0))
    curr_wind_dir = int(current_raw.get("wind_direction_10m", 0))
    curr_pressure = float(current_raw.get("surface_pressure", 1012.0))
    curr_precip = float(current_raw.get("precipitation", 0.0))
    is_day = bool(current_raw.get("is_day", 1))

    # Visibility from first hour (in km)
    hourly_vis_list = hourly_raw.get("visibility", [])
    curr_vis = (float(hourly_vis_list[0]) / 1000.0) if hourly_vis_list else 10.0

    current_data = {
        "temperature": round(curr_temp, 1),
        "feelsLike": round(curr_feels, 1),
        "condition": wmo_info["condition"],
        "weatherCode": curr_weather_code,
        "icon": wmo_info["icon"],
        "humidity": curr_humidity,
        "windSpeed": round(curr_wind, 1),
        "windDirection": curr_wind_dir,
        "pressure": round(curr_pressure, 1),
        "visibility": round(curr_vis, 1),
        "precipitation": round(curr_precip, 1),
        "isDay": is_day,
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
    }

    # 4. Parse Hourly Forecast (Next 24 Hours)
    hourly_times = hourly_raw.get("time", [])
    hourly_temps = hourly_raw.get("temperature_2m", [])
    hourly_codes = hourly_raw.get("weather_code", [])
    hourly_precip_probs = hourly_raw.get("precipitation_probability", [])
    hourly_rains = hourly_raw.get("precipitation", [])
    hourly_humidities = hourly_raw.get("relative_humidity_2m", [])

    hourly_list = []
    # Take first 24 entries starting from current time
    for i in range(min(24, len(hourly_times))):
        raw_iso = hourly_times[i]
        try:
            dt = datetime.fromisoformat(raw_iso)
            time_display = dt.strftime("%I %p").lstrip("0")
        except Exception:
            time_display = f"{i}:00"

        code = int(hourly_codes[i]) if i < len(hourly_codes) else 2
        code_info = get_wmo_info(code)

        hourly_list.append({
            "isoTime": raw_iso,
            "time": time_display,
            "temperature": round(float(hourly_temps[i]), 1) if i < len(hourly_temps) else curr_temp,
            "condition": code_info["condition"],
            "icon": code_info["icon"],
            "precipitationProbability": int(hourly_precip_probs[i]) if i < len(hourly_precip_probs) and hourly_precip_probs[i] is not None else 0,
            "rain": round(float(hourly_rains[i]), 1) if i < len(hourly_rains) and hourly_rains[i] is not None else 0.0,
            "humidity": int(hourly_humidities[i]) if i < len(hourly_humidities) else curr_humidity,
        })

    # 5. Parse 7-Day Forecast
    daily_dates = daily_raw.get("time", [])
    daily_codes = daily_raw.get("weather_code", [])
    daily_t_max = daily_raw.get("temperature_2m_max", [])
    daily_t_min = daily_raw.get("temperature_2m_min", [])
    daily_p_sum = daily_raw.get("precipitation_sum", [])
    daily_p_prob = daily_raw.get("precipitation_probability_max", [])
    daily_sunrises = daily_raw.get("sunrise", [])
    daily_sunsets = daily_raw.get("sunset", [])

    daily_list = []
    for i in range(min(7, len(daily_dates))):
        d_str = daily_dates[i]
        try:
            dt = datetime.strptime(d_str, "%Y-%m-%d")
            day_name = dt.strftime("%a")
            formatted_date = dt.strftime("%d %b")
        except Exception:
            day_name = f"Day {i+1}"
            formatted_date = d_str

        code = int(daily_codes[i]) if i < len(daily_codes) else 2
        code_info = get_wmo_info(code)

        daily_list.append({
            "date": d_str,
            "dayName": day_name,
            "weekday": day_name,
            "formattedDate": formatted_date,
            "minTemperature": round(float(daily_t_min[i]), 1) if i < len(daily_t_min) else 20.0,
            "maxTemperature": round(float(daily_t_max[i]), 1) if i < len(daily_t_max) else 30.0,
            "condition": code_info["condition"],
            "icon": code_info["icon"],
            "precipitationSum": round(float(daily_p_sum[i]), 1) if i < len(daily_p_sum) and daily_p_sum[i] is not None else 0.0,
            "precipitationProbability": int(daily_p_prob[i]) if i < len(daily_p_prob) and daily_p_prob[i] is not None else 0,
            "precipitationProbabilityMax": int(daily_p_prob[i]) if i < len(daily_p_prob) and daily_p_prob[i] is not None else 0,
            "sunrise": daily_sunrises[i] if i < len(daily_sunrises) else "",
            "sunset": daily_sunsets[i] if i < len(daily_sunsets) else "",
        })

    # Summary metrics for advisories & alerts
    rain_next_24h = sum(h.get("rain", 0.0) for h in hourly_list[:24])
    daily_precip_max = max((d.get("precipitationSum", 0.0) for d in daily_list), default=0.0)
    daily_temp_max = max((d.get("maxTemperature", 30.0) for d in daily_list), default=30.0)
    daily_temp_min = min((d.get("minTemperature", 20.0) for d in daily_list), default=20.0)

    # 6. Generate Crop Advisories, Weather Alerts & Farming Tips
    advisories = generate_crop_advisories(
        current_temp=curr_temp,
        humidity=curr_humidity,
        wind_speed=curr_wind,
        rain_sum_next_24h=rain_next_24h,
        max_temp_week=daily_temp_max,
        min_temp_week=daily_temp_min,
    )

    alerts = generate_weather_alerts(
        current_temp=curr_temp,
        humidity=curr_humidity,
        wind_speed=curr_wind,
        daily_precip_max=daily_precip_max,
        daily_temp_max=daily_temp_max,
        daily_temp_min=daily_temp_min,
    )

    farming_tips = generate_farming_tips(
        current_temp=curr_temp,
        humidity=curr_humidity,
        rain_sum_next_24h=rain_next_24h,
        wind_speed=curr_wind,
    )

    return {
        "success": True,
        "location": {
            "name": loc_meta["name"],
            "region": loc_meta["region"],
            "country": loc_meta["country"],
            "latitude": latitude,
            "longitude": longitude,
            "formatted": f"{loc_meta['name']}{', ' + loc_meta['region'] if loc_meta['region'] else ''}",
        },
        "current": current_data,
        "hourly": hourly_list,
        "daily": daily_list,
        "advisory": advisories,
        "alerts": alerts,
        "farmingTips": farming_tips,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
