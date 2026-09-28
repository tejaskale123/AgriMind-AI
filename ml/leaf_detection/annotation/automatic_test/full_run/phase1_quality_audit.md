# AgriMind AI — Phase 1 Automatic Annotation Quality Audit
================================================================================

**Audit Date:** 2026-09-26  
**Target Directory:** `ml/leaf_detection/annotation/automatic_test/full_run/`  
**Dataset Source:** `ml/leaf_detection/candidate_selection.csv` (1,800 candidates)  
**Manifest Analyzed:** `automatic_annotation_manifest.csv` (1,800 records)  
**Audit Scope:** 100% READ-ONLY geometric, spatial, and cross-verification audit.

---

## 1. Overall Quality Summary

A rigorous audit was conducted across all 1,800 candidate images, their manifest records, JSON annotations, binary masks, and visual previews generated in `full_run/`.

### Key Findings
1. **Total Candidates:** Exactly **1,800 candidates** were indexed, processed, and accounted for across all 5 crops.
2. **Current Status Distribution:**
   - **AUTO_ACCEPTED:** **750 candidates (41.7%)**
   - **REVIEW_REQUIRED:** **1,050 candidates (58.3%)**
   - **REJECTED:** **0 candidates (0.0%)**
   - **ERROR:** **0 candidates (0.0%)**
   - **SKIPPED_EXISTING:** **0 candidates (0.0%)**
3. **Severe Crop Imbalance in Accepted Manifest:**
   - **Pigeon Pea:** 360 / 360 (100.0%) AUTO_ACCEPTED — Outstanding quality.
   - **Wheat:** 339 / 360 (94.2%) AUTO_ACCEPTED — High acceptance, but heavy macro bias (area ratio >85%).
   - **Maize:** 51 / 360 (14.2%) AUTO_ACCEPTED — 309 flagged as REVIEW_REQUIRED.
   - **Cotton:** 0 / 360 (0.0%) AUTO_ACCEPTED — 100% flagged as REVIEW_REQUIRED.
   - **Soybean:** 0 / 360 (0.0%) AUTO_ACCEPTED — 100% flagged as REVIEW_REQUIRED.

---

## 2. Crop-Wise Quality Audit Table

| Crop | Total | AUTO_ACCEPTED | REVIEW_REQ | REJECTED | ERROR | Accept % | Review % | Mean Conf | Median Conf | Min Conf | Max Conf | Mean Area | Median Area | Min Area | Max Area | Mean Sol | Low Conf (<0.7) | Extreme Area (<0.08 / >0.85) | Low Sol (<0.6) | Missing Mask | Missing Prev | Missing JSON | Usability Tier |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Cotton** | 360 | 0 | 360 | 0 | 0 | 0.0% | 100.0% | N/A* | N/A* | N/A* | N/A* | N/A* | N/A* | N/A* | N/A* | N/A* | 0 | 0 | 0 | 20 | 0 | 0 | **NOT SUITABLE YET** |
| **Soybean** | 360 | 0 | 360 | 0 | 0 | 0.0% | 100.0% | N/A* | N/A* | N/A* | N/A* | N/A* | N/A* | N/A* | N/A* | N/A* | 0 | 0 | 0 | 169 | 0 | 0 | **NOT SUITABLE YET** |
| **Maize** | 360 | 51 | 309 | 0 | 0 | 14.2% | 85.8% | 0.715 | 0.719 | 0.688 | 0.761 | 92.8% | 95.1% | 75.6% | 98.1% | 0.965 | 6 | 45 | 0 | 35 | 4 | 0 | **LOW USABILITY** |
| **Wheat** | 360 | 339 | 21 | 0 | 0 | 94.2% | 5.8% | 0.740 | 0.720 | 0.670 | 0.959 | 83.1% | 90.1% | 7.3% | 97.7% | 0.934 | 18 | 222 | 14 | 21 | 0 | 0 | **MEDIUM USABILITY** |
| **Pigeon Pea** | 360 | 360 | 0 | 0 | 0 | 100.0% | 0.0% | 0.876 | 0.887 | 0.782 | 0.983 | 51.9% | 46.2% | 13.9% | 80.9% | 0.904 | 0 | 0 | 0 | 0 | 0 | 0 | **HIGH USABILITY** |
| **TOTAL** | **1,800** | **750** | **1,050** | **0** | **0** | **41.7%** | **58.3%** | **0.803** | **0.785** | **0.670** | **0.983** | **68.8%** | **76.5%** | **7.3%** | **98.1%** | **0.922** | **24** | **267** | **14** | **245** | **4** | **0** | — |

