# AgriMind AI — Full Automatic Leaf Annotation Report (1,800 Candidates)
================================================================================

> **CRITICAL ARCHITECTURAL DISTINCTION**
> **AUTO_ACCEPTED** signifies that the automated segmentation and contour approximation pipeline produced a geometrically valid, non-fallback polygon that passed all quality heuristics (area ratio, boundary constraints, vertex count, and confidence threshold).
> It does **NOT** represent human-verified ground truth. These annotations are intended as a high-quality bootstrap starting dataset for training a dedicated leaf segmentation model.

---

## 1. Executive Summary

| Metric | Count / Value | Percentage of Total |
| :--- | :--- | :--- |
| **Total Candidates Target** | 1,800 | 100.0% |
| **Total Candidates Processed** | 1800 | 100.0% |
| **AUTO_ACCEPTED** | **750** | **41.7%** |
| **SKIPPED_EXISTING** | **0** | **0.0%** |
| **REVIEW_REQUIRED** | **1050** | **58.3%** |
| **REJECTED** | **0** | **0.0%** |
| **ERROR** | **0** | **0.0%** |
| **Execution Time** | 399.51 seconds | ~4.5 images/sec |
| **Total Disk Usage** | **9187.65 MB** | ~8.97 GB |

---

## 2. Per-Crop Breakdown

| Crop | Total Candidates | AUTO_ACCEPTED | SKIPPED_EXISTING | REVIEW_REQUIRED | REJECTED | ERROR |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Cotton** | 360 | 0 | 0 | 360 | 0 | 0 |
| **Soybean** | 360 | 0 | 0 | 360 | 0 | 0 |
| **Maize** | 360 | 51 | 0 | 309 | 0 | 0 |
| **Wheat** | 360 | 339 | 0 | 21 | 0 | 0 |
| **Pigeon Pea** | 360 | 360 | 0 | 0 | 0 | 0 |
| **TOTAL** | **1,800** | **750** | **0** | **1050** | **0** | **0** |

---

## 3. Geometric & Quality Statistics (AUTO_ACCEPTED)

| Metric | Mean | Std Dev | Min | Max |
| :--- | :--- | :--- | :--- | :--- |
| **Confidence Score** | 0.803 | 0.085 | 0.670 | 0.983 |
| **Leaf Area Ratio** | 68.8% | 24.3% | 7.3% | 98.1% |
| **Solidity (Area / Convex Hull)** | 0.922 | 0.106 | 0.318 | 1.000 |

---

## 4. Suspicious Segmentation Statistics

| Heuristic Indicator | Flagged Count | Description |
| :--- | :--- | :--- |
| **Confidence in [0.65, 0.70)** | 24 | Barely passed threshold; candidate for spot review |
| **Extreme Area Ratio (<8% or >85%)** | 267 | Abnormally small or unusually dominant leaf regions |
| **Low Solidity (<0.60)** | 14 | Irregular or fragmented leaf boundary |

---

## 5. Failure & Review Reason Distribution

| Reason / Flag | Count | Category | Action Required |
| :--- | :--- | :--- | :--- |
| PARTIAL_OUTPUT | 1016 | Rejection | Exclude or re-segment |
| Area ratio too large | 33 | Quality Flag | Exclude or re-segment |
| Area ratio too small | 1 | Quality Flag | Exclude or re-segment |

---

## 6. Error Candidates

| Candidate ID | Crop | Filename | Error Details |
| :--- | :--- | :--- | :--- |
| None | N/A | N/A | Zero unexpected processing errors encountered |

---

## 7. Artifacts & Generated Deliverables

| Deliverable Type | Destination Path | Count On Disk |
| :--- | :--- | :--- |
| **JSON Annotations** | `full_run/outputs/json/` | 1800 |
| **Binary Leaf Masks** | `full_run/outputs/masks/` | 1555 |
| **Visual Previews** | `full_run/outputs/previews/` | 1796 |
| **Master Manifest** | `full_run/automatic_annotation_manifest.csv` | 1 file (1,800 rows) |
| **Execution Report** | `full_run/automatic_annotation_full_report.md` | 1 file |
| **Documentation** | `full_run/README.md` | 1 file |

---

## 8. Existing-Model Compatibility Check Result

- **Models Inspected in `models/`**:
  - `cotton_9class_efficientnet_b0.pth` (EfficientNet-B0)
  - `maize_extended_efficientnet_b0.pth` (EfficientNet-B0)
  - `pigeon_pea_targeted_efficientnet_b0.pth` (EfficientNet-B0)
  - `soybean_11class_efficientnet_b0.pth` (EfficientNet-B0)
  - `wheat_efficientnet_b0.pth` (EfficientNet-B0)
- **Technical Suitability for Segmentation**: **NOT SUITABLE**
  - All existing models are standard whole-image classification architectures with linear classification heads predicting disease categorical logits.
  - None contain spatial deconvolutional/FCN/Lite-RASPP heads required for pixel-level boundary extraction.
  - As instructed, the verified `segment_leaf_candidate()` OpenCV/NumPy pipeline is retained, and all existing disease models remain 100% untouched.

---

## 9. System & Safety Integrity Verification

1. **Source Image Integrity**:
   - `datasets/processed/` accessed **100% READ-ONLY**.
   - Zero files created, moved, renamed, resized, overwritten, or deleted.
   - Verified SHA-256 integrity check: **PASS (100% Unchanged)**.
2. **Production Pipeline Integrity**:
   - Existing trained disease models: **UNTOUCHED (100%)**.
   - Backend APIs (`backend/`): **UNTOUCHED (100%)**.
   - Frontend UI (`frontend-exp/`): **UNTOUCHED (100%)**.
   - Database (`agrimind_history.db`): **UNTOUCHED (100%)**.
   - Model Training: **NOT STARTED (0 models trained)**.
   - Git Commits/Pushes: **NONE (0 commits, 0 pushes)**.
