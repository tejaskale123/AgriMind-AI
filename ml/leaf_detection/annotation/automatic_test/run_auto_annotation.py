"""
AgriMind AI - Automatic Leaf Annotation Prototype
=================================================

Phase 3E: Safe Automatic Leaf Segmentation & Polygon Extraction

Processes the first 5 candidates from candidate_selection.csv:
1. Detects botanical foreground leaf pixels
2. Cleans mask with morphological filtering
3. Evaluates contour geometry, solidity, and contrast
4. Computes confidence score
5. Extracts smoothed polygon coordinates in original image space
6. Generates binary mask, preview overlay, and annotation JSON
7. Flags low-confidence / ambiguous images as REVIEW_REQUIRED
"""

import os
import sys
import csv
import json
import time
from pathlib import Path
from datetime import datetime
import cv2
import numpy as np

# Import configuration
try:
    from . import config
except ImportError:
    import config


def compute_shoelace_area(points):
    """Computes polygon area using the Shoelace formula."""
    n = len(points)
    if n < 3:
        return 0.0
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += points[i][0] * points[j][1]
        area -= points[j][0] * points[i][1]
    return abs(area) / 2.0


def segment_leaf_candidate(img_path: Path):
    """
    Automatic leaf segmentation engine.
    
    Returns:
        dict containing:
        - success: bool
        - polygon_points: list of [x, y]
        - binary_mask: np.ndarray (uint8)
        - area_pixels: float
        - area_ratio: float
        - bbox: [x, y, w, h]
        - confidence: float
        - status: str ('AUTOMATIC_ANNOTATED' or 'REVIEW_REQUIRED')
        - reason: str
    """
    img = cv2.imread(str(img_path))
    if img is None:
        return {
            "success": False,
            "status": "REVIEW_REQUIRED",
            "reason": "Image file could not be read",
            "confidence": 0.0
        }

    h, w = img.shape[:2]
    total_px = h * w

    # Step 1: Background color estimation from border margins
    m = config.BORDER_MARGIN
    border_mask = np.zeros((h, w), dtype=bool)
    border_mask[:m, :] = True
    border_mask[-m:, :] = True
    border_mask[:, :m] = True
    border_mask[:, -m:] = True

    bg_color = np.median(img[border_mask], axis=0)

    # Step 2: Euclidean color distance against estimated background
    diff = np.linalg.norm(img.astype(np.float32) - bg_color, axis=2)
    diff_norm = cv2.normalize(diff, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

    # Step 3: Otsu thresholding on color deviation
    _, diff_thresh = cv2.threshold(diff_norm, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Step 4: Botanical color masking (Green + Chlorotic/Necrotic disease hues)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    green_mask = cv2.inRange(hsv, (25, 25, 25), (95, 255, 255))
    yellow_brown_mask = cv2.inRange(hsv, (10, 25, 25), (25, 255, 255))
    botanical_mask = cv2.bitwise_or(green_mask, yellow_brown_mask)

    # Step 5: Combined candidate foreground
    # A pixel is leaf candidate if it either deviates from background OR matches botanical hue
    fg_candidate = cv2.bitwise_or(diff_thresh, botanical_mask)

    # Exclude strict border margin to avoid border artifacts
    fg_candidate[:m, :] = 0
    fg_candidate[-m:, :] = 0
    fg_candidate[:, :m] = 0
    fg_candidate[:, -m:] = 0

    # Step 6: Morphological noise removal & hole closure
    k = config.MORPH_KERNEL_SIZE
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    cleaned_mask = cv2.morphologyEx(fg_candidate, cv2.MORPH_CLOSE, kernel, iterations=2)
    cleaned_mask = cv2.morphologyEx(cleaned_mask, cv2.MORPH_OPEN, kernel, iterations=1)

    # Step 7: Contour analysis & primary leaf selection
    contours, _ = cv2.findContours(cleaned_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return {
            "success": False,
            "status": "REVIEW_REQUIRED",
            "reason": "No valid foreground contours found",
            "confidence": 0.0
        }

    # Rank contours by plausible leaf area and compactness
    best_cnt = None
    best_area = 0.0
    for cnt in contours:
        a = cv2.contourArea(cnt)
        if a > best_area:
            best_area = a
            best_cnt = cnt

    if best_cnt is None or best_area <= 0:
        return {
            "success": False,
            "status": "REVIEW_REQUIRED",
            "reason": "Dominant contour has zero area",
            "confidence": 0.0
        }

    area_ratio = best_area / float(total_px)

    # Check area ratio bounds
    if area_ratio < config.MIN_AREA_RATIO:
        return {
            "success": False,
            "status": "REVIEW_REQUIRED",
            "reason": f"Area ratio too small ({area_ratio:.1%} < {config.MIN_AREA_RATIO:.1%})",
            "confidence": 0.2
        }

    if area_ratio > config.MAX_AREA_RATIO:
        return {
            "success": False,
            "status": "REVIEW_REQUIRED",
            "reason": f"Area ratio too large ({area_ratio:.1%} > {config.MAX_AREA_RATIO:.1%})",
            "confidence": 0.2
        }

    # Step 8: Compute Confidence Score
    # Solidity: contourArea / convexHullArea
    hull = cv2.convexHull(best_cnt)
    hull_area = cv2.contourArea(hull)
    solidity = float(best_area) / float(hull_area + 1e-5)

    # Center proximity score
    M = cv2.moments(best_cnt)
    if M["m00"] > 0:
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])
        dist_from_center = np.hypot(cx - w/2, cy - h/2) / (np.hypot(w/2, h/2) + 1e-5)
        center_score = max(0.0, 1.0 - dist_from_center)
    else:
        center_score = 0.5

    # Area plausibility score (peaked around 15% to 50%)
    if 0.10 <= area_ratio <= 0.60:
        area_score = 1.0
    elif area_ratio < 0.10:
        area_score = area_ratio / 0.10
    else:
        area_score = max(0.2, (config.MAX_AREA_RATIO - area_ratio) / 0.38)

    confidence = round(0.40 * solidity + 0.35 * area_score + 0.25 * center_score, 3)

    if confidence < config.CONFIDENCE_THRESHOLD:
        return {
            "success": False,
            "status": "REVIEW_REQUIRED",
            "reason": f"Confidence {confidence:.2f} below threshold {config.CONFIDENCE_THRESHOLD:.2f} (solidity={solidity:.2f})",
            "confidence": confidence
        }

    # Step 9: Contour approximation (smoothing into polygonal vertices)
    arc_length = cv2.arcLength(best_cnt, True)
    epsilon = config.POLYGON_EPSILON_FACTOR * arc_length
    approx_poly = cv2.approxPolyDP(best_cnt, epsilon, True)

    points = [[int(pt[0][0]), int(pt[0][1])] for pt in approx_poly]

    # Validate point count
    if len(points) < config.MIN_POINTS:
        return {
            "success": False,
            "status": "REVIEW_REQUIRED",
            "reason": f"Polygon has fewer than {config.MIN_POINTS} points ({len(points)})",
            "confidence": confidence
        }

    # Ensure all points strictly bounded inside [0, w] x [0, h]
    for pt in points:
        pt[0] = max(0, min(w, pt[0]))
        pt[1] = max(0, min(h, pt[1]))

    # Step 10: Compute Bounding Box
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    bbox = [min_x, min_y, max_x - min_x, max_y - min_y]

    # Step 11: Create clean binary mask
    binary_mask = np.zeros((h, w), dtype=np.uint8)
    poly_pts = np.array(points, dtype=np.int32)
    cv2.fillPoly(binary_mask, [poly_pts], 255)

    shoelace_area = compute_shoelace_area(points)

    return {
        "success": True,
        "status": "AUTOMATIC_ANNOTATED",
        "polygon_points": points,
        "point_count": len(points),
        "binary_mask": binary_mask,
        "area_pixels": round(shoelace_area, 2),
        "area_ratio": round(shoelace_area / float(total_px), 4),
        "bbox": bbox,
        "confidence": confidence,
        "solidity": round(solidity, 3),
        "reason": "Automatic contour extraction passed all validation checks"
    }


def create_preview_image(img, points, bbox, candidate_info, result):
    """
    Renders an aesthetic visual preview showing:
    - Original image
    - Semi-transparent emerald mask overlay
    - Sharp emerald polygon border
    - Vertex markers
    - Bounding box
    - Metadata text banner
    """
    h, w = img.shape[:2]
    preview = img.copy()

    # Draw semi-transparent fill
    overlay = preview.copy()
    poly_pts = np.array(points, dtype=np.int32)
    cv2.fillPoly(overlay, [poly_pts], (16, 185, 129))  # Emerald green (BGR: 129, 185, 16)
    cv2.addWeighted(overlay, 0.35, preview, 0.65, 0, preview)

    # Draw sharp polygon contour
    cv2.polylines(preview, [poly_pts], isClosed=True, color=(0, 220, 130), thickness=2, lineType=cv2.LINE_AA)

    # Draw vertices
    for idx, (x, y) in enumerate(points):
        color = (0, 215, 255) if idx == 0 else (255, 255, 255)  # Gold for first point
        cv2.circle(preview, (x, y), 3, color, -1, lineType=cv2.LINE_AA)
        cv2.circle(preview, (x, y), 4, (0, 180, 100), 1, lineType=cv2.LINE_AA)

    # Draw subtle bounding box (cyan)
    bx, by, bw, bh = bbox
    cv2.rectangle(preview, (bx, by), (bx + bw, by + bh), (255, 200, 50), 1, lineType=cv2.LINE_AA)

    # Add header banner
    banner = np.zeros((40, w, 3), dtype=np.uint8)
    banner[:] = (20, 24, 33)  # Dark slate
    cv2.putText(
        banner,
        f"AgriMind AI Auto-Annotate | #{candidate_info['id']} {candidate_info['crop']} | {result['point_count']} pts | Conf: {result['confidence']:.2f} | Area: {result['area_ratio']:.1%}",
        (12, 26),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.52,
        (255, 255, 255),
        1,
        cv2.LINE_AA
    )
    combined = np.vstack([banner, preview])
    return combined


def process_first_5_candidates():
    print("=" * 70, flush=True)
    print("AGRIMIND AI - AUTOMATIC LEAF ANNOTATION PROTOTYPE (5-IMAGE TEST)", flush=True)
    print("=" * 70, flush=True)

    # Ensure output directories exist
    config.JSON_DIR.mkdir(parents=True, exist_ok=True)
    config.MASKS_DIR.mkdir(parents=True, exist_ok=True)
    config.PREVIEWS_DIR.mkdir(parents=True, exist_ok=True)

    # Load first 5 candidates
    with open(config.CANDIDATE_SELECTION_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        candidates = [next(reader) for _ in range(config.NUM_CANDIDATES)]

    print(f"Loaded {len(candidates)} candidates from {config.CANDIDATE_SELECTION_PATH.name}.", flush=True)

    results_summary = []

    for idx, c in enumerate(candidates, start=1):
        cid = int(c["id"]) if "id" in c else idx
        crop = c["crop"]
        fn = c["filename"]
        rel_path = c["relative_path"]
        abs_path = config.PROJECT_ROOT / rel_path

        print(f"\nProcessing Candidate #{cid} [{idx}/5]: {crop} - {fn}...", flush=True)

        if not abs_path.is_file():
            print(f"  [ERROR] Image not found on disk: {abs_path}", flush=True)
            results_summary.append({
                "candidate_id": cid,
                "crop": crop,
                "filename": fn,
                "status": "REVIEW_REQUIRED",
                "reason": "File missing on disk"
            })
            continue

        orig_img = cv2.imread(str(abs_path))
        orig_h, orig_w = orig_img.shape[:2]

        # Execute automatic segmentation pipeline
        res = segment_leaf_candidate(abs_path)

        now_iso = datetime.utcnow().isoformat() + "Z"

        if res["success"]:
            print(f"  [SUCCESS] Detected leaf: {res['point_count']} vertices, {res['area_pixels']} px² ({res['area_ratio']:.1%}), Conf: {res['confidence']:.2f}", flush=True)

            # 1. Save binary mask PNG
            mask_fname = f"mask_{cid:04d}_{Path(fn).stem}.png"
            mask_path = config.MASKS_DIR / mask_fname
            cv2.imwrite(str(mask_path), res["binary_mask"])

            # 2. Save visual preview overlay PNG
            preview_img = create_preview_image(orig_img, res["polygon_points"], res["bbox"], {"id": cid, "crop": crop}, res)
            preview_fname = f"preview_{cid:04d}_{Path(fn).stem}.png"
            preview_path = config.PREVIEWS_DIR / preview_fname
            cv2.imwrite(str(preview_path), preview_img)

            # 3. Build annotation JSON
            annotation_record = {
                "candidate_id": cid,
                "crop": crop,
                "source_dataset": c["source_dataset"],
                "source_split": c["source_split"],
                "filename": fn,
                "relative_path": rel_path,
                "sha256": c["sha256"],
                "original_width": orig_w,
                "original_height": orig_h,
                "category": config.TARGET_CATEGORY,
                "category_id": config.CATEGORY_ID,
                "polygon_coordinates": res["polygon_points"],
                "point_count": res["point_count"],
                "bbox": res["bbox"],
                "polygon_area_pixels": res["area_pixels"],
                "area_ratio": res["area_ratio"],
                "solidity": res["solidity"],
                "confidence_score": res["confidence"],
                "is_closed": True,
                "annotation_status": "AUTOMATIC_ANNOTATED",
                "mask_file": str(mask_path.relative_to(config.PROJECT_ROOT)),
                "preview_file": str(preview_path.relative_to(config.PROJECT_ROOT)),
                "created_at": now_iso
            }

            json_fname = f"annotation_{cid:04d}.json"
            json_path = config.JSON_DIR / json_fname
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(annotation_record, f, indent=2)

            results_summary.append({
                "candidate_id": cid,
                "crop": crop,
                "filename": fn,
                "width": orig_w,
                "height": orig_h,
                "vertices": res["point_count"],
                "area_pixels": res["area_pixels"],
                "area_ratio": res["area_ratio"],
                "confidence": res["confidence"],
                "status": "AUTOMATIC_ANNOTATED",
                "json_file": str(json_path.relative_to(config.PROJECT_ROOT)),
                "preview_file": str(preview_path.relative_to(config.PROJECT_ROOT))
            })

        else:
            print(f"  [REVIEW_REQUIRED] Flagged: {res['reason']} (Conf: {res.get('confidence', 0.0)})", flush=True)

            annotation_record = {
                "candidate_id": cid,
                "crop": crop,
                "source_dataset": c["source_dataset"],
                "source_split": c["source_split"],
                "filename": fn,
                "relative_path": rel_path,
                "sha256": c["sha256"],
                "original_width": orig_w,
                "original_height": orig_h,
                "category": config.TARGET_CATEGORY,
                "category_id": config.CATEGORY_ID,
                "polygon_coordinates": [],
                "point_count": 0,
                "polygon_area_pixels": 0.0,
                "area_ratio": 0.0,
                "confidence_score": res.get("confidence", 0.0),
                "is_closed": False,
                "annotation_status": "REVIEW_REQUIRED",
                "failure_reason": res["reason"],
                "created_at": now_iso
            }

            json_fname = f"annotation_{cid:04d}.json"
            json_path = config.JSON_DIR / json_fname
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(annotation_record, f, indent=2)

            results_summary.append({
                "candidate_id": cid,
                "crop": crop,
                "filename": fn,
                "width": orig_w,
                "height": orig_h,
                "vertices": 0,
                "area_pixels": 0.0,
                "area_ratio": 0.0,
                "confidence": res.get("confidence", 0.0),
                "status": "REVIEW_REQUIRED",
                "reason": res["reason"]
            })

    # Print Summary Table
    print("\n" + "=" * 70, flush=True)
    print("5-CANDIDATE AUTOMATIC ANNOTATION RESULTS", flush=True)
    print("=" * 70, flush=True)
    for r in results_summary:
        st = r["status"]
        if st == "AUTOMATIC_ANNOTATED":
            print(f"Candidate #{r['candidate_id']} [{r['crop']}] {r['filename']}: {st} | {r['vertices']} pts | Area: {r['area_ratio']:.1%} | Conf: {r['confidence']:.2f}", flush=True)
        else:
            print(f"Candidate #{r['candidate_id']} [{r['crop']}] {r['filename']}: {st} | Reason: {r['reason']}", flush=True)

    return results_summary


if __name__ == "__main__":
    process_first_5_candidates()
