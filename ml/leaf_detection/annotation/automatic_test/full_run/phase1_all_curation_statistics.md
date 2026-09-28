# AgriMind-AI — Phase 1 Complete Curation Statistics Report
================================================================================

## Executive Notice & Verification Guarantees

> [!IMPORTANT]
> **READ-ONLY STATISTICAL ANALYSIS STATEMENT:**
> 1. **This is a 100% READ-ONLY statistical curation analysis across the 994 Config-A candidates.**
> 2. **NO training dataset was created, and NO train/val/test splits or image directories were generated.**
> 3. **NO annotation file or JSON metadata was modified, deleted, overwritten, or regenerated.**
> 4. **NO source image, binary mask, or visual preview was copied, moved, or deleted.**
> 5. **NO production code in `backend/`, `frontend-exp/`, or `models/` was touched.**
> 6. **NO existing disease classification model was modified, retrained, or replaced.**
> 7. **NO segmentation model training (MobileNetV3 or other) was started.**
> 8. **NO policy is declared optimal, and NO final threshold has been locked in.**
> 9. **NUMERICAL METRICS ARE NOT EQUIVALENT TO VERIFIED VISUAL GROUND TRUTH.**

---

## 1. Input Data & Population Verification

- **Master Candidates Manifest:** Exactly **1,800 candidates** in `candidate_selection.csv` (Cotton: 360, Soybean: 360, Maize: 360, Wheat: 360, Pigeon Pea: 360).
- **Usable/Recoverable Annotation Outputs Pool:** Exactly **1,552 candidates** across verified outputs:
  - `AUTO_ACCEPTED`: 750 candidates
  - `VALID_MAPPING`: 802 candidates
- **Config-A Population Evaluated:** Exactly **994 candidates** satisfying:
  $$0.15 \le \text{area\_ratio} \le 0.85 \quad\land\quad \text{solidity} \ge 0.60 \quad\land\quad \text{confidence\_score} \ge 0.75$$

---

## 2. Global Distribution Statistics (994 Config-A Pool)

| Metric | Sample Count | Mean | Median | Minimum | Maximum | Standard Deviation |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`confidence_score`** | 994 | **0.8732** | **0.8810** | 0.7500 | 0.9830 | 0.0549 |
| **`solidity`** | 994 | **0.8953** | **0.9130** | 0.6000 | 1.0000 | 0.0931 |
| **`area_ratio`** | 994 | **0.5376** | **0.5367** | 0.1507 | 0.8500 | 0.2132 |

### Core Cohort Verification:
- **`HIGH_CONFIDENCE_CORE`:** Exactly **539 candidates** (54.23%)
- **`STANDARD_PASS_CORE`:** Exactly **455 candidates** (45.77%)
- **`AREA_RISK_REVIEW` ($0.80 < \text{area} \le 0.85$):** Exactly **163 candidates** (16.40%)
- **`LOW_CONFIDENCE_CONTEXT` ($0.70 \le \text{conf} < 0.75$):** Exactly **49 candidates** *(Context only; strictly excluded from 994 pool)*.

---

## 3. Crop-Wise Complete Statistics

| Crop | Total | % of 994 | HIGH_CONF | STANDARD_PASS | Area $\le 0.80$ | Area $> 0.80$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | **258** | 25.96% | 169 (65.50%) | 89 (34.50%) | 249 (96.51%) | 9 (3.49%) |
| **Soybean** | **95** | 9.56% | 51 (53.68%) | 44 (46.32%) | 89 (93.68%) | 6 (6.32%) |
| **Maize** | **202** | 20.32% | 109 (53.96%) | 93 (46.04%) | 155 (76.73%) | 47 (23.27%) |
| **Wheat** | **81** | 8.15% | 6 (7.41%) | 75 (92.59%) | 55 (67.90%) | 26 (32.10%) |
| **Pigeon Pea** | **358** | 36.02% | 204 (56.98%) | 154 (43.02%) | 283 (79.05%) | 75 (20.95%) |
| **TOTAL** | **994** | 100.00% | **539 (54.23%)** | **455 (45.77%)** | **831 (83.60%)** | **163 (16.40%)** |

