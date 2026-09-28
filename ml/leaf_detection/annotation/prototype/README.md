# AgriMind AI — Prototype Leaf Polygon Annotation Tool

## 1. Overview
This directory (`ml/leaf_detection/annotation/prototype/`) contains a lightweight, zero-dependency, local browser-based polygon annotation prototype designed to validate the leaf boundary labeling workflow for AgriMind AI before scaling to the full dataset.

## 2. Scope & Safety Constraints
- **Validation Prototype Only**: This tool is strictly a prototype validation environment. It does **not** perform mass annotation of all 1,800 candidate images.
- **Single Test Image**: Configured exclusively for the first Cotton candidate:
  - File: `alternaria_(100).png`
  - Relative Path: `datasets/processed/cotton_final/test/Alternaria Leaf Spot/alternaria_(100).png`
  - Dimensions: `700 x 700 px`
- **100% Read-Only Source Data**: The source image is read directly from `datasets/processed/` and served via memory buffer; it is **never** copied, moved, or altered.
- **Zero Third-Party Dependencies**: Built exclusively with Python standard library (`http.server`, `urllib`, `json`), HTML5 Canvas, and Vanilla JavaScript. Zero npm packages, zero external CDNs, zero pip installations.

## 3. Labeling Protocol & Boundary Rules
- **Target Semantic Class**: Strictly single-class **`leaf`** (Category ID: `1`).
- **Visible Leaf Boundary**: The polygon outline must closely trace the exterior anatomical perimeter of the visible leaf blade.
- **Strict Exclusions**:
  - Background foliage, distant canopy, and weeds must remain **outside** the polygon.
  - Soil, mulch, and fallen debris must remain **outside**.
  - Human hands, fingers, fingernails, and handheld tools must **never** be included inside the leaf polygon. The boundary line must run along the actual leaf margin where the finger holds the leaf.
  - Non-leaf plant organs (petiole stems, main branches, flowers, bolls) must be excluded.

## 4. Coordinate System & Geometry Preservation
- **Original Resolution Mapping**: While the image is displayed responsively on an HTML5 Canvas, all click coordinates are mathematically transformed and saved in the **original image coordinate space** ($[0, 700] \times [0, 700]$).
- **No Rescaling of Saved Data**: Coordinate values are never scaled down or distorted by browser window resizing. Model preprocessing (resizing to $256 \times 256$) occurs strictly during training/inference.

## 5. Geometry Validation Rules
Before any prototype annotation is saved, both client-side and server-side validators enforce:
1. **Minimum Vertex Count**: At least 3 points required.
2. **Closed Polygon**: Polygon must be explicitly closed.
3. **Boundary Bounds**: All vertices $(x, y)$ must satisfy $0 \le x \le W_{\text{orig}}$ and $0 \le y \le H_{\text{orig}}$.
4. **Non-Negative Coordinates**: Negative coordinates are strictly rejected.
5. **Positive Area**: Polygon must possess non-zero positive area calculated via the Shoelace formula.

## 6. How to Run (Manual Execution)
This prototype server is **not started automatically**. To launch manually:
```bash
python ml/leaf_detection/annotation/prototype/app.py 8088
```
Then navigate to:
```
http://127.0.0.1:8088/
```
Saved annotations are stored in:
`ml/leaf_detection/annotation/prototype/outputs/prototype_cotton_test_annotation.json`

## 7. Next Steps
This prototype must be manually reviewed and verified by the development team before Phase 4 full-scale annotation procedures commence.