*\*Note: For Cotton and Soybean, 0 candidates were accepted in the manifest due to the PARTIAL_OUTPUT protection rule.*

---

## 3. Investigation: Why Cotton and Soybean Have 0 AUTO_ACCEPTED

Detailed forensic analysis of candidate records 1–720 reveals the exact mechanism:

1. **Pre-existing File Naming Discrepancy:**
   - In the prior interrupted execution, preview and mask files were saved with filenames incorporating the source image stem, e.g.:  
     `mask_0001_alternaria_(100).png` and `preview_0001_alternaria_(100).png`.
   - The user's specification mandated strict uniform naming:  
     `mask_0001.png` and `preview_0001.png`.
2. **Strict Resume Rule 4 Triggered:**
   - When the resume logic inspected Candidate #1, it found `annotation_0001.json` present on disk, but `mask_0001.png` and `preview_0001.png` were absent (because only the `_{stem}` suffixed files existed).
   - `exist_count` evaluated to `1` (partial output).
   - Under **Rule 4** ("If only some output files exist: DO NOT overwrite, preserve existing files, mark as REVIEW_REQUIRED / PARTIAL_OUTPUT"), the orchestrator safely and correctly refused to overwrite or delete the existing files.
3. **Failure Reason Breakdown for 1,050 REVIEW_REQUIRED Records:**
   - **`PARTIAL_OUTPUT: Incomplete existing outputs detected on disk (not overwritten)`**: **1,016 candidates**
     - Cotton: 360 candidates (100.0%)
     - Soybean: 360 candidates (100.0%)
     - Maize: 296 candidates (82.2%)
   - **`Area ratio too large (> 98.0%)`**: **33 candidates**
     - Wheat: 20 candidates (leaves covering 98.1% to 99.0% of the entire frame)
     - Maize: 13 candidates (leaves covering 98.1% to 98.7% of the entire frame)
   - **`Area ratio too small (< 5.0%)`**: **1 candidate**
     - Wheat #1209 (`TanSpot_0012.png`): 2.7% area ratio.

---

## 4. Geometric Quality Analysis for AUTO_ACCEPTED Candidates (750 Records)

Every generated binary mask for the 750 AUTO_ACCEPTED candidates was analyzed at the pixel level:

- **Border Contact Analysis:**
  - **Touches Image Border:** **0 / 750 (0.0%)**  
    *(The 12-pixel margin exclusion in the pipeline successfully prevented any border artifacts).*
