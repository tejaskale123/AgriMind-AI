# AgriMind-AI — Phase 1 Final Curation Selection Simulation Report
================================================================================

## Executive Notice & Verification Guarantees

> [!IMPORTANT]
> **READ-ONLY SELECTION SIMULATION STATEMENT:**
> 1. **This is a 100% READ-ONLY selection simulation analyzing possible final curation policies across the 994 Config-A candidates.**
> 2. **NO training dataset was created, and NO train/val/test splits or image directories were generated.**
> 3. **NO annotation file or JSON metadata was modified, deleted, overwritten, or regenerated.**
> 4. **NO source image, binary mask, or visual preview was copied, moved, or deleted.**
> 5. **NO production code in `backend/`, `frontend-exp/`, or `models/` was touched.**
> 6. **NO existing disease classification model was modified, retrained, or replaced.**
> 7. **NO segmentation model training (MobileNetV3 or other) was started.**
> 8. **NO policy is declared optimal, and NO final threshold has been locked in.**
> 9. **Numerical quality metrics are NOT equivalent to verified visual ground truth.**

---

## 1. Input Population Verification

- **Master Candidate Pool:** Exactly **1,800 candidates** in `ml/leaf_detection/candidate_selection.csv` (360 per crop).
- **Potentially Usable Candidates Evaluated:** Exactly **1,552 candidates** across all verified outputs:
  - `AUTO_ACCEPTED`: 750 candidates
  - `VALID_MAPPING`: 802 candidates
- **Analyzed Config-A Pool:** Exactly **994 candidates** satisfying:
  $$0.15 \le \text{area\_ratio} \le 0.85 \quad\land\quad \text{solidity} \ge 0.60 \quad\land\quad \text{confidence\_score} \ge 0.75$$

---

## 2. Quality Groups Definition & Quantification

| Group Identifier | Mathematical Definition | Candidate Count | % of 994 Pool | Status in Simulation |
| :--- | :--- | :---: | :---: | :--- |
| **GROUP A — `HIGH_CONFIDENCE_CORE`** | $\text{conf} \ge 0.85 \land \text{sol} \ge 0.80 \land 0.15 \le \text{area} \le 0.85$ | **539** | **54.23%** | Core high-confidence population. *(Note: 100% of these 539 candidates have area $\le 0.80$)*. |
| **GROUP B — `STANDARD_PASS_CORE`** | $\text{conf} \ge 0.75 \land \text{sol} \ge 0.60 \land 0.15 \le \text{area} \le 0.85 \land \neg(\text{GROUP A})$ | **455** | **45.77%** | Standard passing population (292 with area $\le 0.80$, 163 with area $> 0.80$). |
| **GROUP C — `AREA_RISK_REVIEW`** | $0.80 < \text{area\_ratio} \le 0.85$ (from the 994 Config-A pool) | **163** | **16.40%** | Subset of Group B requiring targeted review. Neither automatically accepted nor rejected. |
| **GROUP D — `LOW_CONFIDENCE_CONTEXT`** | $0.70 \le \text{conf} < 0.75 \land \text{sol} \ge 0.60 \land 0.15 \le \text{area} \le 0.85$ | **49** | — | **Statistical context only.** Not added to the 994 candidate pool. |

---

## 3. Simulation of Three Potential Final Curation Policies

Neither policy is declared optimal. All three are evaluated strictly as mathematical and structural options.

### Policy 1 — Conservative Policy
- **Selection Rule:** `HIGH_CONFIDENCE_CORE` (all 539) + `STANDARD_PASS_CORE` only if $\text{area\_ratio} \le 0.80$ (292 candidates).
- **Total Candidates Retained:** **831** (83.60% of Config-A pool)
- **High Confidence Count:** **539** (64.86%)
- **Standard Pass Count:** **292** (35.14%)
- **Source Counts:** `VALID_MAPPING`: **492** (59.21%) | `AUTO_ACCEPTED`: **339** (40.79%)
- **Mean Confidence:** 0.8885 (Median: 0.9000)
- **Mean Solidity:** 0.8778 (Median: 0.8840)
- **Mean Area Ratio:** 0.4904 (Median: 0.4810)

