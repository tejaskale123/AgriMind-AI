# AgriMind-AI — Phase 1 Final Curation Simulation Report
================================================================================

## Executive Notice & Verification Guarantees

> [!IMPORTANT]
> **READ-ONLY FINAL CURATION SIMULATION STATEMENT:**
> 1. **This is a 100% READ-ONLY statistical curation simulation over the 994 candidates passing Config A.**
> 2. **NO training dataset was created, and NO train/val/test splits or image folders were generated.**
> 3. **NO annotation file or JSON metadata was modified, deleted, overwritten, or regenerated.**
> 4. **NO source image, binary mask, or visual preview was copied, moved, or deleted.**
> 5. **NO production code in `backend/`, `frontend-exp/`, or `models/` was touched.**
> 6. **NO existing disease classification model was modified, retrained, or replaced.**
> 7. **NO segmentation model training (MobileNetV3 or other) was started.**
> 8. **Neither 0.80, 0.85, nor any crop-specific threshold is declared optimal or locked in.**
> 9. **Numerical quality metrics are NOT equivalent to verified visual ground truth.**

---

## 1. Input Population Verification

- **Total Usable Candidate Pool:** **1,552 candidates**
  - `AUTO_ACCEPTED`: 750 candidates
  - `VALID_MAPPING`: 802 candidates
- **Analyzed Population (Config-A Passing Cohort):** Exactly **994 candidates**
  $$0.15 \le \text{area\_ratio} \le 0.85 \quad\land\quad \text{solidity} \ge 0.60 \quad\land\quad \text{confidence\_score} \ge 0.75$$
- **Cohort Composition by Crop:**
  - **Pigeon Pea:** 358 candidates (36.02%)
  - **Cotton:** 258 candidates (25.96%)
  - **Maize:** 202 candidates (20.32%)
  - **Soybean:** 95 candidates (9.56%)
  - **Wheat:** 81 candidates (8.15%)
  - **Total:** **994 candidates (100.00%)**

---

## 2. Quality Bucket Definitions

To evaluate quality stratification within the existing numerical metadata:

1. **`HIGH_CONFIDENCE`:**
   $$\text{confidence\_score} \ge 0.85 \quad\land\quad \text{solidity} \ge 0.80 \quad\land\quad 0.15 \le \text{area\_ratio} \le 0.85$$
   Represents candidates with top-tier segmentation confidence, high structural convexity, and moderate area coverage.
2. **`STANDARD_PASS`:**
   $$\text{confidence\_score} \ge 0.75 \quad\land\quad \text{solidity} \ge 0.60 \quad\land\quad 0.15 \le \text{area\_ratio} \le 0.85 \quad\land\quad \neg(\text{HIGH\_CONFIDENCE})$$
   Represents candidates passing standard baseline curation criteria with moderate confidence or non-convex profiles.
3. **`LOWER_CONFIDENCE_REVIEW` (Statistical Context Only):**
   $$0.70 \le \text{confidence\_score} < 0.75 \quad\land\quad \text{solidity} \ge 0.60 \quad\land\quad 0.15 \le \text{area\_ratio} \le 0.85$$
   Candidates falling just below the $0.75$ confidence bar in the 1,552 pool. **Not included in the 994 pool.**

---

## 3. Overall Quality Bucket Distribution

| Quality Bucket | Candidate Count | % of 994 Pool | Mean Confidence | Median Confidence | Mean Solidity | Median Solidity | Mean Area Ratio |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`HIGH_CONFIDENCE`** | **539** | **54.23%** | 0.9197 | 0.9190 | 0.9067 | 0.9230 | 0.4496 |
| **`STANDARD_PASS`** | **455** | **45.77%** | 0.8180 | 0.8040 | 0.8817 | 0.9000 | 0.6420 |
| **Total Config-A Pool** | **994** | **100.00%** | **0.8732** | **0.8810** | **0.8953** | **0.9130** | **0.5376** |
| *`LOWER_CONFIDENCE_REVIEW` (Context)* | *49* | *—* | *0.7245* | *0.7230* | *0.8890* | *0.8980* | *0.6841* |

---

## 4. Area Risk Band Analysis (994 Config-A Candidates)

Partitioning the 994 cohort across four operational area coverage bands:

| Area Risk Band | Area Ratio Range | Candidate Count | % of 994 Pool | Mean Confidence | Median Confidence | Mean Solidity | Median Solidity |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Band 1** | $0.15 \le \text{area} \le 0.50$ | **436** | **43.86%** | 0.9087 | 0.9125 | 0.8566 | 0.8580 |
| **Band 2** | $0.50 < \text{area} \le 0.70$ | **243** | **24.45%** | 0.9002 | 0.9090 | 0.8832 | 0.8930 |
| **Band 3** | $0.70 < \text{area} \le 0.80$ | **152** | **15.29%** | 0.8121 | 0.8080 | 0.9301 | 0.9665 |
| **Band 4** | $0.80 < \text{area} \le 0.85$ | **163** | **16.40%** | 0.7940 | 0.8010 | 0.9962 | 1.0000 |
| **Total** | $0.15 \le \text{area} \le 0.85$ | **994** | **100.00%** | **0.8732** | **0.8810** | **0.8953** | **0.9130** |

---

## 5. Detailed Crop-Wise Quality & Band Distribution

| Metric / Attribute | Cotton | Soybean | Maize | Wheat | Pigeon Pea | Overall Pool |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Total Config-A Pool** | **258** | **95** | **202** | **81** | **358** | **994** |
| — **`HIGH_CONFIDENCE`** | **169 (65.50%)** | **51 (53.68%)** | **109 (53.96%)** | **6 (7.41%)** | **204 (56.98%)** | **539 (54.23%)** |
| — **`STANDARD_PASS`** | **89 (34.50%)** | **44 (46.32%)** | **93 (46.04%)** | **75 (92.59%)** | **154 (43.02%)** | **455 (45.77%)** |
| **Band 1 ($0.15 \le \text{area} \le 0.50$)** | 176 (68.22%) | 12 (12.63%) | 43 (21.29%) | 6 (7.41%) | 199 (55.59%) | 436 (43.86%) |
| **Band 2 ($0.50 < \text{area} \le 0.70$)** | 53 (20.54%) | 42 (44.21%) | 73 (36.14%) | 19 (23.46%) | 56 (15.64%) | 243 (24.45%) |
| **Band 3 ($0.70 < \text{area} \le 0.80$)** | 20 (7.75%) | 35 (36.84%) | 39 (19.31%) | 30 (37.04%) | 28 (7.82%) | 152 (15.29%) |
| **Band 4 ($0.80 < \text{area} \le 0.85$)** | 9 (3.49%) | 6 (6.32%) | 47 (23.27%) | 26 (32.10%) | 75 (20.95%) | 163 (16.40%) |
| **Mean Confidence** | 0.8988 | 0.8660 | 0.8680 | 0.8005 | 0.8756 | 0.8732 |
| **Median Confidence** | 0.9090 | 0.8740 | 0.8755 | 0.7950 | 0.8865 | 0.8810 |
| **Mean Solidity** | 0.8535 | 0.9153 | 0.9369 | 0.8879 | 0.9038 | 0.8953 |
| **Median Solidity** | 0.8535 | 0.9620 | 0.9640 | 0.8860 | 0.9275 | 0.9130 |
| **Mean Area Ratio** | 0.4089 | 0.6562 | 0.6277 | 0.7125 | 0.5216 | 0.5376 |
| **Median Area Ratio** | 0.3349 | 0.6917 | 0.6520 | 0.7711 | 0.4620 | 0.5367 |

---

## 6. Source-Wise Quality Analysis (`AUTO_ACCEPTED` vs. `VALID_MAPPING`)

| Source Origin | Candidate Count | % of 994 Pool | HIGH_CONFIDENCE | STANDARD_PASS | Mean Conf | Median Conf | Mean Sol | Median Sol | Mean Area | Median Area |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`AUTO_ACCEPTED`** | **440** | 44.27% | **210 (47.73%)** | 230 (52.27%) | 0.8615 | 0.8680 | 0.9007 | 0.9270 | 0.5573 | 0.5170 |
| **`VALID_MAPPING`** | **554** | 55.73% | **329 (59.39%)** | 225 (40.61%) | 0.8822 | 0.8965 | 0.8946 | 0.9025 | 0.5305 | 0.5706 |
| **Total** | **994** | 100.00% | **539 (54.23%)** | **455 (45.77%)** | **0.8732** | **0.8810** | **0.8953** | **0.9130** | **0.5376** | **0.5367** |

---

## 7. Comparative Profile: Area $\le 0.80$ vs. Area $> 0.80$

