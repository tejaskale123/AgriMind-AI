# AgriMind-AI — Phase 1 Final Curation Review Simulation Report
================================================================================

## Executive Notice & Verification Guarantees

> [!IMPORTANT]
> **READ-ONLY PRE-TRAINING CURATION REVIEW STATEMENT:**
> 1. **This is a 100% READ-ONLY pre-training curation review simulation across the 994 Config-A candidates.**
> 2. **NO training dataset was generated, and NO train/val/test splits or image directories were created.**
> 3. **NO annotation file or JSON metadata was modified, deleted, overwritten, or regenerated.**
> 4. **NO source image, binary mask, or visual preview was copied, moved, or deleted.**
> 5. **NO production code in `backend/`, `frontend-exp/`, or `models/` was touched.**
> 6. **NO existing disease classification model was modified, retrained, or replaced.**
> 7. **NO leaf-detector model training (MobileNetV3 or other) was started.**
> 8. **Review statuses are SIMULATED CURATION TIERS ONLY, NOT final ground-truth labels or permanent rejections.**
> 9. **NUMERICAL METRICS ARE NOT VERIFIED VISUAL GROUND TRUTH.**

---

## 1. Input Data & Master Population Verification

- **Master Candidate Pool:** Exactly **1,800 candidates** in `candidate_selection.csv` (Cotton: 360, Soybean: 360, Maize: 360, Wheat: 360, Pigeon Pea: 360).
- **Usable / Recoverable Outputs Pool:** Exactly **1,552 candidates** across verified outputs:
  - `AUTO_ACCEPTED`: 750 candidates
  - `VALID_MAPPING`: 802 candidates
- **Config-A Population Evaluated:** Exactly **994 candidates** ($0.15 \le \text{area} \le 0.85 \land \text{solidity} \ge 0.60 \land \text{confidence} \ge 0.75$).
- **Reference Sub-Cohorts:**
  - `HIGH_CONFIDENCE_CORE`: **539 candidates** (54.23%)
  - `STANDARD_PASS_CORE`: **455 candidates** (45.77%)
  - `AREA_RISK_REVIEW` ($0.80 < \text{area} \le 0.85$): **163 candidates** (16.40%)
  - `LOW_CONFIDENCE_CONTEXT` ($0.70 \le \text{conf} < 0.75$): **49 candidates** *(Context only; strictly outside 994 pool)*.

---

## 2. Review Status Definitions & Assignment Rules

To classify the 994 candidates into actionable curation workflows prior to dataset compilation:

### A. `CORE_CANDIDATE`
- **Rule Criteria:**
  - $\text{confidence\_score} \ge 0.85$
  - $\text{solidity} \ge 0.80$
  - $0.15 \le \text{area\_ratio} \le 0.80$
  - Verified readable JSON annotation with valid polygon ($\ge 3$ vertices, non-zero area)
  - Verified readable binary mask ($>0$ dimensions)
  - Verified readable preview overlay
- **Status in Review:** **NUMERICALLY QUALIFIED CORE — VISUAL QA STILL REQUIRED**
- **Count Assigned:** **539 candidates** (54.23% of Config-A pool).
  *(All 539 candidates naturally satisfy area $\le 0.75$, and 100% passed binary mask, preview, and JSON integrity tests with zero corruptions).*

### B. `MANUAL_REVIEW_REQUIRED`
- **Rule Criteria:**
  - **Case A (Standard-Pass Core, Area $\le 0.80$):** $0.75 \le \text{conf} < 0.85$, $\text{sol} \ge 0.60$, $0.15 \le \text{area} \le 0.80$ (**292 candidates**). Moderate confidence or non-convex profiles requiring visual confirmation.
  - **Case B (Area-Risk Review, Area $> 0.80$):** $0.80 < \text{area} \le 0.85$ (**163 candidates**). High-area candidates prone to compound background/canopy capture.
  - **Cases C, D, E, F:** Edge combinations or conflicting evidence.