### Policy 2 — Balanced Policy
- **Selection Rule:** Full Config-A cohort ($0.15 \le \text{area} \le 0.85 \land \text{sol} \ge 0.60 \land \text{conf} \ge 0.75$).
- **Total Candidates Retained:** **994** (100.00% of Config-A pool)
- **High Confidence Count:** **539** (54.23%)
- **Standard Pass Count:** **455** (45.77%)
- **Source Counts:** `VALID_MAPPING`: **554** (55.73%) | `AUTO_ACCEPTED`: **440** (44.27%)
- **Mean Confidence:** 0.8732 (Median: 0.8810)
- **Mean Solidity:** 0.8953 (Median: 0.9130)
- **Mean Area Ratio:** 0.5376 (Median: 0.5367)

### Policy 3 — Two-Tier Review Policy
- **Selection Rule:** Partition the 994 candidates into two functional cohorts without rejecting either:
  - **Tier 1 (Core):** Top-tier candidates ($\text{conf} \ge 0.85 \land \text{sol} \ge 0.80 \land 0.15 \le \text{area} \le 0.85$).
  - **Tier 2 (Review):** Remaining Config-A candidates ($\text{conf} \ge 0.75 \land \text{sol} \ge 0.60$).
- **Tier 1 (Core) Count:** **539 candidates** (54.23%)
  - Mean Confidence: 0.9197 | Median: 0.9190
  - Mean Solidity: 0.9067 | Median: 0.9230
  - Mean Area Ratio: 0.4496 | Median: 0.4371
  - Source: `VALID_MAPPING` 329 | `AUTO_ACCEPTED` 210
  - Area $\le 0.80$: 539 (100.0%) | Area $> 0.80$: 0 (0.0%)
- **Tier 2 (Review) Count:** **455 candidates** (45.77%)
  - Mean Confidence: 0.8180 | Median: 0.8040
  - Mean Solidity: 0.8817 | Median: 0.9000
  - Mean Area Ratio: 0.6420 | Median: 0.7676
  - Source: `VALID_MAPPING` 225 | `AUTO_ACCEPTED` 230
  - Area $\le 0.80$: 292 (64.18%) | Area $> 0.80$: 163 (35.82%)

---

## 4. Comprehensive Crop-Wise Analysis Across Policies

