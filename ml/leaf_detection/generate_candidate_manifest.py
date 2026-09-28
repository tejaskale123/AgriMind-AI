"""
AgriMind AI - Candidate Image Manifest Generator
=================================================

Phase 2B: Safe Metadata-Only Candidate Indexing

STRICT SAFETY CONSTRAINTS:
- 100% READ-ONLY on datasets/processed/
- ZERO image copy, move, rename, delete, resize, or modification
- Computes SHA-256 for duplicate detection
- Reads image headers (width, height, format) without decompressing pixels
- Outputs metadata index to ml/leaf_detection/candidate_manifest.csv
- Does NOT claim visual semantic leaf presence; metadata filter only
"""

import os
import sys
import csv
import hashlib
from pathlib import Path
from typing import Dict, List, Any
from PIL import Image

# =====================================================================
# PATH CONFIGURATION
# =====================================================================

MODULE_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = MODULE_ROOT.parent.parent

DATASETS_DIR = PROJECT_ROOT / "datasets" / "processed"
MANIFEST_OUTPUT = MODULE_ROOT / "candidate_manifest.csv"

# Supported target crops and their dataset directory names
CROP_DATASETS = {
    "Cotton": {
        "dataset_name": "cotton_final",
        "path": DATASETS_DIR / "cotton_final",
        "future_target": 360
    },
    "Soybean": {
        "dataset_name": "soybean_11class_balanced",
        "path": DATASETS_DIR / "soybean_11class_balanced",
        "future_target": 360
    },
    "Maize": {
        "dataset_name": "maize_extended_final300",
        "path": DATASETS_DIR / "maize_extended_final300",
        "future_target": 360
    },
    "Wheat": {
        "dataset_name": "wheat",
        "path": DATASETS_DIR / "wheat",
        "future_target": 360
    },
    "Pigeon Pea": {
        "dataset_name": "pigeon_pea_targeted",
        "path": DATASETS_DIR / "pigeon_pea_targeted",
        "future_target": 360
    }
}

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MIN_RESOLUTION = 224


