# AgriMind AI — Automatic Leaf Annotation Prototype (5-Image Test)

## 1. Overview
This module (`ml/leaf_detection/annotation/automatic_test/`) provides an automated leaf segmentation and polygon generation prototype tested on the **first 5 candidate images** from `ml/leaf_detection/candidate_selection.csv`.

It eliminates manual point-by-point clicking by utilizing computer vision feature extraction to detect botanical leaf contours, smooth them into polygonal representations, and validate them against rigorous geometry rules.

## 2. Strict Safety Principles
- **Tested on 5 Images Only**: Does not batch-process all 1,800 candidates.
- **100% Read-Only Source Data**: Images in `datasets/processed/` are accessed in memory; no source image is copied, moved, resized, or overwritten.
- **Zero Third-Party Package Installations**: Uses only native Python and pre-installed `opencv-python`, `numpy`, and `Pillow`.
- **No Full-Image Fallback**: If an image fails segmentation or falls below the confidence threshold, it is strictly flagged as `REVIEW_REQUIRED` without emitting a fake or full-frame polygon.

## 3. Automatic Segmentation Pipeline
1. **Background Color Estimation**: Samples outer 12px border margins to establish baseline ambient/bench background color.
2. **Color Difference & Botanical Masking**: Computes Euclidean color distance combined with HSV green and chlorotic/necrotic disease masks.
3. **Adaptive Otsu Thresholding**: Separates leaf foreground from background without hardcoded intensity values.
4. **Morphological Filtering**: Applies elliptical morphological closing ($7\times 7$) to bridge leaf vein gaps and opening to eliminate background specks.
5. **Contour Extraction & Scoring**: Evaluates candidate contours for solidity, area ratio, and center proximity to compute a composite confidence score ($0.0 \le C \le 1.0$).
6. **Polygonal Approximation**: Applies `cv2.approxPolyDP` with an adaptive epsilon ($0.35\%$ of contour perimeter) to yield smooth, natural leaf boundaries (typically 20–35 vertices).
7. **Coordinate Mapping**: Converts vertices directly into original image coordinates ($[0, W_{\text{orig}}] \times [0, H_{\text{orig}}]$).

## 4. Output Structure
```
automatic_test/
├── config.py               # Pipeline thresholds & parameters
├── run_auto_annotation.py  # Standalone automated segmentation engine
├── outputs/
│   ├── json/               # Standardized JSON annotations
│   ├── masks/              # Full-resolution binary mask PNGs
│   ├── previews/           # Visual overlay PNGs with emerald polygon & vertices
│   └── .gitkeep
└── README.md
```

## 5. Summary of 5-Image Validation Run
All 5 test candidates were processed with high confidence ($0.87 - 0.96$) and realistic leaf area coverage ($18.3\% - 28.4\%$):
- Candidate #1 (`alternaria_(100).png`): 28 points, 18.3% area, Conf: 0.93
- Candidate #2 (`alternaria_(107).png`): 34 points, 22.5% area, Conf: 0.92
- Candidate #3 (`alternaria_(11).png`): 31 points, 28.4% area, Conf: 0.87
- Candidate #4 (`alternaria_(115).png`): 33 points, 20.3% area, Conf: 0.90
- Candidate #5 (`alternaria_(118).png`): 29 points, 24.5% area, Conf: 0.96

Visual previews can be reviewed directly in `outputs/previews/` to confirm contour fidelity.