| Crop | Policy | Total | HIGH_CONF | STANDARD_PASS | Area $\le 0.80$ | Area $> 0.80$ | Mean Conf | Med Conf | Mean Sol | Med Sol | Mean Area | Med Area |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | **Conservative** | **249** | 169 | 80 | 249 | 0 | 0.9036 | 0.9100 | 0.8493 | 0.8510 | 0.3939 | 0.3259 |
| | **Balanced** | **258** | 169 | 89 | 249 | 9 | 0.8988 | 0.9090 | 0.8535 | 0.8535 | 0.4089 | 0.3349 |
| | **Tier 1 (Core)** | **169** | 169 | 0 | 169 | 0 | 0.9228 | 0.9240 | 0.8696 | 0.8660 | 0.3664 | 0.2978 |
| | **Tier 2 (Review)** | **89** | 0 | 89 | 80 | 9 | 0.8532 | 0.8750 | 0.8230 | 0.7840 | 0.4897 | 0.3800 |
| **Soybean** | **Conservative** | **89** | 51 | 38 | 89 | 0 | 0.8712 | 0.8790 | 0.9099 | 0.9570 | 0.6450 | 0.6871 |
| | **Balanced** | **95** | 51 | 44 | 89 | 6 | 0.8660 | 0.8740 | 0.9153 | 0.9620 | 0.6562 | 0.6917 |
| | **Tier 1 (Core)** | **51** | 51 | 0 | 51 | 0 | 0.9249 | 0.9290 | 0.9767 | 0.9790 | 0.5998 | 0.6621 |
| | **Tier 2 (Review)** | **44** | 0 | 44 | 38 | 6 | 0.7978 | 0.7920 | 0.8441 | 0.8210 | 0.7215 | 0.7383 |
| **Maize** | **Conservative** | **155** | 109 | 46 | 155 | 0 | 0.8895 | 0.8970 | 0.9195 | 0.9440 | 0.5749 | 0.6207 |
| | **Balanced** | **202** | 109 | 93 | 155 | 47 | 0.8680 | 0.8755 | 0.9369 | 0.9640 | 0.6277 | 0.6520 |
| | **Tier 1 (Core)** | **109** | 109 | 0 | 109 | 0 | 0.9162 | 0.9170 | 0.9288 | 0.9440 | 0.5310 | 0.5848 |
| | **Tier 2 (Review)** | **93** | 0 | 93 | 46 | 47 | 0.8116 | 0.8010 | 0.9464 | 0.9940 | 0.7410 | 0.8002 |
| **Wheat** | **Conservative** | **55** | 6 | 49 | 55 | 0 | 0.8109 | 0.8070 | 0.8355 | 0.8170 | 0.6592 | 0.7115 |
| | **Balanced** | **81** | 6 | 75 | 55 | 26 | 0.8005 | 0.7950 | 0.8879 | 0.8860 | 0.7125 | 0.7711 |
| | **Tier 1 (Core)** | **6** | 6 | 0 | 6 | 0 | 0.8963 | 0.8870 | 0.9430 | 0.9825 | 0.4729 | 0.4770 |
| | **Tier 2 (Review)** | **75** | 0 | 75 | 49 | 26 | 0.7929 | 0.7860 | 0.8835 | 0.8800 | 0.7317 | 0.7741 |
| **Pigeon Pea** | **Conservative** | **283** | 204 | 79 | 283 | 0 | 0.8953 | 0.9020 | 0.8783 | 0.8980 | 0.4477 | 0.4112 |
| | **Balanced** | **358** | 204 | 154 | 283 | 75 | 0.8756 | 0.8865 | 0.9038 | 0.9275 | 0.5216 | 0.4620 |
| | **Tier 1 (Core)** | **204** | 204 | 0 | 204 | 0 | 0.9164 | 0.9150 | 0.9031 | 0.9135 | 0.4227 | 0.3921 |
| | **Tier 2 (Review)** | **154** | 0 | 154 | 79 | 75 | 0.8214 | 0.8020 | 0.9047 | 0.9970 | 0.6526 | 0.7997 |

---

## 5. Source-Wise Analysis Across Policies

| Source Origin | Policy | Total | HIGH_CONF | STANDARD_PASS | Area $\le 0.80$ | Area $> 0.80$ | Mean Conf | Med Conf | Mean Sol | Med Sol | Mean Area | Med Area |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`AUTO_ACCEPTED`** | **Conservative** | **339** | 210 | 129 | 339 | 0 | 0.8812 | 0.8910 | 0.8712 | 0.8840 | 0.4829 | 0.4421 |
| | **Balanced** | **440** | 210 | 230 | 339 | 101 | 0.8615 | 0.8680 | 0.9007 | 0.9270 | 0.5573 | 0.5170 |
| | **Tier 1 (Core)** | **210** | 210 | 0 | 210 | 0 | 0.9159 | 0.9150 | 0.9042 | 0.9155 | 0.4242 | 0.3921 |
| | **Tier 2 (Review)** | **230** | 0 | 230 | 129 | 101 | 0.8118 | 0.8010 | 0.8975 | 0.9950 | 0.6788 | 0.7963 |
| **`VALID_MAPPING`** | **Conservative** | **492** | 329 | 163 | 492 | 0 | 0.8936 | 0.9035 | 0.8824 | 0.8835 | 0.4956 | 0.5282 |
| | **Balanced** | **554** | 329 | 225 | 492 | 62 | 0.8822 | 0.8965 | 0.8946 | 0.9025 | 0.5305 | 0.5706 |
| | **Tier 1 (Core)** | **329** | 329 | 0 | 329 | 0 | 0.9209 | 0.9240 | 0.9058 | 0.9040 | 0.4571 | 0.4861 |
| | **Tier 2 (Review)** | **225** | 0 | 225 | 163 | 62 | 0.8256 | 0.8120 | 0.8781 | 0.8870 | 0.6377 | 0.7467 |