### Crop-Wise Metric Distributions:
| Crop | Metric | Mean | Median | Minimum | Maximum | Standard Deviation |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | Confidence | 0.8988 | 0.9090 | 0.7530 | 0.9790 | 0.0465 |
| | Solidity | 0.8535 | 0.8535 | 0.6010 | 0.9990 | 0.0934 |
| | Area Ratio | 0.4089 | 0.3349 | 0.1507 | 0.8465 | 0.1983 |
| **Soybean** | Confidence | 0.8660 | 0.8740 | 0.7510 | 0.9740 | 0.0620 |
| | Solidity | 0.9153 | 0.9620 | 0.6970 | 0.9990 | 0.0886 |
| | Area Ratio | 0.6562 | 0.6917 | 0.1614 | 0.8464 | 0.1436 |
| **Maize** | Confidence | 0.8680 | 0.8755 | 0.7500 | 0.9830 | 0.0543 |
| | Solidity | 0.9369 | 0.9640 | 0.6940 | 1.0000 | 0.0682 |
| | Area Ratio | 0.6277 | 0.6520 | 0.1633 | 0.8225 | 0.1691 |
| **Wheat** | Confidence | 0.8005 | 0.7950 | 0.7500 | 0.9110 | 0.0381 |
| | Solidity | 0.8879 | 0.8860 | 0.6060 | 1.0000 | 0.1039 |
| | Area Ratio | 0.7125 | 0.7711 | 0.1718 | 0.8496 | 0.1601 |
| **Pigeon Pea** | Confidence | 0.8756 | 0.8865 | 0.7600 | 0.9780 | 0.0494 |
| | Solidity | 0.9038 | 0.9275 | 0.6670 | 1.0000 | 0.0935 |
| | Area Ratio | 0.5216 | 0.4620 | 0.1788 | 0.8088 | 0.2084 |

---

## 4. Source-Wise Complete Statistics (`AUTO_ACCEPTED` vs. `VALID_MAPPING`)

| Source Origin | Total | % of 994 | HIGH_CONF | STANDARD_PASS | Area $\le 0.80$ | Area $> 0.80$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`AUTO_ACCEPTED`** | **440** | 44.27% | **210 (47.73%)** | 230 (52.27%) | 339 (77.05%) | 101 (22.95%) |
| **`VALID_MAPPING`** | **554** | 55.73% | **329 (59.39%)** | 225 (40.61%) | 492 (88.81%) | 62 (11.19%) |
| **TOTAL** | **994** | 100.00% | **539 (54.23%)** | **455 (45.77%)** | **831 (83.60%)** | **163 (16.40%)** |

### Source-Wise Metric Distributions:
| Source Origin | Metric | Mean | Median | Minimum | Maximum | Standard Deviation |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **`AUTO_ACCEPTED`** | Confidence | 0.8615 | 0.8680 | 0.7500 | 0.9780 | 0.0573 |
| | Solidity | 0.9007 | 0.9270 | 0.6060 | 1.0000 | 0.0963 |
| | Area Ratio | 0.5573 | 0.5170 | 0.1718 | 0.8496 | 0.2185 |
| **`VALID_MAPPING`** | Confidence | 0.8822 | 0.8965 | 0.7500 | 0.9830 | 0.0514 |
| | Solidity | 0.8946 | 0.9025 | 0.6010 | 1.0000 | 0.0905 |
| | Area Ratio | 0.5305 | 0.5706 | 0.1507 | 0.8465 | 0.2087 |

---

## 5. Area Band Analysis (994 Config-A Pool)

| Area Band | Range | Count | % of 994 | Crop Distribution | Source Distribution |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **BAND 1** | $0.15 \le \text{area} \le 0.50$ | **436** | **43.86%** | Pigeon Pea: 199, Cotton: 176, Maize: 43, Soybean: 12, Wheat: 6 | VALID_MAPPING: 231, AUTO_ACCEPTED: 205 |
| **BAND 2** | $0.50 < \text{area} \le 0.70$ | **243** | **24.45%** | Maize: 73, Pigeon Pea: 56, Cotton: 53, Soybean: 42, Wheat: 19 | VALID_MAPPING: 168, AUTO_ACCEPTED: 75 |
| **BAND 3** | $0.70 < \text{area} \le 0.80$ | **152** | **15.29%** | Maize: 39, Soybean: 35, Wheat: 30, Pigeon Pea: 28, Cotton: 20 | VALID_MAPPING: 93, AUTO_ACCEPTED: 59 |
| **BAND 4** | $0.80 < \text{area} \le 0.85$ | **163** | **16.40%** | Pigeon Pea: 75, Maize: 47, Wheat: 26, Cotton: 9, Soybean: 6 | AUTO_ACCEPTED: 101, VALID_MAPPING: 62 |