- **Status in Review:** **NEEDS ADDITIONAL VISUAL / STRUCTURAL VERIFICATION BEFORE TRAINING** (Does NOT mean bad or rejected).
- **Count Assigned:** **455 candidates** (45.77% of Config-A pool).

### C. `HOLD_FOR_EXCLUSION_REVIEW`
- **Rule Criteria:** Strongly evidenced structural or output-integrity defects (missing JSON, missing mask, unreadable/corrupted files, zero-area polygons, coordinate out-of-bounds mismatches).
- **Status in Review:** **HOLD FOR FORMAL EXCLUSION**
- **Count Assigned:** **0 candidates** (0.00% of Config-A pool).
  *(All 994 Config-A candidate files were verified on disk with 100% file readability, valid polygons, and complete mask-preview-JSON pairings).*

---

## 3. Crop × Review Status Matrix

| Crop | Total Config-A | CORE_CANDIDATE | % of Crop | MANUAL_REVIEW_REQUIRED | % of Crop | HOLD_FOR_EXCLUSION | % of Crop |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | **258** | **169** | 65.50% | **89** | 34.50% | **0** | 0.00% |
| **Soybean** | **95** | **51** | 53.68% | **44** | 46.32% | **0** | 0.00% |
| **Maize** | **202** | **109** | 53.96% | **93** | 46.04% | **0** | 0.00% |
| **Wheat** | **81** | **6** | 7.41% | **75** | 92.59% | **0** | 0.00% |
| **Pigeon Pea** | **358** | **204** | 56.98% | **154** | 43.02% | **0** | 0.00% |
| **TOTAL** | **994** | **539** | **54.23%** | **455** | **45.77%** | **0** | **0.00%** |

---

## 4. Quality Cohort × Review Status Matrix

| Quality Stratum | Sub-Cohort Size | CORE_CANDIDATE | MANUAL_REVIEW_REQUIRED | HOLD_FOR_EXCLUSION | Technical Assignment Rationale |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`HIGH_CONFIDENCE_CORE`** | **539** | **539** (100.0%) | **0** (0.0%) | **0** (0.0%) | High confidence ($\ge 0.85$), high solidity ($\ge 0.80$), moderate area ($\le 0.75$), 100% verified files. |
| **`STANDARD_PASS_CORE`** | **455** | **0** (0.0%) | **455** (100.0%) | **0** (0.0%) | Moderate confidence ($0.75 - 0.85$), irregular boundary, or high area ($>0.80$). |
| — *Subset: Standard Area ($\le 0.80$)* | *292* | *0* | *292 (100.0%)* | *0* | Moderate confidence / non-convex profile; structurally sound but requires visual check. |
| — *Subset: Area Risk ($0.80 < \text{area} \le 0.85$)*| *163* | *0* | *163 (100.0%)* | *0* | High-area coverage; prone to merged cluster or background foliage capture. |
| **TOTAL** | **994** | **539** | **455** | **0** | **Exact Reconciliation: $539 + 455 + 0 = 994$** |

---

## 5. Source-Wise Review Analysis (`AUTO_ACCEPTED` vs. `VALID_MAPPING`)

| Source Origin | Total Pool | CORE_CANDIDATE | % of Source | MANUAL_REVIEW_REQUIRED | % of Source | HOLD_FOR_EXCLUSION | % of Source |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`AUTO_ACCEPTED`** | **440** | **210** | 47.73% | **230** | 52.27% | **0** | 0.00% |
| **`VALID_MAPPING`** | **554** | **329** | 59.39% | **225** | 40.61% | **0** | 0.00% |
| **TOTAL** | **994** | **539** | **54.23%** | **455** | **45.77%** | **0** | **0.00%** |

---

## 6. Crop-Specific Review Synthesis

1. **Cotton (258 candidates — 169 Core, 89 Review, 0 Hold):**
   - **Review Characteristics:** 65.50% qualify as `CORE_CANDIDATE`, the highest proportion across crops. Leaf boundaries are well isolated from field backgrounds with sharp lobed sinuses.
   - **Review Focus:** The 89 review candidates consist of 80 standard-pass candidates (mostly slightly irregular petioles or minor shading) and 9 candidates in Band 4 ($>0.80$) with peripheral ground capture.