---

## 6. Area Band Analysis Across Policies

| Policy | Area Band | Area Range | Candidate Count | % of Policy Pool | Mean Confidence | Median Confidence | Mean Solidity | Median Solidity |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Conservative** | **Band 1** | $0.15 \le \text{area} \le 0.50$ | **436** | **52.47%** | 0.9087 | 0.9125 | 0.8566 | 0.8580 |
| | **Band 2** | $0.50 < \text{area} \le 0.70$ | **243** | **29.24%** | 0.9002 | 0.9090 | 0.8832 | 0.8930 |
| | **Band 3** | $0.70 < \text{area} \le 0.80$ | **152** | **18.29%** | 0.8121 | 0.8080 | 0.9301 | 0.9665 |
| | **Band 4** | $0.80 < \text{area} \le 0.85$ | **0** | **0.00%** | — | — | — | — |
| **Balanced** | **Band 1** | $0.15 \le \text{area} \le 0.50$ | **436** | **43.86%** | 0.9087 | 0.9125 | 0.8566 | 0.8580 |
| | **Band 2** | $0.50 < \text{area} \le 0.70$ | **243** | **24.45%** | 0.9002 | 0.9090 | 0.8832 | 0.8930 |
| | **Band 3** | $0.70 < \text{area} \le 0.80$ | **152** | **15.29%** | 0.8121 | 0.8080 | 0.9301 | 0.9665 |
| | **Band 4** | $0.80 < \text{area} \le 0.85$ | **163** | **16.40%** | 0.7940 | 0.8010 | 0.9962 | 1.0000 |
| **Tier 1 (Core)** | **Band 1** | $0.15 \le \text{area} \le 0.50$ | **327** | **60.67%** | 0.9228 | 0.9240 | 0.8918 | 0.8880 |
| | **Band 2** | $0.50 < \text{area} \le 0.70$ | **187** | **34.69%** | 0.9184 | 0.9210 | 0.9186 | 0.9200 |
| | **Band 3** | $0.70 < \text{area} \le 0.80$ | **25** | **4.64%** | 0.8726 | 0.8690 | 0.9794 | 0.9920 |
| | **Band 4** | $0.80 < \text{area} \le 0.85$ | **0** | **0.00%** | — | — | — | — |
| **Tier 2 (Review)**| **Band 1** | $0.15 \le \text{area} \le 0.50$ | **109** | **23.96%** | 0.8663 | 0.8750 | 0.7510 | 0.7590 |
| | **Band 2** | $0.50 < \text{area} \le 0.70$ | **56** | **12.31%** | 0.8392 | 0.8320 | 0.7652 | 0.7710 |
| | **Band 3** | $0.70 < \text{area} \le 0.80$ | **127** | **27.91%** | 0.8001 | 0.8030 | 0.9204 | 0.9470 |
| | **Band 4** | $0.80 < \text{area} \le 0.85$ | **163** | **35.82%** | 0.7940 | 0.8010 | 0.9962 | 1.0000 |

### Crop Distribution Inside Band 4 ($0.80 < \text{area} \le 0.85$):
- **Pigeon Pea:** 75 candidates (46.01% of Band 4, all `AUTO_ACCEPTED`)
- **Maize:** 47 candidates (28.83% of Band 4, all `VALID_MAPPING`)
- **Wheat:** 26 candidates (15.95% of Band 4, all `AUTO_ACCEPTED`)
- **Cotton:** 9 candidates (5.52% of Band 4, all `VALID_MAPPING`)
- **Soybean:** 6 candidates (3.68% of Band 4, all `VALID_MAPPING`)
- **Total:** **163 candidates (100.00%)**

---

## 7. Crop-Specific Special Case Analysis

1. **Cotton:**
   - **Numerical Pattern:** Heavily concentrated in Band 1 ($0.15 - 0.50$, 68.22%), with a low median area ratio (0.3349) and high confidence (mean 0.8988). Only 9 candidates (3.49%) fall into Band 4.
   - **Morphological Context:** Broad palmately lobed leaf structure provides high color contrast against neutral backgrounds when framed at standard viewing distances.
