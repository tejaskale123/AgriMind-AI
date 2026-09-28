# AgriMind AI — Isolated Leaf Segmentation Annotation Workspace

## 1. Overview
This directory (`ml/leaf_detection/annotation/`) is an **isolated workspace** dedicated to the preparation, polygon segmentation labeling, and quality control of the crop-agnostic plant leaf segmentation dataset for AgriMind AI.

## 2. Strict Safety Principles
- **Read-Only Source Datasets**: The production datasets in `datasets/processed/` remain 100% read-only.
- **Zero Image Duplication at this Stage**: Images are referenced via relative paths in `manifests/annotation_manifest.csv`. No source images have been copied into `images/` yet.
- **Zero Production Breakage**: Existing disease classification models, FastAPI backend routes, React frontend, and SQLite history database are completely isolated and untouched.
- **No Model Training / Download**: No training or model downloading is performed during workspace setup.

## 3. Semantic Class Definition
The future detector is strictly **single-class and crop-agnostic**:
- Class: **`leaf`** (Category ID: `1`)
- The detector answers only: *"Where is the plant leaf in this image?"*
- It does **not** predict crop species or plant disease classes.

## 4. Annotation Format Specification
- **Format**: Standard COCO Polygon Segmentation (`COCO 1.0 JSON`).
- **Annotation Element**: Tight polygonal contours tracing the perimeter boundary of visible leaf blades/leaflets.
- **Resolution Preservation**: All annotation must be performed on the source image at its original resolution. Resizing to $256\times 256$ input tensors is reserved exclusively for the model training and inference pre-processing pipeline.

## 5. Strict Labeling Protocol
1. **Precise Boundary Tracing**: Tracing must strictly hug the visible exterior contour of the leaf blade.
2. **Strict Background & Soil Exclusion**: Soil particles, dried stems, mulching, weeds, and distant background canopy must be strictly excluded from the polygon.
3. **Strict Human Hand & Skin Exclusion**: Fingers, fingernails, hands, and handheld grips must **never** be included inside the leaf polygon. The boundary must run along the actual leaf margin where the finger holds the leaf.
4. **Compound Leaf Rules**:
   - For trifoliate leaves (Soybean, Pigeon Pea), each distinct leaflet must be outlined as an individual polygon instance or a cleanly grouped compound polygon depending on overlap, with petiolules and main branches excluded.
5. **Wheat Strict Linear Curation**: Wheat blades are narrow and linear. Annotators must carefully outline the active blade boundary without including adjacent crossing blades or grass clutter.
6. **No Synthetic / Fake Masks**: All annotations must represent verified human or high-precision polygon annotations. Synthetic, bounding-box-derived rectangular masks or automated pseudolabels are strictly prohibited.

## 6. Directory Layout
```
annotation/
├── README.md               # Workspace documentation & protocol
├── images/                 # Placeholder folders for 5 crops (no copied images yet)
│   ├── cotton/
│   ├── soybean/
│   ├── maize/
│   ├── wheat/
│   └── pigeon_pea/
├── annotations/            # Destination for future COCO polygon JSON files
├── manifests/              # Annotation manifest referencing candidate images
│   └── annotation_manifest.csv
└── reports/                # Audit reports and QA checkpoints
    └── phase_3a_workspace_report.md
```

## 7. Current Status
- **Phase**: 3A Workspace Preparation Complete.
- **Annotation Status**: `NOT_STARTED` across all 1,800 candidate images.
