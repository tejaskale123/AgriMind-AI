# AgriMind AI — Full Automatic Leaf Annotation Run (1,800 Candidates)

This directory contains the completed full automatic leaf annotation run across all 1,800 selected crop candidates.

## Directory Structure

```
full_run/
├── outputs/
│   ├── json/                      # Individual candidate JSON annotations (annotation_0001.json to annotation_1800.json)
│   ├── masks/                     # Full-resolution binary leaf masks (0 = background, 255 = leaf)
│   └── previews/                  # Aesthetic visual overlays with emerald polygons, bbox, vertices, and banner
├── automatic_annotation_manifest.csv # Master CSV indexing all 1,800 candidates with geometry metrics and statuses
├── automatic_annotation_full_report.md # Comprehensive metrics, per-crop breakdown, and integrity audit
└── README.md                      # This documentation
```

## Status Values

- `AUTOMATIC_ANNOTATED`: All automated contour checks passed (solidity, center proximity, area bounds, confidence >= 0.65).
- `SKIPPED_EXISTING`: Output files already exist on disk; candidate skipped to prevent overwriting.
- `REVIEW_REQUIRED`: Plausible leaf detected, lower confidence, or partial existing outputs requiring human review.
- `REJECTED`: No valid contour or unviable geometry detected.

> **Note**: Automatic annotations are machine-generated polygons for training bootstrap, NOT human ground truth.