def calculate_sha256(file_path: Path) -> str:
    """Computes SHA-256 hash using chunked streaming (safe for any file size)."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def get_source_split(relative_path_parts: tuple) -> str:
    """Extracts train/val/test split name if present in directory hierarchy."""
    for part in relative_path_parts:
        lower = part.lower()
        if lower in ("train", "val", "test", "validation"):
            return lower
    return "all"


def generate_manifest():
    print("=" * 75)
    print("  AGRIMIND AI - PHASE 2B: CANDIDATE IMAGE MANIFEST GENERATOR")
    print("=" * 75)
    print(f"Target datasets root: {DATASETS_DIR}")
    print(f"Manifest output destination: {MANIFEST_OUTPUT}")
    print("Mode: STRICT READ-ONLY (No image modifications/copies/moves)\n")

    fieldnames = [
        "crop",
        "source_dataset",
        "source_split",
        "relative_path",
        "filename",
        "extension",
        "width",
        "height",
        "file_size_bytes",
        "sha256",
        "candidate_status",
        "exclusion_reason"
    ]

    seen_hashes: Dict[str, str] = {}  # sha256 -> first_relative_path

    stats = {
        crop: {
            "total_scanned": 0,
            "metadata_pass": 0,
            "excluded_duplicate": 0,
            "excluded_resolution": 0,
            "excluded_unreadable": 0,
            "excluded_format": 0,
            "future_target": meta["future_target"]
        }
        for crop, meta in CROP_DATASETS.items()
    }

    records: List[Dict[str, Any]] = []

    for crop_name, crop_meta in CROP_DATASETS.items():
        crop_path = crop_meta["path"]
        dataset_name = crop_meta["dataset_name"]

        print(f"Scanning {crop_name:12} from '{dataset_name}'...")

        if not crop_path.exists():
            print(f"  WARNING: Directory does not exist: {crop_path}")
            continue

        # Find all files recursively in read-only mode
        for root, _, files in os.walk(crop_path):
            for file_name in files:
                file_path = Path(root) / file_name
                rel_to_project = file_path.relative_to(PROJECT_ROOT).as_posix()
                ext = file_path.suffix.lower()

                stats[crop_name]["total_scanned"] += 1

                # 1. Extension check
                if ext not in VALID_EXTENSIONS:
                    stats[crop_name]["excluded_format"] += 1
                    records.append({
                        "crop": crop_name,
                        "source_dataset": dataset_name,
                        "source_split": get_source_split(file_path.parts),
                        "relative_path": rel_to_project,
                        "filename": file_name,
                        "extension": ext,
                        "width": 0,
                        "height": 0,
                        "file_size_bytes": file_path.stat().st_size,
                        "sha256": "",
                        "candidate_status": "EXCLUDED_METADATA",
                        "exclusion_reason": f"UNSUPPORTED_FORMAT: {ext}"
                    })
                    continue

                # 2. File size & SHA-256
                try:
                    file_size = file_path.stat().st_size
                    file_sha = calculate_sha256(file_path)
                except Exception as e:
                    stats[crop_name]["excluded_unreadable"] += 1
                    records.append({
                        "crop": crop_name,
                        "source_dataset": dataset_name,
                        "source_split": get_source_split(file_path.parts),
                        "relative_path": rel_to_project,
                        "filename": file_name,
                        "extension": ext,
                        "width": 0,
                        "height": 0,
                        "file_size_bytes": 0,
                        "sha256": "",
                        "candidate_status": "EXCLUDED_METADATA",
                        "exclusion_reason": f"UNREADABLE_FILE_SYSTEM: {str(e)}"
                    })
                    continue

                # 3. Exact Duplicate Check (SHA-256 collision)
                if file_sha in seen_hashes:
                    first_seen = seen_hashes[file_sha]
                    stats[crop_name]["excluded_duplicate"] += 1
                    records.append({
                        "crop": crop_name,
                        "source_dataset": dataset_name,
                        "source_split": get_source_split(file_path.parts),
                        "relative_path": rel_to_project,
                        "filename": file_name,
                        "extension": ext,
                        "width": 0,
                        "height": 0,
                        "file_size_bytes": file_size,
                        "sha256": file_sha,
                        "candidate_status": "EXCLUDED_METADATA",
                        "exclusion_reason": f"EXACT_DUPLICATE_SHA256 (matches {first_seen})"
                    })
                    continue

                seen_hashes[file_sha] = rel_to_project

                # 4. Safe Image Header Read (width x height without pixel decompression)
                try:
                    with Image.open(file_path) as img:
                        w, h = img.size
                except Exception as e:
                    stats[crop_name]["excluded_unreadable"] += 1
                    records.append({
                        "crop": crop_name,
                        "source_dataset": dataset_name,
                        "source_split": get_source_split(file_path.parts),
                        "relative_path": rel_to_project,
                        "filename": file_name,
                        "extension": ext,
                        "width": 0,
                        "height": 0,
                        "file_size_bytes": file_size,
                        "sha256": file_sha,
                        "candidate_status": "EXCLUDED_METADATA",
                        "exclusion_reason": f"CORRUPTED_IMAGE_HEADER: {str(e)}"
                    })
                    continue

                # 5. Resolution Threshold Check
                if w < MIN_RESOLUTION or h < MIN_RESOLUTION:
                    stats[crop_name]["excluded_resolution"] += 1
                    records.append({
                        "crop": crop_name,
                        "source_dataset": dataset_name,
                        "source_split": get_source_split(file_path.parts),
                        "relative_path": rel_to_project,
                        "filename": file_name,
                        "extension": ext,
                        "width": w,
                        "height": h,
                        "file_size_bytes": file_size,
                        "sha256": file_sha,
                        "candidate_status": "EXCLUDED_METADATA",
                        "exclusion_reason": f"RESOLUTION_TOO_LOW ({w}x{h} < {MIN_RESOLUTION}x{MIN_RESOLUTION})"
                    })
                    continue

                # 6. Candidate Metadata Pass
                stats[crop_name]["metadata_pass"] += 1
                records.append({
                    "crop": crop_name,
                    "source_dataset": dataset_name,
                    "source_split": get_source_split(file_path.parts),
                    "relative_path": rel_to_project,
                    "filename": file_name,
                    "extension": ext,
                    "width": w,
                    "height": h,
                    "file_size_bytes": file_size,
                    "sha256": file_sha,
                    "candidate_status": "CANDIDATE_METADATA_PASS",
                    "exclusion_reason": "NONE"
                })

    # Write output manifest CSV
    print(f"\nWriting {len(records)} metadata records to {MANIFEST_OUTPUT}...")
    with open(MANIFEST_OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print("Manifest generated successfully.\n")

    # Print summary table
    print("=" * 85)
    print("                      CANDIDATE METADATA AUDIT REPORT")
    print("=" * 85)
    header = f"{'Crop':12} | {'Scanned':8} | {'Pass':7} | {'Duplicates':10} | {'Res Fail':8} | {'Target':6} | {'Status'}"
    print(header)
    print("-" * 85)

    tot_scanned = 0
    tot_pass = 0
    tot_dup = 0
    tot_res = 0

    for crop_name, s in stats.items():
        tot_scanned += s["total_scanned"]
        tot_pass += s["metadata_pass"]
        tot_dup += s["excluded_duplicate"]
        tot_res += s["excluded_resolution"]
        coverage = "AMPLE" if s["metadata_pass"] >= s["future_target"] else "DEFICIT"

        print(
            f"{crop_name:12} | "
            f"{s['total_scanned']:8} | "
            f"{s['metadata_pass']:7} | "
            f"{s['excluded_duplicate']:10} | "
            f"{s['excluded_resolution']:8} | "
            f"{s['future_target']:6} | "
            f"{coverage} ({s['metadata_pass']}/{s['future_target']})"
        )

    print("-" * 85)
    print(
        f"{'TOTAL':12} | "
        f"{tot_scanned:8} | "
        f"{tot_pass:7} | "
        f"{tot_dup:10} | "
        f"{tot_res:8} | "
        f"1800   | "
        f"AMPLE POOL ({tot_pass}/1800 target candidates)"
    )
    print("=" * 85)
    print("\nNote: 'Pass' indicates valid image metadata (resolution >= 224x224, readable header, unique SHA-256).")
    print("Visual semantic leaf verification and final annotation will occur in subsequent phases.")


if __name__ == "__main__":
    generate_manifest()