2. **Soybean:**
   - **Numerical Pattern:** Median area ratio is 0.6917, with 77 of 95 candidates (81.05%) concentrated in Bands 2 and 3 ($0.50 - 0.80$). Band 4 contains only 6 candidates (6.32%).
   - **Morphological Context:** Trifoliate leaflets often fill the frame in field photography, with moderate risk of overlapping lateral leaflets or background soil capture.
3. **Maize:**
   - **Numerical Pattern:** Broadly distributed across Bands 2, 3, and 4. Maize has 47 candidates (23.27%) in Band 4, but exhibits high solidity (mean 0.9369) and high confidence (mean 0.8680).
   - **Morphological Context:** Elongated linear blade geometry spans the image horizontally or vertically. In close-up macro shots, the leaf surface legitimately fills $>80\%$ of the canvas without background inclusion.
4. **Wheat:**
   - **Numerical Pattern:** Highest mean area ratio (0.7125) and median area ratio (0.7711). Only 6 of 81 candidates (7.41%) qualify for `HIGH_CONFIDENCE`, while 26 candidates (32.10%) lie in Band 4.
   - **Morphological Context:** Narrow blade geometry combined with macro framing in the source dataset causes leaf edges to touch image borders, automatically lowering heuristic confidence below 0.85 despite valid blade surfaces.
5. **Pigeon Pea:**
   - **Numerical Pattern:** Bimodal distribution. 199 candidates (55.59%) occupy Band 1 ($0.15 - 0.50$) with high confidence, while 75 candidates (20.95%) occupy Band 4 ($0.80 - 0.85$).
   - **Morphological Context:** Individual leaflets are small. When area exceeds 0.80, the segmentation mask invariably groups multiple small leaflets and inter-foliage background gaps into a single compound polygon.

---

## 8. Detailed Analysis of the 163 Area-Risk Candidates ($0.80 < \text{area} \le 0.85$)

Every one of the 163 candidates belongs to `STANDARD_PASS_CORE`. None qualify for `HIGH_CONFIDENCE_CORE`.

### Breakdown by Numerical Stratification:
- **Crop Distribution:**
  - Pigeon Pea: **75** (46.01%)
  - Maize: **47** (28.83%)
  - Wheat: **26** (15.95%)
  - Cotton: **9** (5.52%)
  - Soybean: **6** (3.68%)
- **Source Distribution:**
  - `AUTO_ACCEPTED`: **101** (61.96%)
  - `VALID_MAPPING`: **62** (38.04%)
- **Confidence Buckets:**
  - $\text{confidence} \ge 0.85$: **0 candidates (0.00%)**
  - $0.75 \le \text{confidence} < 0.85$: **163 candidates (100.00%)**
- **Solidity Buckets:**
  - $\text{solidity} \ge 0.95$: **155 candidates (95.09%)**
  - $0.80 \le \text{solidity} < 0.95$: **8 candidates (4.91%)**
  - $\text{solidity} < 0.80$: **0 candidates (0.00%)**
- **Area Ratio Sub-Bands:**
  - Sub-band A ($0.800 < \text{area} \le 0.815$): **132 candidates (80.98%)**
  - Sub-band B ($0.815 < \text{area} \le 0.830$): **14 candidates (8.59%)**
  - Sub-band C ($0.830 < \text{area} \le 0.850$): **17 candidates (10.43%)**

---

## 9. Integration with Existing Visual Audit Evidence

> [!NOTE]
> **SAMPLE-BASED VISUAL EVIDENCE vs. NUMERICAL SIMULATION EVIDENCE:**
> Sample visual observations must not be extrapolated as exact population-wide percentages. They provide supporting empirical context to the numerical figures above.

### Evidence from Previous 75-Sample Curated Visual Audit (across 994 Config-A Pool):
- **Visually Useful Rate:** **86.67% (65 / 75 samples)** (64.0% pristine `GOOD` + 22.7% clean `ACCEPTABLE_PARTIAL`).
- **Problematic Rate:** **13.33% (10 / 75 samples)**, all due to `BACKGROUND_CAPTURE` at high area ratios.
- **Structural Integrity:** **0.00% `WHOLE_FRAME`** and **0.00% `WRONG_BOUNDARY`** (confirming that statistical bounds successfully pruned degenerate masks).

