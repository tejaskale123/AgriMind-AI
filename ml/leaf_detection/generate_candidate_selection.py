"""
AgriMind AI - Candidate Selection Manifest Generator
===================================================

Phase 2D: Safe Metadata-Only Candidate Selection

STRICT SAFETY CONSTRAINTS:
- 100% READ-ONLY on datasets/processed/
- ZERO image copy, move, rename, delete, resize, or modification
- ZERO production model modification
- ZERO backend, frontend, database modification
- Reads ml/leaf_detection/candidate_manifest.csv
- Selects exactly 360 candidates per crop (1,800 total)
- Balances diversity across source splits (train, val, test) and disease classes
- Classifies candidates into EASY (priority 1), MEDIUM (priority 2), HARD (priority 3)
- Strictly excludes REJECT candidates
- Sets reviewer_status = PENDING_ANNOTATION
- Outputs selection manifest to ml/leaf_detection/candidate_selection.csv
"""

import os
import sys
import csv
import time
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Any
import cv2
import numpy as np

# =====================================================================
# PATH CONFIGURATION
# =====================================================================

MODULE_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = MODULE_ROOT.parent.parent

CANDIDATE_MANIFEST_PATH = MODULE_ROOT / "candidate_manifest.csv"
SELECTION_OUTPUT_PATH = MODULE_ROOT / "candidate_selection.csv"

TARGET_PER_CROP = 360
TOTAL_TARGET = 1800

CROPS = ["Cotton", "Soybean", "Maize", "Wheat", "Pigeon Pea"]

# =====================================================================
# VISUAL QUALITY EVALUATION
# =====================================================================