### Detailed Metric Behavior Across Area Bands:
| Area Band | Conf Mean | Conf Med | Conf Min | Conf Max | Conf Std | Sol Mean | Sol Med | Sol Min | Sol Max | Sol Std |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **BAND 1** | 0.9087 | 0.9125 | 0.7500 | 0.9780 | 0.0436 | 0.8566 | 0.8580 | 0.6010 | 0.9990 | 0.0898 |
| **BAND 2** | 0.9002 | 0.9090 | 0.7500 | 0.9830 | 0.0463 | 0.8832 | 0.8930 | 0.6060 | 0.9990 | 0.0864 |
| **BAND 3** | 0.8121 | 0.8080 | 0.7500 | 0.9630 | 0.0401 | 0.9301 | 0.9665 | 0.6370 | 1.0000 | 0.0847 |
| **BAND 4** | 0.7940 | 0.8010 | 0.7530 | 0.8040 | 0.0139 | 0.9962 | 1.0000 | 0.9240 | 1.0000 | 0.0142 |

---

## 6. Confidence Band Analysis

| Confidence Band | Range | Count | % of 994 | Crop Distribution | Source Distribution | Mean Area | Med Area | Mean Sol | Med Sol |
| :--- | :---: | :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **BAND A** | $\text{conf} \ge 0.90$ | **418** | **42.05%** | Cotton: 155, Pigeon Pea: 150, Maize: 74, Soybean: 36, Wheat: 3 | VALID_MAPPING: 265, AUTO_ACCEPTED: 153 | 0.4229 | 0.4182 | 0.9049 | 0.9125 |
| **BAND B** | $0.85 \le \text{conf} < 0.90$ | **217** | **21.83%** | Pigeon Pea: 86, Cotton: 67, Maize: 41, Soybean: 17, Wheat: 6 | VALID_MAPPING: 125, AUTO_ACCEPTED: 92 | 0.4558 | 0.4037 | 0.8427 | 0.8260 |
| **BAND C** | $0.80 \le \text{conf} < 0.85$ | **258** | **25.96%** | Pigeon Pea: 120, Maize: 75, Wheat: 25, Cotton: 20, Soybean: 18 | AUTO_ACCEPTED: 145, VALID_MAPPING: 113 | 0.7237 | 0.7984 | 0.9329 | 0.9990 |
| **BAND D** | $0.75 \le \text{conf} < 0.80$ | **101** | **10.16%** | Wheat: 47, Soybean: 24, Cotton: 16, Maize: 12, Pigeon Pea: 2 | VALID_MAPPING: 51, AUTO_ACCEPTED: 50 | 0.7591 | 0.7871 | 0.8920 | 0.8990 |

---

## 7. Solidity Band Analysis

| Solidity Band | Range | Count | % of 994 | Crop Distribution | Source Distribution | Mean Conf | Med Conf | Mean Area | Med Area |
| :--- | :---: | :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **BAND A** | $\text{sol} \ge 0.95$ | **360** | **36.22%** | Pigeon Pea: 132, Maize: 113, Soybean: 54, Wheat: 38, Cotton: 23 | VALID_MAPPING: 190, AUTO_ACCEPTED: 170 | 0.8508 | 0.8070 | 0.6945 | 0.7922 |
| **BAND B** | $0.90 \le \text{sol} < 0.95$ | **176** | **17.71%** | Pigeon Pea: 82, Cotton: 44, Maize: 38, Soybean: 10, Wheat: 2 | VALID_MAPPING: 92, AUTO_ACCEPTED: 84 | 0.9140 | 0.9360 | 0.4850 | 0.4738 |
| **BAND C** | $0.80 \le \text{sol} < 0.90$ | **298** | **29.98%** | Cotton: 133, Pigeon Pea: 92, Maize: 38, Wheat: 21, Soybean: 14 | VALID_MAPPING: 184, AUTO_ACCEPTED: 114 | 0.8857 | 0.9020 | 0.4502 | 0.4435 |
| **BAND D** | $0.60 \le \text{sol} < 0.80$ | **160** | **16.10%** | Cotton: 58, Pigeon Pea: 52, Wheat: 20, Soybean: 17, Maize: 13 | VALID_MAPPING: 88, AUTO_ACCEPTED: 72 | 0.8543 | 0.8675 | 0.4348 | 0.3866 |