### Evidence from Previous 50-Sample Targeted Visual Audit (across the 163 Area-Risk Cohort):
- **Sample Visual Useful Rate:** **46.00% (23 / 50 samples)** (6.0% `GOOD` + 40.0% `ACCEPTABLE_PARTIAL`).
- **Sample Problematic Rate:** **54.00% (27 / 50 samples)**, all `BACKGROUND_CAPTURE`.
- **Observed Asymmetry across Crops:**
  - Maize: **90.9% useful (10/11 audited samples)** — clean longitudinal blade surfaces.
  - Cotton: **66.7% useful (6/9 audited samples)** — valid lobed leaves with minor edge contact.
  - Wheat: **55.6% useful (5/9 audited samples)** — mixed blade close-ups vs. awn captures.
  - Soybean: **33.3% useful (2/6 audited samples)** — 4/6 captured surrounding background.
  - Pigeon Pea: **0.0% useful (0/15 audited samples)** — 100% merged multi-leaflet clusters.
- **Observed Area Band Gradient:**
  - Sub-band C ($0.830 - 0.850$): **100% problematic (8/8 audited samples)**.
  - Sub-bands A & B ($0.800 - 0.830$): **Mixed utility (~53% to 60% useful)**.

---

## 10. Final Simulated Policy Comparison Table

| Policy Identifier | Total Candidates | High Confidence Core | Standard Pass Core | Area $\le 0.80$ | Area $> 0.80$ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Conservative Policy** | **831** | **539 (64.86%)** | **292 (35.14%)** | **831 (100.00%)** | **0 (0.00%)** |
| **Balanced Policy** | **994** | **539 (54.23%)** | **455 (45.77%)** | **831 (83.60%)** | **163 (16.40%)** |
| **Two-Tier Policy: Tier 1 (Core)** | **539** | **539 (100.00%)** | **0 (0.00%)** | **539 (100.00%)** | **0 (0.00%)** |
| **Two-Tier Policy: Tier 2 (Review)**| **455** | **0 (0.00%)** | **455 (100.00%)** | **292 (64.18%)** | **163 (35.82%)** |

> [!IMPORTANT]
> **No policy is declared optimal.** The choice between Conservative (831), Balanced (994), or Two-Tier (539 core + 455 review) depends entirely on subsequent human-in-the-loop review capacity and desired dataset balance.

---

## 11. Training-Readiness Status

1. **Simulation Status:** This document is strictly an analytical simulation report.
2. **Threshold Status:** No threshold (0.80, 0.85, or crop-specific) has been locked into project code or configuration.
3. **Dataset Status:** No training dataset, COCO format, YOLO format, or image splits have been generated.
4. **Model Status:** No leaf segmentation model training has started; existing disease classification models remain untouched.
5. **Application Status:** Production backend, frontend, database, and inference routes remain 100% unchanged.

---

## 12. Final Safety & System Verification

The following 14 verification checks are confirmed:
1. **Existing 1,800 annotation candidates:** UNCHANGED
2. **Existing JSON files in `outputs/json/`:** UNCHANGED
3. **Existing masks in `outputs/masks/`:** UNCHANGED
4. **Existing previews in `outputs/previews/`:** UNCHANGED
5. **Source datasets in `datasets/processed/`:** UNCHANGED
6. **Existing disease models in `models/*.pth`:** UNCHANGED
7. **Backend codebase (`backend/`):** UNCHANGED
8. **Frontend codebase (`frontend-exp/`):** UNCHANGED
9. **Database (`agrimind_history.db`):** UNCHANGED
10. **Model training:** NOT STARTED
11. **Files deleted:** ZERO
12. **Files moved:** ZERO
13. **Git commit:** NONE
14. **Git push:** NONE

---

## 13. Final Status

- **Report saved:** `ml/leaf_detection/annotation/automatic_test/full_run/phase1_final_curation_selection_simulation.md`
- **Action taken:** **STOPPED IMMEDIATELY**. No further actions executed.