def evaluate_image_quality(img_path: Path, crop: str) -> Tuple[str, int, str]:
    """
    Evaluates visual quality of an image for polygon annotation.
    
    Returns:
        (category, priority, reason)
        where category in ('EASY', 'MEDIUM', 'HARD', 'REJECT')
        and priority in (1, 2, 3) for valid categories, 0 for REJECT.
    """
    img = cv2.imread(str(img_path))
    if img is None:
        return "REJECT", 0, "unreadable"

    h, w = img.shape[:2]
    if h < 224 or w < 224:
        return "REJECT", 0, f"resolution too small ({w}x{h})"

    # Downscale for fast, standardized metric computation
    max_dim = max(h, w)
    if max_dim > 512:
        scale = 512.0 / max_dim
        img_s = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    else:
        img_s = img

    sh, sw = img_s.shape[:2]
    total_px = sh * sw

    # 1. Sharpness / Blur check (Laplacian variance)
    gray = cv2.cvtColor(img_s, cv2.COLOR_BGR2GRAY)
    lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if lap_var < 20.0:
        return "REJECT", 0, f"severe blur (lap_var={lap_var:.1f})"

    # 2. Vegetation / Leaf Content Detection
    hsv = cv2.cvtColor(img_s, cv2.COLOR_BGR2HSV)
    green_mask = cv2.inRange(hsv, (25, 30, 30), (95, 255, 255))
    disease_mask = cv2.inRange(hsv, (12, 35, 35), (25, 255, 255))
    veg_mask = cv2.bitwise_or(green_mask, disease_mask)
    veg_px = int(np.count_nonzero(veg_mask))
    veg_ratio = veg_px / float(total_px)

    if veg_ratio < 0.05:
        return "REJECT", 0, f"insufficient leaf area ({veg_ratio:.1%})"

    # 3. Hand / Skin Occlusion Check
    ycrcb = cv2.cvtColor(img_s, cv2.COLOR_BGR2YCrCb)
    skin_mask = cv2.inRange(ycrcb, (0, 133, 77), (255, 173, 127))
    skin_px = int(np.count_nonzero(skin_mask))
    skin_ratio = skin_px / float(total_px)

    if skin_ratio > 0.55:
        return "REJECT", 0, f"excessive hand occlusion ({skin_ratio:.1%})"

    # 4. Background and Edge Clutter
    edges = cv2.Canny(gray, 50, 150)
    bg_mask = cv2.bitwise_not(veg_mask)
    bg_px = int(np.count_nonzero(bg_mask))
    if bg_px > 0:
        bg_edges = cv2.bitwise_and(edges, edges, mask=bg_mask)
        bg_edge_density = float(np.count_nonzero(bg_edges)) / float(bg_px)
    else:
        bg_edge_density = 0.0

    # 5. Contour Prominence
    contours, _ = cv2.findContours(veg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return "REJECT", 0, "no leaf contours found"

    areas = [cv2.contourArea(c) for c in contours]
    max_area = max(areas) if areas else 0.0
    prominence = float(max_area) / float(veg_px + 1e-5)

    # Categorization logic
    if crop == "Wheat":
        if prominence >= 0.45 and lap_var >= 80.0 and bg_edge_density < 0.08 and skin_ratio < 0.08 and veg_ratio >= 0.15:
            return "EASY", 1, "clear single blade"
        elif lap_var >= 30.0 and bg_edge_density < 0.16 and skin_ratio <= 0.40:
            return "MEDIUM", 2, "field blade with moderate background"
        else:
            return "HARD", 3, "overlapping/thin blades or clutter"

    elif crop == "Maize":
        if prominence >= 0.60 and lap_var >= 80.0 and bg_edge_density < 0.08 and skin_ratio < 0.08:
            return "EASY", 1, "clear single maize blade"
        elif lap_var >= 35.0 and bg_edge_density < 0.15 and skin_ratio <= 0.40:
            return "MEDIUM", 2, "maize leaf with field context"
        else:
            return "HARD", 3, "overlapping maize canopy or partial blade"

    elif crop == "Soybean":
        if prominence >= 0.55 and lap_var >= 80.0 and bg_edge_density < 0.08 and skin_ratio < 0.06:
            return "EASY", 1, "clean isolated leaflet"
        elif lap_var >= 35.0 and bg_edge_density < 0.15 and skin_ratio <= 0.40:
            return "MEDIUM", 2, "field soybean leaflet with stem/hand"
        else:
            return "HARD", 3, "dense soybean canopy or overlapping leaflets"

    elif crop == "Cotton":
        if prominence >= 0.60 and lap_var >= 80.0 and bg_edge_density < 0.08 and skin_ratio < 0.08:
            return "EASY", 1, "clean single cotton leaf"
        elif lap_var >= 35.0 and bg_edge_density < 0.15 and skin_ratio <= 0.40:
            return "MEDIUM", 2, "cotton leaf with field background"
        else:
            return "HARD", 3, "cluttered cotton canopy or wrinkled leaf"

    else:  # Pigeon Pea
        if prominence >= 0.50 and lap_var >= 80.0 and bg_edge_density < 0.08 and skin_ratio < 0.08:
            return "EASY", 1, "clean pigeon pea leaflet"
        elif lap_var >= 35.0 and bg_edge_density < 0.15 and skin_ratio <= 0.40:
            return "MEDIUM", 2, "pigeon pea leaflet on branch"
        else:
            return "HARD", 3, "overlapping pigeon pea foliage"


# =====================================================================
# CANDIDATE SELECTION ALGORITHM WITH BALANCED STRATIFICATION
# =====================================================================

def get_crop_quotas(crop: str, class_splits: Dict[str, Dict[str, List[Any]]]) -> Dict[str, Dict[str, int]]:
    """
    Computes strict per-class and per-split candidate quotas ensuring:
    - Balanced class representation
    - Proportional train / test / val split diversity
    - Sum equals exactly 360 candidates
    """
    quotas = defaultdict(dict)
    
    if crop == "Cotton":
        # 9 classes, 40 candidates each = 360
        # Train ~70% (28), Test ~15% (6), Val ~15% (6)
        for cls in class_splits:
            quotas[cls] = {"train": 28, "test": 6, "val": 6}

    elif crop == "Soybean":
        # 10 classes, 36 candidates each = 360
        # Train ~83.3% (30), Test ~8.3% (3), Val ~8.3% (3)
        for cls in class_splits:
            quotas[cls] = {"train": 30, "test": 3, "val": 3}

    elif crop == "Maize":
        # 13 classes, all train split = 360
        # 12 classes * 28 = 336, Southern_Rust = 24 -> 360
        for cls in class_splits:
            if cls == "Southern_Rust":
                quotas[cls] = {"train": 24}
            else:
                quotas[cls] = {"train": 28}

    elif crop == "Wheat":
        # 8 foliage leaf classes (Fusarium Head Blight and Loose Smut excluded)
        # Total target: 360
        wheat_targets = {
            "Powdery_Mildew": {"train": 45, "test": 14, "val": 1},   # 60
            "Healthy":        {"train": 45, "test": 14, "val": 1},   # 60
            "Septoria":       {"train": 45, "test": 14, "val": 1},   # 60
            "Black_Rust":     {"train": 41, "test": 14, "val": 0},   # 55
            "Tan_Spot":       {"train": 33, "test": 11, "val": 1},   # 45
            "Brown_Rust":     {"train": 26, "test": 8,  "val": 1},   # 35
            "Leaf_Blight":    {"train": 27, "test": 8,  "val": 0},   # 35
            "Yellow_Rust":    {"train": 8,  "test": 2,  "val": 0},   # 10
        }
        for cls, s_dict in wheat_targets.items():
            if cls in class_splits:
                quotas[cls] = s_dict

    elif crop == "Pigeon Pea":
        # 4 classes, 90 candidates each = 360
        # Train ~77.8% (70), Test ~11.1% (10), Val ~11.1% (10)
        for cls in class_splits:
            quotas[cls] = {"train": 70, "test": 10, "val": 10}

    return quotas


def select_crop_candidates(
    crop: str,
    manifest_rows: List[Dict[str, Any]],
    target_count: int = TARGET_PER_CROP
) -> List[Dict[str, Any]]:
    """
    Selects exactly target_count candidates for the given crop,
    balancing disease classes and source splits, prioritizing
    MEDIUM -> EASY -> HARD, and strictly excluding REJECT.
    """
    print(f"\nProcessing {crop} candidate selection...", flush=True)

    # Filter out non-leaf classes for wheat
    filtered_pool = []
    for r in manifest_rows:
        path_str = r["relative_path"]
        if crop == "Wheat":
            if "Fusarium_Head_Blight" in path_str or "Loose_Smut" in path_str:
                continue  # Wheat heads/spikes, not leaves
        filtered_pool.append(r)

    # Group by class and split
    by_class_split = defaultdict(lambda: defaultdict(list))
    for r in filtered_pool:
        cls_name = Path(r["relative_path"]).parent.name
        by_class_split[cls_name][r["source_split"]].append(r)

    # Get structured quotas
    quotas = get_crop_quotas(crop, by_class_split)
    total_quota = sum(sum(s.values()) for s in quotas.values())
    print(f"  Target quota for {crop}: {total_quota} (expected {target_count})", flush=True)

    selected = []
    selected_sha = set()

    def pref_rank(cat):
        if cat == "MEDIUM":
            return 1
        elif cat == "EASY":
            return 2
        else:
            return 3

    # Primary pass: fulfill exact class and split quotas
    for cls in sorted(quotas.keys()):
        for split, split_target in sorted(quotas[cls].items()):
            avail_rows = by_class_split[cls][split]
            if not avail_rows or split_target <= 0:
                continue

            # Strided sampling across the available images to ensure visual diversity
            # (different capture times, lighting, viewpoints)
            # Evaluate candidates until we have enough to fulfill split_target with buffer
            max_eval = min(len(avail_rows), split_target * 2 + 10)
            step = max(1, len(avail_rows) // max_eval)
            sampled_indices = list(range(0, len(avail_rows), step))[:max_eval]

            evaluated_bucket = []
            for idx in sampled_indices:
                r = avail_rows[idx]
                sha = r["sha256"]
                if sha in selected_sha:
                    continue
                img_path = PROJECT_ROOT / r["relative_path"]
                cat, prio, reason = evaluate_image_quality(img_path, crop)
                if cat != "REJECT":
                    evaluated_bucket.append({
                        "crop": crop,
                        "source_dataset": r["source_dataset"],
                        "source_split": r["source_split"],
                        "relative_path": r["relative_path"],
                        "filename": r["filename"],
                        "sha256": sha,
                        "visual_category": cat,
                        "annotation_priority": prio,
                        "reviewer_status": "PENDING_ANNOTATION",
                        "exclusion_reason": "NONE",
                        "rank": pref_rank(cat)
                    })
                # If we have collected plenty of preferred candidates, stop sampling this bucket
                if len(evaluated_bucket) >= split_target * 2:
                    break

            # If still short, evaluate remaining rows in this bucket
            if len(evaluated_bucket) < split_target:
                for r in avail_rows:
                    sha = r["sha256"]
                    if sha in selected_sha or any(x["sha256"] == sha for x in evaluated_bucket):
                        continue
                    img_path = PROJECT_ROOT / r["relative_path"]
                    cat, prio, reason = evaluate_image_quality(img_path, crop)
                    if cat != "REJECT":
                        evaluated_bucket.append({
                            "crop": crop,
                            "source_dataset": r["source_dataset"],
                            "source_split": r["source_split"],
                            "relative_path": r["relative_path"],
                            "filename": r["filename"],
                            "sha256": sha,
                            "visual_category": cat,
                            "annotation_priority": prio,
                            "reviewer_status": "PENDING_ANNOTATION",
                            "exclusion_reason": "NONE",
                            "rank": pref_rank(cat)
                        })
                    if len(evaluated_bucket) >= split_target:
                        break

            # Sort by visual preference: MEDIUM -> EASY -> HARD
            evaluated_bucket.sort(key=lambda x: x["rank"])

            # Pick up to split_target
            split_selected = []
            for item in evaluated_bucket:
                if len(split_selected) < split_target and item["sha256"] not in selected_sha:
                    split_selected.append(item)
                    selected_sha.add(item["sha256"])

            selected.extend(split_selected)

    print(f"  Primary pass selected: {len(selected)} for {crop}", flush=True)

    # Secondary pass: if any bucket fell short of quota, fill deficit
    if len(selected) < target_count:
        deficit = target_count - len(selected)
        print(f"  Secondary fill of {deficit} deficit for {crop}...", flush=True)
        pool_remaining = [r for r in filtered_pool if r["sha256"] not in selected_sha]
        
        step = max(1, len(pool_remaining) // (deficit * 3 + 10))
        for idx in range(0, len(pool_remaining), step):
            if len(selected) >= target_count:
                break
            r = pool_remaining[idx]
            sha = r["sha256"]
            if sha in selected_sha:
                continue
            img_path = PROJECT_ROOT / r["relative_path"]
            cat, prio, reason = evaluate_image_quality(img_path, crop)
            if cat != "REJECT":
                selected.append({
                    "crop": crop,
                    "source_dataset": r["source_dataset"],
                    "source_split": r["source_split"],
                    "relative_path": r["relative_path"],
                    "filename": r["filename"],
                    "sha256": sha,
                    "visual_category": cat,
                    "annotation_priority": prio,
                    "reviewer_status": "PENDING_ANNOTATION",
                    "exclusion_reason": "NONE",
                    "rank": pref_rank(cat)
                })
                selected_sha.add(sha)

    selected = selected[:target_count]

    cat_counts = Counter(s["visual_category"] for s in selected)
    split_counts = Counter(s["source_split"] for s in selected)
    print(f"  {crop} SELECTED: {len(selected)} total", flush=True)
    print(f"    Categories: {dict(cat_counts)}", flush=True)
    print(f"    Splits: {dict(split_counts)}", flush=True)

    return selected


# =====================================================================
# MAIN PIPELINE
# =====================================================================

def main():
    start_time = time.time()
    print("=" * 70, flush=True)
    print("AGRIMIND AI - CANDIDATE SELECTION GENERATION (PHASE 2D)", flush=True)
    print("=" * 70, flush=True)

    # 1. Verify candidate_manifest exists
    if not CANDIDATE_MANIFEST_PATH.exists():
        print(f"ERROR: {CANDIDATE_MANIFEST_PATH} does not exist!", flush=True)
        sys.exit(1)

    # 2. Load PASS candidates from manifest
    print(f"Loading {CANDIDATE_MANIFEST_PATH}...", flush=True)
    with open(CANDIDATE_MANIFEST_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        manifest_rows = list(reader)

    pass_rows = [r for r in manifest_rows if r["candidate_status"] == "CANDIDATE_METADATA_PASS"]
    print(f"Loaded {len(manifest_rows)} total manifest rows.", flush=True)
    print(f"Found {len(pass_rows)} CANDIDATE_METADATA_PASS rows.", flush=True)

    # 3. Group by crop
    crop_pools = defaultdict(list)
    for r in pass_rows:
        crop_pools[r["crop"]].append(r)

    # 4. Select 360 candidates per crop
    all_selected = []
    for crop in CROPS:
        crop_selected = select_crop_candidates(crop, crop_pools[crop], TARGET_PER_CROP)
        if len(crop_selected) != TARGET_PER_CROP:
            print(f"ERROR: Selected {len(crop_selected)} for {crop}, expected {TARGET_PER_CROP}!", flush=True)
            sys.exit(1)
        all_selected.extend(crop_selected)

    # 5. Write candidate_selection.csv
    print(f"\nWriting {SELECTION_OUTPUT_PATH}...", flush=True)
    fieldnames = [
        "crop",
        "source_dataset",
        "source_split",
        "relative_path",
        "filename",
        "sha256",
        "visual_category",
        "annotation_priority",
        "reviewer_status",
        "exclusion_reason"
    ]

    with open(SELECTION_OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for item in all_selected:
            row = {k: item[k] for k in fieldnames}
            writer.writerow(row)

    print(f"Successfully wrote {len(all_selected)} rows to {SELECTION_OUTPUT_PATH}.", flush=True)

    # =====================================================================
    # COMPREHENSIVE INTEGRITY VALIDATION
    # =====================================================================
    print("\n" + "=" * 70, flush=True)
    print("AUTOMATED VERIFICATION & SAFETY CHECKS", flush=True)
    print("=" * 70, flush=True)

    # Check 1: Total count
    assert len(all_selected) == TOTAL_TARGET, f"Total count {len(all_selected)} != {TOTAL_TARGET}"
    print(f"[PASS] Total records: {len(all_selected)} (expected {TOTAL_TARGET})", flush=True)

    # Check 2: Crop breakdown
    crop_counts = Counter(s["crop"] for s in all_selected)
    for c in CROPS:
        assert crop_counts[c] == TARGET_PER_CROP, f"{c} count {crop_counts[c]} != {TARGET_PER_CROP}"
        print(f"[PASS] {c} count: {crop_counts[c]} (expected {TARGET_PER_CROP})", flush=True)

    # Check 3: Unique SHA-256
    sha_set = set(s["sha256"] for s in all_selected)
    assert len(sha_set) == TOTAL_TARGET, f"Duplicate SHA-256 found! {len(sha_set)} != {TOTAL_TARGET}"
    print(f"[PASS] SHA-256 uniqueness: {len(sha_set)} / {TOTAL_TARGET} unique", flush=True)

    # Check 4: Unique relative_path
    path_set = set(s["relative_path"] for s in all_selected)
    assert len(path_set) == TOTAL_TARGET, f"Duplicate relative_path found! {len(path_set)} != {TOTAL_TARGET}"
    print(f"[PASS] Relative path uniqueness: {len(path_set)} / {TOTAL_TARGET} unique", flush=True)

    # Check 5: No REJECT category
    cats = Counter(s["visual_category"] for s in all_selected)
    assert "REJECT" not in cats, "REJECT category found in selection!"
    print(f"[PASS] Visual categories present: {dict(cats)} (0 REJECT)", flush=True)

    # Check 6: Reviewer status
    statuses = set(s["reviewer_status"] for s in all_selected)
    assert statuses == {"PENDING_ANNOTATION"}, f"Unexpected reviewer_status: {statuses}"
    print(f"[PASS] Reviewer status: 100% PENDING_ANNOTATION", flush=True)

    # Check 7: Annotation priority
    prios = set(s["annotation_priority"] for s in all_selected)
    assert prios.issubset({1, 2, 3}), f"Unexpected annotation_priority: {prios}"
    print(f"[PASS] Annotation priorities: {sorted(list(prios))} (all valid 1/2/3)", flush=True)

    # Check 8: Consistency with candidate_manifest.csv
    manifest_lookup = {r["relative_path"]: r for r in pass_rows}
    for s in all_selected:
        assert s["relative_path"] in manifest_lookup, f"Selected path {s['relative_path']} not in manifest pass pool!"
        m = manifest_lookup[s["relative_path"]]
        assert m["sha256"] == s["sha256"], f"SHA mismatch for {s['relative_path']}!"
        assert m["crop"] == s["crop"], f"Crop mismatch for {s['relative_path']}!"
    print(f"[PASS] Manifest consistency: 100% matches candidate_manifest.csv pass pool", flush=True)

    # Check 9: File existence on disk (read-only verification)
    missing = 0
    for s in all_selected:
        p = PROJECT_ROOT / s["relative_path"]
        if not p.is_file():
            missing += 1
    assert missing == 0, f"{missing} selected files do not exist on disk!"
    print(f"[PASS] Disk existence: 1,800 / 1,800 files verified on disk", flush=True)

    elapsed = time.time() - start_time
    print(f"\nPhase 2D execution completed successfully in {elapsed:.2f} seconds.", flush=True)


if __name__ == "__main__":
    main()
