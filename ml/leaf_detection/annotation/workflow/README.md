# AgriMind AI — Multi-Image Leaf Annotation Workflow

## 1. Overview
This directory (`ml/leaf_detection/annotation/workflow/`) provides an upgraded, multi-image browser-based polygon annotation environment capable of navigating and labeling all **1,800 curated candidate images** across the 5 target crops:
- **Cotton**: 360 candidates
- **Soybean**: 360 candidates
- **Maize**: 360 candidates
- **Wheat**: 360 candidates
- **Pigeon Pea**: 360 candidates

## 2. Architecture & Safety Guarantees
- **100% Read-Only Source Access**: Images are served directly from `datasets/processed/` via memory stream; no source image is ever copied, moved, resized, or overwritten.
- **Zero External Dependencies**: Built strictly using standard library Python (`http.server`, `urllib`, `json`, `csv`, `pathlib`) + `PIL` (already installed), HTML5 Canvas, and Vanilla JavaScript.
- **No Automatic Annotation / No Fake Masks**: The workflow provides an interactive tool for human annotators; it never automatically annotates images or generates synthetic masks.
- **Original Coordinate Mapping**: Canvas click coordinates are mathematically mapped back to each candidate image's original dimensions ($W_{\text{orig}} \times H_{\text{orig}}$). No coordinate resizing takes place during annotation.

## 3. Workflow Features & Navigation
- **Sequential & Direct Navigation**:
  - `◀ Prev` / `A` / `Left Arrow`: Navigate to previous candidate.
  - `Next ▶` / `D` / `Right Arrow`: Navigate to next candidate.
  - `Jump to ID`: Direct numeric jump (`1` to `1800`).
- **Filtering Options**:
  - Filter by Crop: `All`, `Cotton`, `Soybean`, `Maize`, `Wheat`, `Pigeon Pea`.
  - Filter by Status: `All`, `NOT_STARTED`, `IN_PROGRESS`, `ANNOTATED`, `REVIEW_REQUIRED`.
- **Annotation Statuses**:
  - `NOT_STARTED`: Default state; no polygon saved.
  - `IN_PROGRESS`: Actively placing vertices.
  - `ANNOTATED`: Valid polygon geometry validated and saved to disk.
  - `REVIEW_REQUIRED`: Candidate flagged by annotator for second review (e.g. boundary ambiguity, heavy occlusion).

## 4. Resume Support & Overwrite Protection
- **Automatic Resume**: When navigating to any previously saved candidate, the existing polygon contour is loaded and rendered onto the canvas, displaying the status `ANNOTATED`.
- **Accidental Overwrite Protection**: If a candidate already has an existing saved annotation and the user modifies and re-saves, an explicit confirmation modal requires user confirmation before updating the file.

## 5. Output Format
Individual modular JSON files are saved to `ml/leaf_detection/annotation/workflow/outputs/annotation_{id:04d}.json`.
Each record includes:
```json
{
  "candidate_id": 1,
  "crop": "Cotton",
  "source_dataset": "cotton_final",
  "source_split": "test",
  "filename": "alternaria_(100).png",
  "relative_path": "datasets/processed/cotton_final/test/Alternaria Leaf Spot/alternaria_(100).png",
  "sha256": "7373e7bcee92eb641fd7d2de03eba850d03dfdfccadd127a3a2cd5da52516b91",
  "original_width": 700,
  "original_height": 700,
  "category": "leaf",
  "polygon_coordinates": [[x1, y1], [x2, y2], ...],
  "point_count": 30,
  "bbox": [min_x, min_y, width, height],
  "polygon_area_pixels": 84724.5,
  "is_closed": true,
  "annotation_status": "ANNOTATED",
  "reviewer_notes": "",
  "created_at": "2026-09-26T15:10:00Z",
  "updated_at": "2026-09-26T15:10:00Z"
}
```

## 6. How to Run Manually
This workflow server is **not started automatically**. To launch manually:
```bash
python ml/leaf_detection/annotation/workflow/app.py 8089
```
Then navigate in your browser to:
```
http://127.0.0.1:8089/
```
The interface starts at Candidate #1 (Cotton) in ready mode without modifying any files.