---

## 8. Quality Combination Analysis

| Combination Identifier | Logical Filter Formula | Count | % of 994 | Crop Distribution | Source Distribution |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **COMBINATION A** | $\text{conf} \ge 0.85 \land \text{sol} \ge 0.80 \land \text{area} \le 0.80$ | **539** | **54.23%** | Pigeon Pea: 204, Cotton: 169, Maize: 109, Soybean: 51, Wheat: 6 | VALID_MAPPING: 329, AUTO_ACCEPTED: 210 |
| **COMBINATION B** | $\text{conf} \ge 0.85 \land \text{sol} \ge 0.80 \land \text{area} > 0.80$ | **0** | **0.00%** | *None (zero candidates exist in this bracket)* | *None* |
| **COMBINATION C** | $0.75 \le \text{conf} < 0.85 \land \text{sol} \ge 0.80 \land \text{area} \le 0.80$ | **132** | **13.28%** | Maize: 33, Wheat: 29, Pigeon Pea: 27, Cotton: 22, Soybean: 21 | VALID_MAPPING: 75, AUTO_ACCEPTED: 57 |
| **COMBINATION D** | $0.75 \le \text{conf} < 0.85 \land \text{sol} \ge 0.80 \land \text{area} > 0.80$ | **163** | **16.40%** | Pigeon Pea: 75, Maize: 47, Wheat: 26, Cotton: 9, Soybean: 6 | AUTO_ACCEPTED: 101, VALID_MAPPING: 62 |
| **COMBINATION E** | $\text{conf} \ge 0.75 \land \text{sol} < 0.80$ | **160** | **16.10%** | Cotton: 58, Pigeon Pea: 52, Wheat: 20, Soybean: 17, Maize: 13 | VALID_MAPPING: 88, AUTO_ACCEPTED: 72 |
| **COMBINATION F** | $\text{conf} < 0.80 \land \text{area} > 0.80$ | **44** | **4.43%** | Wheat: 25, Cotton: 9, Maize: 6, Soybean: 4 | AUTO_ACCEPTED: 25, VALID_MAPPING: 19 |

---

## 9. In-Depth Analysis of the 163 Area-Risk Candidates ($0.80 < \text{area} \le 0.85$)

Every one of the 163 candidates belongs to Combination D ($0.75 \le \text{conf} < 0.85 \land \text{sol} \ge 0.80 \land \text{area} > 0.80$).

### Population Profile:
- **Total Count:** **163 candidates** (16.40% of Config-A pool)
- **Crop Distribution:** Pigeon Pea: 75 (46.01%), Maize: 47 (28.83%), Wheat: 26 (15.95%), Cotton: 9 (5.52%), Soybean: 6 (3.68%)
- **Source Distribution:** `AUTO_ACCEPTED`: 101 (61.96%), `VALID_MAPPING`: 62 (38.04%)
- **Metric Summary:**
  - Confidence: Mean = **0.7940**, Median = **0.8010**, Min = 0.7530, Max = 0.8040, Std = 0.0139
  - Solidity: Mean = **0.9962**, Median = **1.0000**, Min = 0.9240, Max = 1.0000, Std = 0.0142
  - Area Ratio: Mean = **0.8071**, Median = **0.8002**, Min = 0.8002, Max = 0.8496, Std = 0.0134

