# AgriMind-AI — Phase 1 Curated Filter Simulation Report
================================================================================

## Executive Notice & Verification Guarantees

> [!IMPORTANT]
> **READ-ONLY SIMULATION STATEMENT:**
> 1. **This is a 100% READ-ONLY numerical simulation.**
> 2. **NO annotation file was modified, deleted, overwritten, or regenerated.**
> 3. **NO source image, binary mask, or visual preview was copied, moved, or deleted.**
> 4. **NO production code in `backend/`, `frontend-exp/`, or `models/` was touched.**
> 5. **NO existing disease classification model was modified, retrained, or replaced.**
> 6. **NO training was started, and NO training dataset was created.**
> 7. **Thresholds are simulated as requested; NO final production thresholds are selected or locked in.**

---

## 1. Context & Considered Dataset Pool

- **Master Candidates Selected:** 1,800 records across 5 crops (Cotton: 360, Soybean: 360, Maize: 360, Wheat: 360, Pigeon Pea: 360).
- **Potentially Usable Candidates Evaluated:** **1,552 records**
  - **`AUTO_ACCEPTED` (750):** Directly accepted by full-run pipeline (Pigeon Pea: 360, Wheat: 339, Maize: 51).
  - **`VALID_MAPPING` (802):** Validated legacy outputs with existing masks and previews (Cotton: 340, Maize: 271, Soybean: 191).
  - *(248 remaining records from 1,800 were previously excluded: 211 missing masks from pipeline rejections, 34 bad geometry, 2 missing previews, 1 mismatch).*

### Considered Candidates by Crop and Source
| Crop | Total Considered | From `AUTO_ACCEPTED` | From `VALID_MAPPING` | % of 360 Master |
| :--- | :---: | :---: | :---: | :---: |
| **Cotton** | 340 | 0 | 340 | 94.44% |
| **Soybean** | 191 | 0 | 191 | 53.06% |
| **Maize** | 322 | 51 | 271 | 89.44% |
| **Wheat** | 339 | 339 | 0 | 94.17% |
| **Pigeon Pea** | 360 | 360 | 0 | 100.00% |
| **TOTAL** | **1,552** | **750** | **802** | **86.22%** |

---

## 2. Independent Filter Simulations

Each filter was evaluated strictly in isolation against all 1,552 candidates.

### Filter A: Area-Only Filter ($0.15 \le \text{area\_ratio} \le 0.85$)
Designed to eliminate full-frame macro close-ups (>0.85) and negligible noise fragments (<0.15).

- **Total Passing:** **1,062 / 1,552** (**68.43%**)
- **Total Failing:** **490 / 1,552** (**31.57%**)

| Crop | Total Considered | Passing Area Filter | Failing Area Filter | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| **Cotton** | 340 | 263 | 77 | 77.35% |
| **Soybean** | 191 | 114 | 77 | 59.69% |
| **Maize** | 322 | 211 | 111 | 65.53% |
| **Wheat** | 339 | 116 | 223 | 34.22% |
| **Pigeon Pea** | 360 | 358 | 2 | 99.44% |

---

### Filter B: Solidity-Only Filter ($\text{solidity} \ge 0.60$)
Designed to eliminate fragmented contours, irregular concave notches, and disease-lesion tracings.

- **Total Passing:** **1,535 / 1,552** (**98.90%**)
- **Total Failing:** **17 / 1,552** (**1.10%**)

| Crop | Total Considered | Passing Solidity Filter | Failing Solidity Filter | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| **Cotton** | 340 | 337 | 3 | 99.12% |
| **Soybean** | 191 | 191 | 0 | 100.00% |
| **Maize** | 322 | 322 | 0 | 100.00% |
| **Wheat** | 339 | 325 | 14 | 95.87% |
| **Pigeon Pea** | 360 | 360 | 0 | 100.00% |

---

### Filter C: Confidence-Only Filter ($\text{confidence\_score} \ge 0.75$)
Designed to retain only annotations meeting strong heuristic segmentation confidence.

- **Total Passing:** **1,010 / 1,552** (**65.08%**)
- **Total Failing:** **542 / 1,552** (**34.92%**)

| Crop | Total Considered | Passing Confidence Filter | Failing Confidence Filter | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| **Cotton** | 340 | 262 | 78 | 77.06% |
| **Soybean** | 191 | 96 | 95 | 50.26% |
| **Maize** | 322 | 202 | 120 | 62.73% |
| **Wheat** | 339 | 90 | 249 | 26.55% |
| **Pigeon Pea** | 360 | 360 | 0 | 100.00% |

---

## 3. Combined Filter Simulation

A candidate passes the **Combined Filter** if and only if **ALL** three criteria are met simultaneously:
$$\text{Pass Combined} \iff (0.15 \le \text{area\_ratio} \le 0.85) \land (\text{solidity} \ge 0.60) \land (\text{confidence\_score} \ge 0.75)$$

### Global Combined Results
- **Total Candidates Evaluated:** **1,552**
- **Total Passing Combined:** **994** (**64.05%**)
- **Total Failing Combined:** **558** (**35.95%**)
- **Passing from `AUTO_ACCEPTED`:** **440** (58.67% of AUTO_ACCEPTED pool)
- **Passing from `VALID_MAPPING`:** **554** (69.08% of VALID_MAPPING pool)

---

## 4. Detailed Crop-Wise Combined Filter Statistics