2. **Soybean (95 candidates — 51 Core, 44 Review, 0 Hold):**
   - **Review Characteristics:** 53.68% Core. Trifoliate leaflets in the Core pool have sharp outer perimeters and high solidity (median 0.9790).
   - **Review Focus:** The 44 review candidates require manual verification of lateral leaflet boundaries and overlapping foliage in cluster shots.
3. **Maize (202 candidates — 109 Core, 93 Review, 0 Hold):**
   - **Review Characteristics:** 53.96% Core. Elongated parallel blade margins are cleanly bounded against neutral soil.
   - **Review Focus:** The 93 review candidates include 47 candidates with area $>0.80$. Visual sample evidence indicates that 90.9% of these high-area Maize samples represent valid blade close-ups spanning the canvas.
4. **Wheat (81 candidates — 6 Core, 75 Review, 0 Hold):**
   - **Review Characteristics:** Only 7.41% qualify as Core. The narrow blade geometry and macro framing in the source dataset cause blade margins to touch frame edges, automatically lowering heuristic confidence below 0.85 despite valid blade surfaces.
   - **Review Focus:** The 75 review candidates (49 standard-pass + 26 area-risk) require visual confirmation to separate valid macro blade surfaces from background awn and tiller captures.
5. **Pigeon Pea (358 candidates — 204 Core, 154 Review, 0 Hold):**
   - **Review Characteristics:** 56.98% Core (204 candidates) featuring sharp, isolated small-leaflet contours.
   - **Review Focus:** The 154 review candidates contain 75 candidates with area $>0.80$. Visual sample evidence confirms that 100% of these high-area Pigeon Pea samples represent merged multi-leaflet clusters with inter-leaf background gaps.

---

## 7. Area-Risk Review Breakdown ($0.80 < \text{area} \le 0.85$, Exactly 163 Candidates)

- **Review Classification:** **100% classified as `MANUAL_REVIEW_REQUIRED` (163 / 163)**.
- **Hold Classification:** **0 / 163**. High area alone does not constitute a structural failure.

### Sub-Band Distribution:
| Sub-Band | Area Range | Candidate Count | % of 163 | Crop Breakdown | Source Breakdown | Mean Conf | Med Conf | Mean Sol | Med Sol |
| :--- | :---: | :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **Sub-Band 1** | $0.800 < \text{area} \le 0.815$ | **132** | **80.98%** | Pigeon Pea: 75, Maize: 44, Wheat: 9, Cotton: 2, Soybean: 2 | AUTO: 84, VALID: 48 | 0.7997 | 0.8010 | 0.9981 | 1.0000 |
| **Sub-Band 2** | $0.815 < \text{area} \le 0.830$ | **14** | **8.59%** | Wheat: 4, Cotton: 4, Soybean: 3, Maize: 3 | VALID: 10, AUTO: 4 | 0.7751 | 0.7820 | 0.9746 | 0.9925 |
| **Sub-Band 3** | $0.830 < \text{area} \le 0.850$ | **17** | **10.43%** | Wheat: 13, Cotton: 3, Soybean: 1 | AUTO: 13, VALID: 4 | 0.7659 | 0.7640 | 0.9995 | 1.0000 |

---

## 8. Potential Training Pool Simulation (Simulation Only — NOT YET VERIFIED)

> [!WARNING]
> **LABEL: POTENTIAL TRAINING POOL — NOT YET VERIFIED**  
> This pool represents candidates satisfying all numerical core rules. It is NOT yet verified as training-ready ground truth.

- **Total Potential Pool Size:** **539 candidates** (54.23% of Config-A pool)
- **Crop Distribution:**
  - Pigeon Pea: **204** (37.85%)
  - Cotton: **169** (31.35%)
  - Maize: **109** (20.22%)
  - Soybean: **51** (9.46%)
  - Wheat: **6** (1.11%)
