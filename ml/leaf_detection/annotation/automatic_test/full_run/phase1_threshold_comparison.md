# AgriMind-AI — Phase 1 Threshold Comparison Simulation Report
================================================================================

## Executive Notice & Verification Guarantees

> [!IMPORTANT]
> **READ-ONLY MATHEMATICAL SIMULATION STATEMENT:**
> 1. **This is a 100% READ-ONLY mathematical threshold comparison.**
> 2. **NO annotation file was modified, deleted, overwritten, or regenerated.**
> 3. **NO source image, binary mask, preview, or JSON file was copied, moved, or deleted.**
> 4. **NO production code in `backend/`, `frontend-exp/`, or `models/` was touched.**
> 5. **NO existing disease classification model was modified, retrained, or replaced.**
> 6. **NO training was started, and NO training dataset was generated.**
> 7. **Neither threshold configuration is declared optimal, and NO final threshold is recommended at this stage.**

---

## 1. Compared Configurations & Evaluation Pool

- **Evaluation Pool:** Exactly **1,552 candidates** with existing verified outputs:
  - `AUTO_ACCEPTED`: 750 candidates
  - `VALID_MAPPING`: 802 candidates
- **Configurations Compared:**
  - **CONFIG A (Baseline Simulation):**
    $$0.15 \le \text{area\_ratio} \le 0.85 \quad\land\quad \text{solidity} \ge 0.60 \quad\land\quad \text{confidence\_score} \ge 0.75$$
  - **CONFIG B (Tightened Area Upper Bound):**
    $$0.15 \le \text{area\_ratio} \le 0.80 \quad\land\quad \text{solidity} \ge 0.60 \quad\land\quad \text{confidence\_score} \ge 0.75$$

---

## 2. Global Results: Config A vs. Config B

| Metric | CONFIG A ($0.15 \le \text{area} \le 0.85$) | CONFIG B ($0.15 \le \text{area} \le 0.80$) | Net Change ($0.85 \rightarrow 0.80$) |
| :--- | :---: | :---: | :---: |
| **Total Passing Candidates** | **994** | **831** | **-163 candidates** (-16.40%) |
| **Total Failing Candidates** | **558** | **721** | **+163 candidates** (+29.21%) |
| **Global Retention Percentage** | **64.05%** | **53.54%** | **-10.51 percentage points** |

---

## 3. Crop-Wise Comparison & Retention Breakdown

| Crop | Total Evaluated | Config A Passing | Config A Retention | Config B Passing | Config B Retention | Candidates Removed | % Reduction from Config A |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | 340 | **258** | 75.88% | **249** | 73.24% | **9** | **3.49%** |
| **Soybean** | 191 | **95** | 49.74% | **89** | 46.60% | **6** | **6.32%** |
| **Maize** | 322 | **202** | 62.73% | **155** | 48.14% | **47** | **23.27%** |
| **Wheat** | 339 | **81** | 23.89% | **55** | 16.22% | **26** | **32.10%** |
| **Pigeon Pea** | 360 | **358** | 99.44% | **283** | 78.61% | **75** | **20.95%** |
| **TOTAL** | **1,552** | **994** | **64.05%** | **831** | **53.54%** | **163** | **16.40%** |

---

## 4. Source-Wise Passing Counts (`AUTO_ACCEPTED` vs. `VALID_MAPPING`)

| Source Type | Total in Pool | Config A Passing | Config A Retention | Config B Passing | Config B Retention | Candidates Removed | % Reduction from Config A |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`AUTO_ACCEPTED`** | 750 | **440** | 58.67% | **339** | 45.20% | **101** | **22.95%** |
| **`VALID_MAPPING`** | 802 | **554** | 69.08% | **492** | 61.35% | **62** | **11.19%** |
| **TOTAL** | **1,552** | **994** | **64.05%** | **831** | **53.54%** | **163** | **16.40%** |

---

## 5. Mathematical Analysis of the 163 Removed Candidates

All 163 candidates eliminated by shifting the upper bound from $0.85$ to $0.80$ have area ratios strictly located in $(0.80, 0.85]$ while satisfying $\text{solidity} \ge 0.60$ and $\text{confidence} \ge 0.75$.

### Distribution of Removed Candidates Across Crops:
| Crop | Removed Count | Area Min | Area Max | Area Mean | Relative Impact Characterization |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Cotton** | 9 | 0.8053 | 0.8465 | 0.8254 | **Negligible impact** (only 3.49% pool reduction). |
| **Soybean** | 6 | 0.8062 | 0.8464 | 0.8224 | **Minor impact** (only 6.32% pool reduction). |
| **Maize** | 47 | 0.8002 | 0.8225 | 0.8021 | **Moderate impact** (23.27% pool reduction; high density around 0.8002). |
| **Wheat** | 26 | 0.8002 | 0.8496 | 0.8252 | **High proportional impact** (32.10% pool reduction). |
| **Pigeon Pea** | 75 | 0.8002 | 0.8088 | 0.8005 | **High absolute impact** (75 removed; cluster tightly concentrated around 0.800–0.809). |
| **TOTAL** | **163** | **0.8002** | **0.8496** | **0.8098** | — |

---

## 6. Disproportionality Assessment

1. **Disproportionate Percentage Impact on Wheat:**
   - **Wheat undergoes the largest proportional reduction**, losing **32.10%** of its passing cohort (dropping from 81 to 55 candidates).
   - Because Wheat was already the smallest cohort in Config A (81), tightening to Config B further restricts the Wheat training sample pool to 55 instances.
2. **Disproportionate Absolute Impact on Pigeon Pea:**
   - **Pigeon Pea loses the largest absolute number of candidates (75)**.
   - However, because Pigeon Pea has a large passing population, it retains **283 candidates** (78.61% retention).
3. **Significant Impact on Maize:**
   - **Maize loses 47 candidates (23.27%)**, primarily due to clustered image captures with area ratio between 0.800 and 0.823.
4. **Low Impact on Cotton and Soybean:**
   - Cotton (-9, 3.49%) and Soybean (-6, 6.32%) are largely unaffected by the upper boundary shift because the vast majority of their high-quality leaf instances lie below 0.75 area ratio.

---

## 7. Status & Non-Recommendation Policy

> [!NOTE]
> - **Neither Config A nor Config B is claimed as optimal.**
> - **No final training threshold is selected or locked in at this stage.**
> - Both configurations remain purely analytical benchmarks for future dataset curation planning.

---

## 8. Safety & Repository Integrity Confirmation

All core AgriMind-AI project components remain completely intact and unmodified:
- **Backend code (`backend/`):** UNCHANGED
- **Frontend code (`frontend-exp/`):** UNCHANGED
- **Datasets (`datasets/processed/`):** UNCHANGED
- **Existing trained models (`models/*.pth`):** UNCHANGED
- **Database (`agrimind_history.db`):** UNCHANGED
- **Existing masks, JSONs, and previews:** UNCHANGED
- **Model training:** NOT STARTED
- **Dataset generation:** NOT STARTED
- **Git status:** NO COMMITS, NO PUSHES

---

## 9. Final Status

- **Report saved:** `ml/leaf_detection/annotation/automatic_test/full_run/phase1_threshold_comparison.md`
- **Action taken:** **STOPPED**. No further actions executed.