### Area Sub-Band Stratification:
| Sub-Band Range | Count | % of 163 | Crop Distribution | Source Distribution | Mean Conf | Med Conf | Mean Sol | Med Sol |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **Sub-Band 1 ($0.800 < \text{area} \le 0.815$)** | **132** | **80.98%** | Pigeon Pea: 75, Maize: 44, Wheat: 9, Cotton: 2, Soybean: 2 | AUTO_ACCEPTED: 84, VALID_MAPPING: 48 | 0.7997 | 0.8010 | 0.9981 | 1.0000 |
| **Sub-Band 2 ($0.815 < \text{area} \le 0.830$)** | **14** | **8.59%** | Wheat: 4, Cotton: 4, Soybean: 3, Maize: 3 | VALID_MAPPING: 10, AUTO_ACCEPTED: 4 | 0.7751 | 0.7820 | 0.9746 | 0.9925 |
| **Sub-Band 3 ($0.830 < \text{area} \le 0.850$)** | **17** | **10.43%** | Wheat: 13, Cotton: 3, Soybean: 1 | AUTO_ACCEPTED: 13, VALID_MAPPING: 4 | 0.7659 | 0.7640 | 0.9995 | 1.0000 |

---

## 10. Crop × Area Distribution Matrix

| Crop | Band 1 ($0.15 - 0.50$) | Band 2 ($0.50 - 0.70$) | Band 3 ($0.70 - 0.80$) | Band 4 ($0.80 - 0.85$) | Total Crop Pool |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | 176 (68.22%) | 53 (20.54%) | 20 (7.75%) | 9 (3.49%) | **258 (100.0%)** |
| **Soybean** | 12 (12.63%) | 42 (44.21%) | 35 (36.84%) | 6 (6.32%) | **95 (100.0%)** |
| **Maize** | 43 (21.29%) | 73 (36.14%) | 39 (19.31%) | 47 (23.27%) | **202 (100.0%)** |
| **Wheat** | 6 (7.41%) | 19 (23.46%) | 30 (37.04%) | 26 (32.10%) | **81 (100.0%)** |
| **Pigeon Pea** | 199 (55.59%) | 56 (15.64%) | 28 (7.82%) | 75 (20.95%) | **358 (100.0%)** |

---

## 11. Crop × Confidence Distribution Matrix

| Crop | Band A ($\ge 0.90$) | Band B ($0.85 - 0.90$) | Band C ($0.80 - 0.85$) | Band D ($0.75 - 0.80$) | Total Crop Pool |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | 155 | 67 | 20 | 16 | **258** |
| **Soybean** | 36 | 17 | 18 | 24 | **95** |
| **Maize** | 74 | 41 | 75 | 12 | **202** |
| **Wheat** | 3 | 6 | 25 | 47 | **81** |
| **Pigeon Pea** | 150 | 86 | 120 | 2 | **358** |
| **TOTAL** | **418** | **217** | **258** | **101** | **994** |

---

## 12. Crop × Solidity Distribution Matrix

| Crop | Band A ($\ge 0.95$) | Band B ($0.90 - 0.95$) | Band C ($0.80 - 0.90$) | Band D ($0.60 - 0.80$) | Total Crop Pool |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | 23 | 44 | 133 | 58 | **258** |
| **Soybean** | 54 | 10 | 14 | 17 | **95** |
| **Maize** | 113 | 38 | 38 | 13 | **202** |
| **Wheat** | 38 | 2 | 21 | 20 | **81** |
| **Pigeon Pea** | 132 | 82 | 92 | 52 | **358** |
| **TOTAL** | **360** | **176** | **298** | **160** | **994** |

---

## 13. Policy Reconciliation & Mathematical Verification

- **Conservative Policy Pool:** **831 candidates**
- **Balanced Policy Pool:** **994 candidates**
- **Two-Tier Policy: Tier 1 (Core):** **539 candidates**
- **Two-Tier Policy: Tier 2 (Review):** **455 candidates**

### Exact Identity Proofs:
$$\text{Conservative (831)} + \text{Area Risk Review (163)} = \mathbf{994} = \text{Balanced (994)} \quad [\text{Verified: } 831 + 163 = 994]$$
$$\text{Two-Tier Core (539)} + \text{Two-Tier Review (455)} = \mathbf{994} = \text{Balanced (994)} \quad [\text{Verified: } 539 + 455 = 994]$$

Zero mathematical discrepancies detected across all cross-tabulations.

---

## 14. Contextual Integration with Sample-Based Visual Audits