- **Source Distribution:** `VALID_MAPPING`: **329** (61.04%) | `AUTO_ACCEPTED`: **210** (38.96%)
- **Distribution Metrics:**
  - Confidence Score: Mean = **0.9190**, Median = **0.9210**, Min = 0.8500, Max = 0.9830, Std = 0.0298
  - Solidity: Mean = **0.9052**, Median = **0.9100**, Min = 0.8020, Max = 1.0000, Std = 0.0550
  - Area Ratio: Mean = **0.4443**, Median = **0.4371**, Min = 0.1516, Max = **0.7481**, Std = 0.1609
  *(Notice: Maximum area ratio in this pool is 0.7481; zero candidates exceed area 0.75).*

---

## 9. Manual Review Pool Simulation

- **Total Manual Review Pool Size:** **455 candidates** (45.77% of Config-A pool)
- **Crop Distribution:** Pigeon Pea: **154**, Maize: **93**, Cotton: **89**, Wheat: **75**, Soybean: **44**
- **Source Distribution:** `AUTO_ACCEPTED`: **230** (50.55%) | `VALID_MAPPING`: **225** (49.45%)
- **Distribution Metrics:**
  - Confidence Score: Mean = **0.8186**, Median = **0.8030**, Min = 0.7500, Max = 0.9100, Std = 0.0397
  - Solidity: Mean = **0.8879**, Median = **0.9320**, Min = 0.6070, Max = 1.0000, Std = 0.1168
  - Area Ratio: Mean = **0.6585**, Median = **0.7676**, Min = 0.1561, Max = 0.8496, Std = 0.1960

### Functional Partitioning of the 455 Review Candidates:
1. **Standard-Pass Review ($\text{area} \le 0.80$):** **292 candidates (64.18%)**  
   Candidates with moderate confidence ($0.75 - 0.85$) or non-convex profiles ($\text{solidity} < 0.80$). Structurally sound; low risk of canvas overflow.
2. **Area-Risk Review ($0.80 < \text{area} \le 0.85$):** **163 candidates (35.82%)**  
   Candidates with high canvas coverage requiring inspection for background foliage or awn mergers.
3. **Output-Integrity Review:** **0 candidates (0.00%)**  
   Zero missing files or unreadable outputs.
4. **Visual-Evidence Review:** Candidates audited in previous sample batches with flagged annotations.
   *(Exact reconciliation: $292 + 163 = 455$ candidates without double-counting).*

---

## 10. Hold Pool Simulation (`HOLD_FOR_EXCLUSION_REVIEW`)

- **Total Hold Pool Size:** **0 candidates (0.00%)**
- **Verification Findings:**
  - Missing JSON files: **0**
  - Missing binary mask files: **0**
  - Unreadable or truncated JSONs: **0**
  - Unreadable or empty masks: **0**
  - Manifest/annotation mismatches: **0**
  - Zero-area or self-intersecting polygons: **0**
  - Out-of-bounds coordinates: **0**

---

## 11. Contextual Integration with Sample-Based Visual Audits

> [!NOTE]
> **SAMPLE-BASED VISUAL EVIDENCE vs. NUMERICAL SIMULATION EVIDENCE:**
> Previous visual audits provide empirical qualitative context. Sample statistics must not be extrapolated as exact population-wide parameters.

1. **Curated Visual Audit Sample (75 Samples from 994 Pool):**
   - In the audited sample of 75 candidates, **86.67% (65/75)** were categorized as visually useful (64.0% pristine `GOOD` + 22.7% clean `ACCEPTABLE_PARTIAL`).
   - In the audited sample, **13.33% (10/75)** exhibited `BACKGROUND_CAPTURE`, concentrated primarily at high area ratios.
   - Zero samples exhibited `WHOLE_FRAME` or `WRONG_BOUNDARY`.