| Attribute / Metric | Cohort A: Area $\le 0.80$ (Config-B Subset) | Cohort B: Area $> 0.80$ (Removed 163 Cohort) | Numerical Differential |
| :--- | :---: | :---: | :---: |
| **Candidate Count** | **831 (83.60%)** | **163 (16.40%)** | — |
| **Mean Confidence Score** | **0.8885** | **0.7940** | **-0.0945 drop in high-area cohort** |
| **Median Confidence Score** | **0.9000** | **0.8010** | **-0.0990 drop in high-area cohort** |
| **Mean Solidity** | **0.8778** | **0.9962** | **+0.1184 increase (convex solid shape)** |
| **Median Solidity** | **0.8840** | **1.0000** | Masks become convex hulls filling canvas |
| **Mean Area Ratio** | **0.4904** | **0.8071** | +0.3167 increase |
| **Median Area Ratio** | **0.4810** | **0.8002** | Strongly clustered at 0.80 boundary |
| **Pigeon Pea Representation** | 283 (34.05%) | 75 (46.01%) | +11.96% disproportionate concentration |
| **Cotton Representation** | 249 (29.96%) | 9 (5.52%) | -24.44% concentration |
| **Maize Representation** | 155 (18.65%) | 47 (28.83%) | +10.18% concentration |
| **Soybean Representation** | 89 (10.71%) | 6 (3.68%) | -7.03% concentration |
| **Wheat Representation** | 55 (6.62%) | 26 (15.95%) | +9.33% concentration |

---

## 8. Key Numerical Observations

1. **Overall Quality Stratification:**  
   More than half of the 994 cohort (**54.23%, 539 candidates**) meets the strict `HIGH_CONFIDENCE` criteria ($\text{conf} \ge 0.85 \land \text{solidity} \ge 0.80$).
2. **Crop-Level Leaders & Laggards:**
   - **Highest `HIGH_CONFIDENCE` Proportion:** **Cotton (65.50%, 169/258)**. Cotton leaves photographed at moderate distances produce sharp sinuses and high contrast.
   - **Lowest `HIGH_CONFIDENCE` Proportion:** **Wheat (7.41%, 6/81)**. 92.59% of Wheat lies in `STANDARD_PASS` because elongated blade geometry and tight framing reduce heuristic confidence below 0.85.
3. **Dominant Area Band:**  
   **Band 1 ($0.15 \le \text{area} \le 0.50$)** is the largest single cohort, encompassing **43.86% (436 candidates)** with the highest mean confidence (0.9087) and natural solidity (0.8566).
4. **Behavior of the 163 High-Area Cohort ($0.80 < \text{area} \le 0.85$):**  
   - Represents **16.40%** of the 994 candidates.
   - Demonstrates a sharp drop in mean confidence ($0.8885 \rightarrow 0.7940$) alongside an artificial rise in median solidity to **1.0000**, confirming that masks in this zone become simple convex geometric envelopes rather than intricately tracing leaf anatomy.

---

## 9. Critical Limitations of Numerical Filtering

> [!WARNING]
> **NUMERICAL METRICS ARE NOT EQUIVALENT TO VISUAL GROUND TRUTH:**
> 1. **High Solidity Can Mask Systematic Background Capture:**  
>    A sample with $\text{solidity} = 1.000$ and $\text{confidence} = 0.801$ in Pigeon Pea frequently represents a cluster of small leaflets merging with inter-leaflet background gaps into a single convex blob.
> 2. **Moderate Confidence Does Not Equal Bad Supervision:**  
>    In Maize and Wheat, long narrow blades spanning the frame naturally receive lower confidence scores ($\sim 0.76 - 0.80$) due to frame border contacts, despite being visually pristine blade surfaces.
> 3. **Asymmetric Biological Differences:**  
>    A single global area threshold (whether 0.80 or 0.85) imposes asymmetric impacts across crop species due to natural morphology (broad lobed Cotton vs. narrow blade Maize vs. tiny leaflet Pigeon Pea).

---

## 10. Non-Decision & Policy Declaration

- **No final training threshold has been selected.**
- **Neither 0.80 nor 0.85 is declared optimal.**
- **No training dataset has been created or partitioned into train/val/test splits.**
- This report represents an empirical quality audit to inform any subsequent dataset curation design.

---

## 11. Absolute Safety & Repository Integrity Confirmation

All production code and existing project assets remain completely intact:
- **Backend codebase (`backend/`):** UNCHANGED
- **Frontend codebase (`frontend-exp/`):** UNCHANGED
- **Datasets (`datasets/processed/`):** UNCHANGED (zero images copied, moved, or deleted)
- **Existing trained models (`models/*.pth`):** UNCHANGED
- **Database (`agrimind_history.db`):** UNCHANGED
- **Authentication, disease detection, history, plant care, spray guidance, settings:** UNCHANGED
- **Existing binary masks, JSONs, and previews:** UNCHANGED
- **No files copied, deleted, moved, or renamed**
- **Model training:** NOT STARTED
- **Training dataset generation:** NOT STARTED
- **Threshold modification in code/config:** NONE
- **Git status:** NO COMMITS, NO PUSHES

---

## 12. Final Status

- **Report saved:** `ml/leaf_detection/annotation/automatic_test/full_run/phase1_final_curation_simulation.md`
- **Simulation status:** **COMPLETE**
- **Action taken:** **STOPPED IMMEDIATELY**.