> [!WARNING]
> **SAMPLE-BASED VISUAL EVIDENCE vs. NUMERICAL SIMULATION EVIDENCE:**
> Numerical metrics are not verified visual ground truth. Sample visual percentages must not be directly extrapolated as exact population-wide parameters.

1. **Curated Visual Audit Evidence (75 Samples across 994 Pool):**
   - Visually useful masks: **86.67% (65 / 75 samples)** (64.0% pristine `GOOD` + 22.7% clean `ACCEPTABLE_PARTIAL`).
   - Problematic masks: **13.33% (10 / 75 samples)**, all due to `BACKGROUND_CAPTURE` at high area ratios.
   - Zero degenerate `WHOLE_FRAME` or `WRONG_BOUNDARY` masks.
2. **Targeted Visual Audit Evidence (50 Samples across 163 Area-Risk Pool):**
   - Visually useful masks: **46.00% (23 / 50 samples)** (6.0% `GOOD` + 40.0% `ACCEPTABLE_PARTIAL`).
   - Problematic masks: **54.00% (27 / 50 samples)**, all `BACKGROUND_CAPTURE`.
   - Biological divergence: Maize was **90.9% useful** (longitudinal blade surfaces), whereas Pigeon Pea was **100% problematic** (multi-leaflet cluster mergers).
   - Sub-band gradient: Sub-band 3 ($0.830 - 0.850$) was **100% problematic** (8/8 audited samples).

---

## 15. Final Curation Statistics Master Summary

| Curation Dimension / Cohort | Candidate Count | Percentage / Reconciliation |
| :--- | :---: | :---: |
| **Master Candidate Pool** | **1,800** | 100.00% of candidate selection |
| **Usable / Recoverable Outputs Pool** | **1,552** | 86.22% of master selection |
| **Config-A Population Evaluated** | **994** | 64.05% of usable outputs |
| — **`HIGH_CONFIDENCE_CORE`** | **539** | 54.23% of Config-A pool |
| — **`STANDARD_PASS_CORE`** | **455** | 45.77% of Config-A pool |
| — **`AREA_RISK_REVIEW` ($0.80 < \text{area} \le 0.85$)** | **163** | 16.40% of Config-A pool |
| — *`LOW_CONFIDENCE_CONTEXT` ($0.70 \le \text{conf} < 0.75$)* | *49* | *Context only (outside 994 pool)* |
| **Conservative Policy** | **831** | $831 + 163 = 994$ |
| **Balanced Policy** | **994** | Full Config-A cohort |
| **Two-Tier Policy: Tier 1 (Core)** | **539** | $539 + 455 = 994$ |
| **Two-Tier Policy: Tier 2 (Review)** | **455** | $539 + 455 = 994$ |

---

## 16. Important Interpretation Rule

- **No policy is declared optimal.**
- **No final training threshold has been selected or locked.**
- **No crop is declared "best" or "worst".**
- **Neither data source is declared superior.**
- **No training dataset has been generated, and no model training has started.**

---

## 17. Absolute Safety & System Verification (16/16 Confirmed)

1. **Existing 1,800 Candidates:** UNCHANGED
2. **Existing JSON Files (`outputs/json/`):** UNCHANGED
3. **Existing Masks (`outputs/masks/`):** UNCHANGED
4. **Existing Previews (`outputs/previews/`):** UNCHANGED
5. **Source Datasets (`datasets/processed/`):** UNCHANGED
6. **Existing Disease Models (`models/*.pth`):** UNCHANGED
7. **Backend Codebase (`backend/`):** UNCHANGED
8. **Frontend Codebase (`frontend-exp/`):** UNCHANGED
9. **Database (`agrimind_history.db`):** UNCHANGED
10. **Authentication Functionality:** UNCHANGED
11. **Detection Functionality:** UNCHANGED
12. **Model Training:** NOT STARTED
13. **Files Deleted:** ZERO (0)
14. **Files Moved:** ZERO (0)
15. **Git Commits:** ZERO (0)
16. **Git Pushes:** ZERO (0)

---

## 18. Final Status

- **Report saved:** `ml/leaf_detection/annotation/automatic_test/full_run/phase1_all_curation_statistics.md`
- **Analysis status:** **COMPLETE**
- **Action taken:** **STOPPED IMMEDIATELY**.