2. **Targeted Visual Audit Sample (50 Samples from 163 Area-Risk Pool):**
   - In the audited sample of 50 candidates, **46.00% (23/50)** were categorized as visually useful.
   - In the audited sample of 50 candidates, **54.00% (27/50)** were categorized as problematic (`BACKGROUND_CAPTURE`).
   - Across crop samples: Maize samples were **90.9% useful (10/11)**, Cotton samples were **66.7% useful (6/9)**, Wheat samples were **55.6% useful (5/9)**, Soybean samples were **33.3% useful (2/6)**, and Pigeon Pea samples were **0.0% useful (0/15)**.
   - Across sub-bands: Sub-band 3 ($0.830 - 0.850$) was **100% problematic (8/8 audited samples)**.

---

## 12. Final Simulated Curation Summary

| Simulated Status Category | Candidate Count | % of 994 Config-A Pool |
| :--- | :---: | :---: |
| **`CORE_CANDIDATE`** | **539** | **54.23%** |
| **`MANUAL_REVIEW_REQUIRED`** | **455** | **45.77%** |
| **`HOLD_FOR_EXCLUSION_REVIEW`** | **0** | **0.00%** |
| **TOTAL CONFIG-A POOL** | **994** | **100.00%** |

### Functional Operational Pools:
- **Potential Training Pool — NOT YET VERIFIED:** **539 candidates** (Area $\le 0.75$, Conf $\ge 0.85$, Sol $\ge 0.80$)
- **Manual Review Pool:** **455 candidates** (292 standard-pass + 163 area-risk)
- **Hold Pool:** **0 candidates**

---

## 13. Policy Reconciliation & Mathematical Verification

$$\text{CORE\_CANDIDATE (539)} + \text{MANUAL\_REVIEW (455)} + \text{HOLD (0)} = \mathbf{994} \quad [\text{Verified Exact}]$$
$$\text{Standard Review (292)} + \text{Area-Risk Review (163)} = \mathbf{455} \quad [\text{Verified Exact}]$$

Zero mathematical discrepancies detected across all cross-tabulations.

---

## 14. Pre-Training Interpretation Rule

> [!CAUTION]
> **PRE-TRAINING INTERPRETATION DIRECTIVE:**
> - This report is a pre-training curation simulation.
> - Visual ground-truth verification is still required before creating the final training dataset.
> - No final training threshold has been locked.
> - No policy has been declared optimal.
> - No crop or data source is declared superior.
> - No dataset generation or model training has been started.

---

## 15. Absolute Safety & System Verification (20/20 Confirmed Unchanged)

1. **Existing 1,800 Master Candidates:** UNCHANGED
2. **Existing 1,552 Usable Outputs:** UNCHANGED
3. **Existing 994 Config-A Pool:** UNCHANGED
4. **Existing JSON Files (`outputs/json/`):** UNCHANGED
5. **Existing Masks (`outputs/masks/`):** UNCHANGED
6. **Existing Previews (`outputs/previews/`):** UNCHANGED
7. **Source Datasets (`datasets/processed/`):** UNCHANGED
8. **Existing Disease Models (`models/*.pth`):** UNCHANGED
9. **Backend Codebase (`backend/`):** UNCHANGED
10. **Frontend Codebase (`frontend-exp/`):** UNCHANGED
11. **Database (`agrimind_history.db`):** UNCHANGED
12. **Authentication Functionality:** UNCHANGED
13. **Detection Functionality:** UNCHANGED
14. **Model Training:** NOT STARTED
15. **Dataset Generation:** NOT STARTED
16. **Files Deleted:** ZERO (0)
17. **Files Moved:** ZERO (0)
18. **Existing Files Overwritten:** ZERO (0)
19. **Git Commits:** ZERO (0)
20. **Git Pushes:** ZERO (0)

---

## 16. Final Status

- **Report saved:** `ml/leaf_detection/annotation/automatic_test/full_run/phase1_final_curation_review_simulation.md`
- **Simulation status:** **COMPLETE**
- **Action taken:** **STOPPED IMMEDIATELY**.