| Metric | Cotton | Soybean | Maize | Wheat | Pigeon Pea | Overall |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Total Candidates Considered** | 340 | 191 | 322 | 339 | 360 | **1,552** |
| **Candidates Passing All Filters** | **258** | **95** | **202** | **81** | **358** | **994** |
| — *Passing from `AUTO_ACCEPTED`* | 0 | 0 | 1 | 81 | 358 | 440 |
| — *Passing from `VALID_MAPPING`* | 258 | 95 | 201 | 0 | 0 | 554 |
| **Candidates Failing** | 82 | 96 | 120 | 258 | 2 | **558** |
| **Retention Percentage** | **75.88%** | **49.74%** | **62.73%** | **23.89%** | **99.44%** | **64.05%** |
| **Mean Confidence** (passing) | 0.8988 | 0.8660 | 0.8680 | 0.8005 | 0.8756 | 0.8732 |
| **Median Confidence** (passing) | 0.9090 | 0.8740 | 0.8755 | 0.7950 | 0.8865 | 0.8810 |
| **Mean Area Ratio** (passing) | 0.4089 | 0.6562 | 0.6277 | 0.7125 | 0.5216 | 0.5376 |
| **Median Area Ratio** (passing) | 0.3349 | 0.6917 | 0.6520 | 0.7711 | 0.4620 | 0.5367 |
| **Mean Solidity** (passing) | 0.8535 | 0.9153 | 0.9369 | 0.8879 | 0.9038 | 0.8953 |
| **Median Solidity** (passing) | 0.8535 | 0.9620 | 0.9640 | 0.8860 | 0.9275 | 0.9130 |

---

## 5. Candidate Failure Breakdown (Single vs. Multiple Conditions)

To determine which filter imposes the limiting bottleneck, failing candidates were partitioned into mutually exclusive categories:

| Failure Category | Total Candidates | Cotton | Soybean | Maize | Wheat | Pigeon Pea | Description |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Rejected by ONLY Area** | **8** | 1 | 1 | 0 | 4 | 2 | Solidity $\ge 0.60$ and Conf $\ge 0.75$, but Area outside $[0.15, 0.85]$. |
| **Rejected by ONLY Solidity** | **8** | 3 | 0 | 0 | 5 | 0 | Area and Conf passed, but boundary was erratic/fragmented ($\text{solidity} < 0.60$). |
| **Rejected by ONLY Confidence** | **51** | 2 | 19 | 9 | 21 | 0 | Area and Solidity passed, but Confidence $< 0.75$. |
| **Failing MULTIPLE Conditions** | **491** | 76 | 76 | 111 | 228 | 0 | Failed two or more criteria simultaneously (predominantly Area > 0.85 AND Conf < 0.75). |
| **TOTAL FAILING** | **558** | **82** | **96** | **120** | **258** | **2** | Sum of all failures matches total failing candidates exactly. |

### Key Architectural Insight:
**88.0% of all failures (491 / 558) violate multiple conditions simultaneously.**  
In the segmentation pipeline, an extreme area ratio ($>0.85$) intrinsically lowers confidence due to edge-contact penalties. Consequently, macro close-ups naturally fail both Area and Confidence together.

---

## 6. Source Attribution & Cross-Validation

### Retention by Annotation Origin:
- **`AUTO_ACCEPTED` Pool (750 total):**
  - **Passing Combined:** **440 (58.67%)**
  - **Failing Combined:** **310 (41.33%)**
  - *Dominant failure driver:* Wheat macro photography (258 Wheat rejections).
- **`VALID_MAPPING` Pool (802 total):**
  - **Passing Combined:** **554 (69.08%)**
  - **Failing Combined:** **248 (30.92%)**
  - *Dominant failure driver:* Soybean cluster/macro images (96 rejections) and Maize macro shots (111 rejections).

> [!NOTE]
> Candidates in `VALID_MAPPING` exhibit a higher overall retention rate (69.1%) than `AUTO_ACCEPTED` (58.7%), primarily because Cotton (all in `VALID_MAPPING`) has an exceptionally high clean retention rate (75.9%), whereas Wheat (all in `AUTO_ACCEPTED`) suffered heavily from dataset-level macro framing bias.

---

## 7. Technical Assessment of Filter Efficacy

1. **Elimination of `WHOLE_FRAME` Artifacts:**  
   The $0.15 \le \text{area\_ratio} \le 0.85$ filter successfully rejects 490 extreme macro candidates, preventing future neural models from predicting degenerate full-canvas masks.
2. **Elimination of Fragmented Lesion Contours:**  
   The $\text{solidity} \ge 0.60$ filter cleanly strips out all 14 severely fractured necrotic lesion segmentations in Wheat, while preserving 98.9% of natural leaves across other crops.
3. **Preservation of Dataset Balance:**  
   With 994 candidates passing (Cotton: 258, Pigeon Pea: 358, Maize: 202, Soybean: 95, Wheat: 81), every crop retains a usable foundation.
4. **Wheat and Soybean Bottlenecks:**  
   Wheat (81) and Soybean (95) represent the smallest passing cohorts. If balanced multi-crop training is desired in future phases, the target dataset size can safely calibrate around ~80 to 90 images per crop (~400 to 450 total balanced samples), or maintain all 994 passing samples with class-weighted loss.

---

## 8. Final Status

- **Report saved:** `ml/leaf_detection/annotation/automatic_test/full_run/phase1_filter_simulation_report.md`
- **Simulation status:** **COMPLETE**
- **Action taken:** **STOPPED**. No dataset generation, training, or code modification was performed.
