import sqlite3
from typing import Optional, Dict, Any, List

from backend.app.core.config import DATABASE_PATH
from backend.app.core.constants import CROP_CLASSES
from backend.app.services.recommendation_service import DISEASE_RECOMMENDATIONS
from backend.app.auth import verify_access_token


def perform_global_search(
    raw_query: str = "",
    authorization: Optional[str] = None,
) -> Dict[str, Any]:
    """
    End-to-end global search business logic across crops, diseases,
    recommendations/advisory, detection history (user-specific when authenticated),
    and AI insights.
    """
    clean_query = raw_query.strip()
    if not clean_query or len(clean_query) < 2:
        return {
            "success": True,
            "query": clean_query,
            "total": 0,
            "results": {
                "crops": [],
                "diseases": [],
                "history": [],
                "insights": [],
                "advice": []
            }
        }

    query_lower = clean_query.lower()
    query_tokens = [t for t in query_lower.split() if len(t) > 1]
    if not query_tokens:
        query_tokens = [query_lower]

    matched_crops: List[Dict[str, Any]] = []
    matched_diseases: List[Dict[str, Any]] = []
    matched_history: List[Dict[str, Any]] = []
    matched_insights: List[Dict[str, Any]] = []
    matched_advice: List[Dict[str, Any]] = []

    # 1. SEARCH CROPS
    crop_info_map = {
        "cotton": {
            "name": "Cotton",
            "key": "cotton",
            "status": "AI Available",
            "type": "Crop",
            "description": "Multi-class leaf disease detection & management for cotton crops.",
            "route": "/crops"
        },
        "soybean": {
            "name": "Soybean",
            "key": "soybean",
            "status": "AI Available",
            "type": "Crop",
            "description": "High-accuracy disease diagnostics for soybean foliage & pods.",
            "route": "/crops"
        },
        "maize": {
            "name": "Maize",
            "key": "maize",
            "status": "AI Available",
            "type": "Crop",
            "description": "Corn leaf blight, common rust & gray leaf spot identification.",
            "route": "/crops"
        },
        "wheat": {
            "name": "Wheat",
            "key": "wheat",
            "status": "AI Available",
            "type": "Crop",
            "description": "Rust identification and healthy crop monitoring for wheat.",
            "route": "/crops"
        },
        "tomato": {
            "name": "Tomato",
            "key": "tomato",
            "status": "Coming Soon",
            "type": "Crop",
            "description": "Upcoming disease detection models for horticultural tomato crops.",
            "route": "/management"
        },
    }

    for crop_key, crop_data in crop_info_map.items():
        name_lower = crop_data["name"].lower()
        desc_lower = crop_data["description"].lower()
        if any(tok in name_lower or tok in desc_lower or tok in crop_key for tok in query_tokens):
            matched_crops.append(crop_data)

    # 2. SEARCH DISEASES & RECOMMENDATIONS
    all_diseases = {}
    for crop_name, classes in CROP_CLASSES.items():
        for cls_name in classes:
            norm_name = cls_name.replace("_", " ").strip()
            if norm_name.lower() not in all_diseases:
                all_diseases[norm_name.lower()] = {
                    "name": norm_name,
                    "crop": crop_name.capitalize(),
                    "raw_name": cls_name
                }

    for rec_name in DISEASE_RECOMMENDATIONS.keys():
        norm_name = rec_name.replace("_", " ").strip()
        if norm_name.lower() not in all_diseases:
            all_diseases[norm_name.lower()] = {
                "name": norm_name,
                "crop": "Multi-Crop",
                "raw_name": rec_name
            }

    for disease_lower, d_data in all_diseases.items():
        rec = DISEASE_RECOMMENDATIONS.get(d_data["name"]) or DISEASE_RECOMMENDATIONS.get(d_data["raw_name"])
        symptoms = ""
        severity = "Moderate"
        if rec:
            severity = rec.get("severity", "Moderate")
            sym_list = rec.get("symptoms", [])
            symptoms = " ".join(sym_list) if isinstance(sym_list, list) else str(sym_list)

        searchable_text = f"{disease_lower} {d_data['crop'].lower()} {symptoms.lower()}"
        if any(tok in searchable_text for tok in query_tokens):
            matched_diseases.append({
                "name": d_data["name"],
                "crop": d_data["crop"],
                "severity": severity,
                "type": "Disease",
                "description": symptoms[:120] + "..." if len(symptoms) > 120 else (symptoms or f"Disease details and management for {d_data['name']}."),
                "route": f"/detection?crop={d_data['crop'].lower()}"
            })

    # 3. SEARCH DETECTION HISTORY (User-Specific Authentication)
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token_str = authorization.split("Bearer ", 1)[1].strip()
        token_data = verify_access_token(token_str)
        if token_data and "user_id" in token_data:
            user_id = token_data["user_id"]

    if user_id is not None:
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, filename, crop, prediction, confidence, severity, symptoms, created_at
                FROM detection_history
                WHERE user_id = ?
                ORDER BY id DESC
                """,
                (user_id,)
            )
            rows = cursor.fetchall()
            conn.close()

            for row in rows:
                crop_val = (row["crop"] or "").lower()
                pred_val = (row["prediction"] or "").lower().replace("_", " ")
                sym_val = (row["symptoms"] or "").lower()
                text_to_search = f"{crop_val} {pred_val} {sym_val}"

                if any(tok in text_to_search for tok in query_tokens):
                    matched_history.append({
                        "id": row["id"],
                        "crop": (row["crop"] or "").capitalize(),
                        "prediction": (row["prediction"] or "").replace("_", " "),
                        "confidence": f"{round((row['confidence'] or 0) * 100, 1)}%",
                        "created_at": row["created_at"],
                        "type": "Detection History",
                        "description": f"{row['prediction']} ({round((row['confidence'] or 0) * 100, 1)}% confidence)",
                        "route": "/history"
                    })
        except Exception as err:
            print(f"[Global Search History Error] {err}")

    # 4. SEARCH AI INSIGHTS
    insight_topics = [
        {
            "title": "Disease Risk Analytics & Early Warning",
            "category": "Risk Forecast",
            "type": "AI Insight",
            "description": "Predictive risk assessments for foliar diseases based on recent crop scans and weather patterns.",
            "route": "/insights"
        },
        {
            "title": "Crop Health & Trend Intelligence",
            "category": "Diagnostics",
            "type": "AI Insight",
            "description": "Historical detection trends and distribution across cotton, soybean, maize, and wheat.",
            "route": "/insights"
        },
        {
            "title": "Smart Treatment Efficiency & Guidance",
            "category": "Optimization",
            "type": "AI Insight",
            "description": "AI-powered efficacy tracking for bio-fungicides and integrated pest management.",
            "route": "/insights"
        }
    ]

    for ins in insight_topics:
        ins_text = f"{ins['title'].lower()} {ins['category'].lower()} {ins['description'].lower()}"
        if any(tok in ins_text for tok in query_tokens):
            matched_insights.append(ins)

    # 5. SEARCH FARMING ADVICE & AGRONOMIC RECOMMENDATIONS
    advice_catalogue = [
        {
            "title": "Spray Guidance & Moisture Management",
            "category": "Farming Advice",
            "type": "Advisory",
            "description": "Avoid spraying during peak leaf wetness or approaching rainfall. Prefer early morning application.",
            "route": "/weather"
        },
        {
            "title": "Crop Spacing & Field Aeration",
            "category": "Farming Advice",
            "type": "Advisory",
            "description": "Ensure optimal plant-to-plant distance to prevent dense canopy humidity and fungal spread.",
            "route": "/management"
        },
        {
            "title": "Integrated Pest & Disease Management (IPM)",
            "category": "Farming Advice",
            "type": "Advisory",
            "description": "Combine bio-control agents, resistant seed varieties, and clean tillage practices.",
            "route": "/learning-hub"
        },
        {
            "title": "Weather-Adaptive Irrigation Strategy",
            "category": "Farming Advice",
            "type": "Advisory",
            "description": "Adjust irrigation schedules around upcoming rain forecasts to prevent root rot and nutrient runoff.",
            "route": "/weather"
        }
    ]

    for rec_name, rec_body in DISEASE_RECOMMENDATIONS.items():
        if isinstance(rec_body, dict):
            treatment = " ".join(rec_body.get("treatment", []))
            spray = " ".join(rec_body.get("spray_guidance", []))
            prevention = " ".join(rec_body.get("prevention", []))
            combined_adv = f"{treatment} {spray} {prevention}".lower()

            if any(tok in combined_adv for tok in query_tokens):
                clean_title = f"{rec_name.replace('_', ' ')} Management Advice"
                if not any(a["title"] == clean_title for a in matched_advice):
                    snippet = treatment or spray or prevention or "Consult local agronomic advisory for recommended schedule."
                    matched_advice.append({
                        "title": clean_title,
                        "category": "Disease Advisory",
                        "type": "Farming Advice",
                        "description": snippet[:130] + "..." if len(snippet) > 130 else snippet,
                        "route": "/weather"
                    })

    for adv in advice_catalogue:
        adv_text = f"{adv['title'].lower()} {adv['category'].lower()} {adv['description'].lower()}"
        if any(tok in adv_text for tok in query_tokens):
            matched_advice.append(adv)

    total_count = (
        len(matched_crops)
        + len(matched_diseases)
        + len(matched_history)
        + len(matched_insights)
        + len(matched_advice)
    )

    return {
        "success": True,
        "query": clean_query,
        "total": total_count,
        "results": {
            "crops": matched_crops[:6],
            "diseases": matched_diseases[:6],
            "history": matched_history[:6],
            "insights": matched_insights[:4],
            "advice": matched_advice[:4]
        }
    }