- **Size Plausibility:**
  - **Extremely Small (< 8% of image):** **2 / 750 (0.3%)**  
    *(Wheat #1157 at 7.3%, Wheat #1182 at 7.8%)*
  - **Extremely Large (> 85% of image):** **270 / 750 (36.0%)**  
    *(Maize: 45 candidates, Wheat: 225 candidates)*
  - **Well-Centered / Plausible Leaves (10% to 80%):** **478 / 750 (63.7%)**  
    *(Dominated by Pigeon Pea and selective Wheat samples)*
- **Background Domination Check:**
  - **Candidates with Area > 90% and Solidity < 0.60:** **0 / 750 (0.0%)**  
    *(All accepted large regions have high solidities (>0.92), representing true full-frame macro leaf close-ups rather than fragmented background noise).*

---

## 5. Crop Usability Classification

### Tier A: HIGH USABILITY
- **Pigeon Pea (360 Candidates):**
  - **Acceptance:** 100.0% (360/360)
  - **Quality Profile:** Mean confidence 0.876, mean area ratio 51.9%, mean solidity 0.904.
  - Zero low-confidence samples (<0.70), zero extreme-area samples (<0.08 or >0.85).
  - Clean, centered foliage with sharp polygon boundaries. Ready for training immediately.

### Tier B: MEDIUM USABILITY
- **Wheat (339 Candidates):**
  - **Acceptance:** 94.2% (339/360)
  - **Quality Profile:** Mean confidence 0.740, mean solidity 0.934.
  - **Caution:** 65.5% (222/339) of accepted masks cover >85% of the frame due to close-up macro field photography.
  - Usable for leaf detection, but requires filtering out >90% area candidates to avoid teaching the detector trivial full-frame bounding boxes.

### Tier C: LOW USABILITY
- **Maize (51 Candidates):**
  - **Acceptance:** 14.2% (51/360) in current manifest (296 held in REVIEW_REQUIRED due to PARTIAL_OUTPUT).
  - The 51 accepted candidates have high mean area ratio (92.8%), with 45 covering >85% of frame.
  - Sample volume is currently insufficient for robust training.

### Tier D: NOT SUITABLE FOR TRAINING YET
- **Cotton (0 Candidates Accepted in Manifest):**
  - 100% held in REVIEW_REQUIRED due to the naming mismatch trigger.
  - 0 usable training annotations in current manifest.
- **Soybean (0 Candidates Accepted in Manifest):**
  - 100% held in REVIEW_REQUIRED due to the naming mismatch trigger.
  - 0 usable training annotations in current manifest.

---

## 6. Top 20 Strongest AUTO_ACCEPTED Candidates

Ranked by geometric quality score ($Score = Conf \times Solidity \times [1 - \frac{|Area - 0.45|}{0.55}]$):

| Candidate ID | Crop | Filename | Confidence | Area Ratio | Solidity | BBox Ratio | Quality Score |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **#1715** | Pigeon Pea | `original_0076.jpg` | 0.956 | 44.6% | 0.953 | 53.6% | **0.9049** |
| **#1714** | Pigeon Pea | `original_0075.jpg` | 0.953 | 44.5% | 0.953 | 53.3% | **0.9004** |
| **#1530** | Pigeon Pea | `original_0034.jpg` | 0.948 | 45.9% | 0.956 | 64.9% | **0.8920** |
| **#1524** | Pigeon Pea | `aug_0230.jpg` | 0.946 | 45.9% | 0.958 | 64.9% | **0.8911** |
| **#1780** | Pigeon Pea | `original_0063.jpg` | 0.958 | 43.4% | 0.958 | 61.7% | **0.8902** |
| **#1565** | Pigeon Pea | `original_0061.jpg` | 0.951 | 43.6% | 0.957 | 61.0% | **0.8871** |
| **#1522** | Pigeon Pea | `aug_0213.jpg` | 0.933 | 45.3% | 0.946 | 60.3% | **0.8773** |
| **#1784** | Pigeon Pea | `original_0204.jpg` | 0.952 | 47.7% | 0.959 | 66.0% | **0.8675** |
| **#1787** | Pigeon Pea | `original_0247.jpg` | 0.949 | 47.7% | 0.959 | 66.0% | **0.8648** |
| **#1506** | Pigeon Pea | `aug_0274.jpg` | 0.913 | 44.8% | 0.917 | 64.1% | **0.8339** |
| **#1632** | Pigeon Pea | `aug_0168.jpg` | 0.946 | 48.5% | 0.934 | 62.7% | **0.8280** |
| **#1574** | Pigeon Pea | `original_0089.jpg` | 0.957 | 38.5% | 0.974 | 52.2% | **0.8225** |
| **#1640** | Pigeon Pea | `aug_0222.jpg` | 0.945 | 48.6% | 0.931 | 62.4% | **0.8219** |
| **#1648** | Pigeon Pea | `original_0019.jpg` | 0.945 | 48.4% | 0.927 | 62.7% | **0.8214** |
| **#1579** | Pigeon Pea | `original_0098.jpg` | 0.916 | 41.5% | 0.953 | 48.6% | **0.8176** |
| **#1617** | Pigeon Pea | `original_0154.jpg` | 0.919 | 41.3% | 0.954 | 48.6% | **0.8176** |
| **#1655** | Pigeon Pea | `original_0073.jpg` | 0.940 | 48.6% | 0.927 | 62.7% | **0.8142** |
| **#1580** | Pigeon Pea | `original_0100.jpg` | 0.915 | 44.2% | 0.898 | 66.3% | **0.8094** |
| **#1560** | Pigeon Pea | `original_0050.jpg` | 0.922 | 43.2% | 0.905 | 62.0% | **0.8071** |
| **#1600** | Pigeon Pea | `original_0142.jpg` | 0.920 | 42.9% | 0.906 | 70.5% | **0.8009** |

---

## 7. Top 20 Most Suspicious AUTO_ACCEPTED Candidates

Candidates with lowest composite quality score (predominantly full-frame close-ups covering >96% of the image):

| Candidate ID | Crop | Filename | Confidence | Area Ratio | Solidity | BBox Ratio | Quality Score | Issue Flag |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **#1293** | Wheat | `IMG_1819.JPG` | 0.715 | 97.6% | 0.989 | 98.6% | **0.0354** | Extreme area ratio (>97%) |
| **#1022** | Maize | `original_0003.jpg` | 0.715 | 98.1% | 0.992 | 98.7% | **0.0355** | Extreme area ratio (>98%) |
| **#1318** | Wheat | `IMG_1788.JPG` | 0.716 | 97.3% | 0.991 | 98.6% | **0.0355** | Extreme area ratio (>97%) |
| **#1018** | Maize | `aug_0273.jpg` | 0.716 | 97.9% | 0.995 | 98.7% | **0.0356** | Extreme area ratio (>97%) |
| **#1029** | Maize | `aug_0027.jpg` | 0.716 | 97.9% | 0.994 | 98.5% | **0.0356** | Extreme area ratio (>97%) |
| **#1040** | Maize | `aug_0087.jpg` | 0.716 | 97.8% | 0.994 | 98.5% | **0.0356** | Extreme area ratio (>97%) |
| **#1051** | Maize | `aug_0147.jpg` | 0.716 | 97.8% | 0.994 | 98.5% | **0.0356** | Extreme area ratio (>97%) |
| **#1101** | Wheat | `BlackRust_New_0021.png` | 0.718 | 97.5% | 0.997 | 97.9% | **0.0358** | Extreme area ratio (>97%) |
| **#1085** | Wheat | `BlackRust_New_0043.png` | 0.720 | 97.7% | 1.000 | 97.9% | **0.0360** | Extreme area ratio (>97%) |
| **#1108** | Wheat | `BlackRust_New_0084.png` | 0.720 | 97.7% | 1.000 | 97.9% | **0.0360** | Extreme area ratio (>97%) |
| **#1262** | Wheat | `LeafBlight_0021.png` | 0.714 | 97.1% | 0.989 | 98.1% | **0.0367** | Extreme area ratio (>97%) |
| **#1388** | Wheat | `TanSpot_0025.png` | 0.720 | 97.1% | 1.000 | 97.2% | **0.0374** | Extreme area ratio (>97%) |
| **#1088** | Wheat | `BlackRust_New_0091.png` | 0.720 | 97.0% | 1.000 | 97.1% | **0.0398** | Extreme area ratio (>97%) |
| **#1100** | Wheat | `BlackRust_New_0016.png` | 0.720 | 97.0% | 1.000 | 97.1% | **0.0398** | Extreme area ratio (>97%) |
| **#1307** | Wheat | `IMG_8088_0.jpg` | 0.719 | 96.9% | 0.999 | 97.1% | **0.0400** | Extreme area ratio (>96%) |
| **#1090** | Wheat | `BlackRust_New_0123.png` | 0.713 | 96.6% | 0.990 | 97.9% | **0.0438** | Extreme area ratio (>96%) |
| **#1047** | Maize | `aug_0117.jpg` | 0.709 | 96.5% | 0.983 | 98.8% | **0.0449** | Extreme area ratio (>96%) |
| **#1244** | Wheat | `LeafBlight_0082.png` | 0.720 | 96.6% | 1.000 | 96.7% | **0.0449** | Extreme area ratio (>96%) |
| **#1094** | Wheat | `BlackRust_New_0033.png` | 0.709 | 96.4% | 0.976 | 98.7% | **0.0454** | Extreme area ratio (>96%) |
| **#1268** | Wheat | `IMG_1779_0.jpg` | 0.716 | 96.5% | 0.994 | 97.1% | **0.0455** | Extreme area ratio (>96%) |

---

## 8. Final Recommendation

### Recommendation: **ONLY AFTER REVIEW**

**Measured Technical Rationale:**

1. **Current Manifest Imbalance:**
   - Training a unified multi-crop leaf segmentation model right now is **unviable** because **Cotton (0)** and **Soybean (0)** have zero accepted training records in the manifest.
2. **Resolution of PARTIAL_OUTPUT Flag:**
   - The 1,016 candidates flagged as `PARTIAL_OUTPUT` (Cotton: 360, Soybean: 360, Maize: 296) were not rejected due to poor segmentation, but because their filenames on disk had a `_{stem}` suffix from the first prototype run. They must be ingested or normalized before multi-crop training can occur.
3. **Macro Crop (>85% Area) Filtering Required:**
   - Out of the 750 AUTO_ACCEPTED candidates, **270 candidates (36.0%)** cover >85% of the image frame (primarily in Wheat and Maize). Feeding these to a segmentation network will cause the model to learn trivial bounding boxes rather than detecting real leaf boundaries.
4. **Viable Immediate Path:**
   - **Pigeon Pea (360 samples)** can be used immediately as a pristine single-crop leaf segmentation training/validation set.
   - For a full 5-crop leaf segmenter, a single reconciliation pass to resolve the `PARTIAL_OUTPUT` suffix mismatch and filter area ratios to $[0.10, 0.85]$ is required before starting Phase 4 training.
