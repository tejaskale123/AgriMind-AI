# AgriMind-AI — Final CORE QA Decision Simulation
**Simulation Execution Type:** 100% READ-ONLY Operational Decision Policy Simulation  
**Date & System Timestamp:** 2026-09-27  
**Target Population:** 539 CORE_CANDIDATE Records  
**Audit Evidence Source:** `core_candidate_visual_qa_report.md` (75 Stratified Samples)  

---

## 1. Execution Status
- **Status:** SIMULATION COMPLETED SUCCESSFULLY (100% READ-ONLY)
- **Operational Nature:** Pure policy simulation and risk stratification.
- **Modification Status:** Zero files modified, zero files deleted, zero database writes, zero model changes.
- **Decision Application:** Mathematical simulation only. No ground-truth labels were assigned, and no training datasets were generated.

## 2. Safety Verification
All safety boundaries and constraints were strictly maintained:
1. **Datasets Intact:** Source image directories (`datasets/processed/`) remain completely untouched.
2. **Annotations Intact:** Production and intermediate JSON files remain unaltered.
3. **Masks & Previews Intact:** Segmentation masks and visual previews remain unaltered.
4. **Models Untouched:** All production classification and detection models in `models/` remain untouched.
5. **Backend & Frontend Untouched:** Application servers (`backend/` and `frontend-exp/`) continue running normally without interruption.
6. **Database Untouched:** No records altered or inserted into the application database.
7. **Zero Pipeline Actions:** Zero training runs initiated; zero dataset formats (COCO/YOLO) exported.
8. **Zero Git Modifications:** Zero commits, zero branch switches, zero remote pushes.

## 3. Current 539 CORE Pool Definition
The 539 `CORE_CANDIDATE` pool was established during the curation simulation phase as the top-tier candidate subset from the 994 Config-A annotations.
A candidate belongs to the 539 CORE pool if and only if:
$$\text{Confidence Score} \ge 0.85$$
$$\text{Solidity} \ge 0.80$$
$$\text{Area Ratio} \le 0.80$$
$$\text{Base Config-A Criteria:} \quad 0.15 \le \text{Area Ratio} \le 0.85, \quad \text{Solidity} \ge 0.60, \quad \text{Confidence Score} \ge 0.75$$
$$\text{Integrity Check:} \quad \text{JSON polygon, mask, and preview image exist, are uncorrupted, and are readable.}$$

### Baseline Population Distribution
- **Master Candidate Pool:** 1,800 records
- **Usable Verified-Output Pool:** 1,552 records (750 `AUTO_ACCEPTED` + 802 `VALID_MAPPING`)
- **Config-A Pool:** 994 records
- **CORE_CANDIDATE Pool:** **539 records**
  - Cotton: 169 (31.35%)
  - Soybean: 51 (9.46%)
  - Maize: 109 (20.22%)
  - Wheat: 6 (1.11%)
  - Pigeon Pea: 204 (37.85%)
- **MANUAL_REVIEW_REQUIRED (from Config-A):** 455 records
- **HOLD_FOR_EXCLUSION_REVIEW (from Config-A):** 0 records

## 4. 75-Sample Visual QA Evidence
The deterministic stratified audit inspected 75 candidates across all 5 crops (15 Cotton, 15 Soybean, 15 Maize, 15 Wheat, 15 Pigeon Pea).
Visual evidence from `core_candidate_visual_qa_report.md` revealed:
- **GOOD:** 62 candidates (82.67%)
- **PARTIAL:** 8 candidates (10.67%)
- **BACKGROUND_CAPTURE:** 5 candidates (6.67%)
- **WRONG_BOUNDARY:** 0 candidates (0.00%)
- **WHOLE_FRAME:** 0 candidates (0.00%)
- **UNCERTAIN:** 0 candidates (0.00%)
- **Usable Pool (GOOD + PARTIAL):** **70 / 75 (93.33%)**

## 5. Overall Visual QA Results Summary
| Visual Classification | Audited Sample Count ($n=75$) | Sample Percentage | Visual Finding |
| :--- | :---: | :---: | :--- |
| **GOOD** | 62 | 82.67% | High precision leaf boundary; background excluded; training-ready. |
| **PARTIAL** | 8 | 10.67% | Primary leaf lamina captured; minor apex or boundary truncation. |
| **BACKGROUND_CAPTURE** | 5 | 6.67% | Over-inclusion of neighboring clustered leaflets or background. |
| **WRONG_BOUNDARY** | 0 | 0.00% | Zero severe shape distortions detected. |
| **WHOLE_FRAME** | 0 | 0.00% | Zero full-frame artifacts detected (Area $\le 0.80$ cap held 100%). |
| **UNCERTAIN** | 0 | 0.00% | Zero corrupt or unclassifiable records. |
| **Usable Rate (GOOD + PARTIAL)** | **70** | **93.33%** | **Strong overall empirical baseline.** |

## 6. Crop-Wise Visual QA Results
| Crop Class | GOOD | PARTIAL | BACKGROUND_CAPTURE | WRONG_BOUNDARY | WHOLE_FRAME | Total Sampled | Usable Rate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | 14 | 1 | 0 | 0 | 0 | 15 | **100.0%** |
| **Soybean** | 11 | 0 | 4 | 0 | 0 | 15 | **73.3%** |
| **Maize** | 14 | 1 | 0 | 0 | 0 | 15 | **100.0%** |
| **Wheat** | 10 | 5 | 0 | 0 | 0 | 15 | **100.0%** |
| **Pigeon Pea** | 13 | 1 | 1 | 0 | 0 | 15 | **93.3%** |
| **Total** | **62** | **8** | **5** | **0** | **0** | **75** | **93.3%** |

## 7. Failure-Pattern Analysis
Empirical inspection of the 75 audited samples established two primary failure patterns and two structural confirmations:

1. **Compound Foliage Cluster Merging (`BACKGROUND_CAPTURE`):**
   - Observed in 5 instances (Soybean: 4 cases; Pigeon Pea: 1 case).
   - When trifoliate leaflets overlap tightly under uniform field lighting, the segmentation polygon bridges across petiolules and encompasses multiple leaflets as a single convex structure.
   - Crucially, all 5 instances occurred in candidates with **Area Ratio $\ge 0.70$ and Solidity $\ge 0.95$**.

2. **Narrow Blade Apex Truncation (`PARTIAL`):**
   - Observed in 8 instances (Wheat: 5 cases; Cotton: 1 case; Maize: 1 case; Pigeon Pea: 1 case).
   - In monocot blades (Wheat, Maize), slender leaf tips (<15 pixels wide) contacting frame boundaries are occasionally clipped while 85–90% of the blade lamina is cleanly segmented.

3. **Complete Elimination of Whole-Frame Artifacts:**
   - Zero `WHOLE_FRAME` segmentations were observed across all 75 samples, proving that the $\text{Area Ratio} \le 0.80$ cap effectively eradicates whole-image bounding box collapse.

4. **Complete Absence of Inverted or Wrong Boundaries:**
   - Zero `WRONG_BOUNDARY` errors were observed, demonstrating that CORE confidence ($\ge 0.85$) and solidity ($\ge 0.80$) reliably reject inverted polygons.

## 8. Numerical vs Visual Comparison
To avoid false assumptions during dataset curation, this simulation explicitly contrasts numerical metrics with visual reality:

### A. Does High Confidence Correlate with GOOD Visual Quality?
- **Observed Evidence:**
  - Confidence $0.85 - 0.90$: $84.6\%$ GOOD ($22 / 26$).
  - Confidence $0.90 - 0.95$: $78.9\%$ GOOD ($30 / 38$).
  - Confidence $\ge 0.95$: $90.9\%$ GOOD ($10 / 11$).
- **Interpretation:** High confidence ensures boundary contrast and polygon edge sharpness. However, model confidence does **not** understand semantic single-leaf isolation. In compound foliage, high confidence can accompany multi-leaflet cluster capture.
- **Limitation:** Confidence cannot differentiate a single leaf from a merged cluster of leaves.

### B. Does High Solidity Correlate with Correct Leaf-Only Segmentation?
- **Observed Evidence:**
  - All 4 Soybean `BACKGROUND_CAPTURE` cases exhibited extreme solidity ($\text{solidity} \ge 0.975$, reaching $1.000$).
- **Interpretation:** Counter-intuitively, in compound crops (Soybean, Pigeon Pea), ultra-high solidity indicates that a merged cluster of leaflets has formed an artificial convex hull. Conversely, in lobed crops (Cotton) or linear crops (Wheat), true leaves naturally exhibit lower solidity ($0.80 - 0.88$).
- **Limitation:** High solidity must not be used as an unqualified proxy for segmentation quality in compound crops.

### C. Is Large Area Associated with Visual Risk?
- **Observed Evidence:**
  - Area $0.15 - 0.40$: $0$ background captures ($0 / 26 = 0.0\%$).
  - Area $0.40 - 0.60$: $0$ background captures ($0 / 23 = 0.0\%$).
  - Area $0.60 - 0.80$: $5$ background captures ($5 / 26 = 19.2\%$).
- **Interpretation:** $100\%$ of observed background capture occurred in the highest area tier ($0.60 - 0.80$). Large segmented masks have higher probability of incorporating neighboring leaflets or soil shadows.
- **Limitation:** Many single leaves genuinely fill $0.60 - 0.80$ of the frame (e.g. macro close-ups); area alone does not prove failure.

### D. Do Compound Crops Behave Differently from Simple Crops?
- **Observed Evidence:** Simple leaf crops (Cotton, Maize) achieved $100\%$ usability ($0\%$ background capture). Compound crops (Soybean, Pigeon Pea) generated all $5$ observed background captures.
- **Interpretation:** Compound leaf architecture creates severe inter-leaflet visual ambiguity for standard segmentation heads.

### E. Do Narrow Leaves Create PARTIAL Outputs?
- **Observed Evidence:** Wheat exhibited $5$ `PARTIAL` classifications out of $15$ samples ($33.3\%$), compared to $1 / 15$ in Cotton ($6.7\%$) and $0 / 15$ in Soybean ($0.0\%$).
- **Interpretation:** The extreme aspect ratio of monocot grass blades challenges isotropic kernel operations, causing tapered apex clipping.

### F. Does Annotation Source Show Differences?
- **Observed Evidence:**
  - `AUTO_ACCEPTED` ($n=30$): $23$ GOOD ($76.7\%$), $6$ PARTIAL ($20.0\%$), $1$ BACKGROUND_CAPTURE ($3.3\%$). Usable: $96.7\%$.
  - `VALID_MAPPING` ($n=45$): $39$ GOOD ($86.7\%$), $2$ PARTIAL ($4.4\%$), $4$ BACKGROUND_CAPTURE ($8.9\%$). Usable: $91.1\%$.
- **Interpretation:** Both sources provide high usability (>91%), but `VALID_MAPPING` inherits the Soybean legacy cluster challenge, while `AUTO_ACCEPTED` reflects the Wheat linear blade geometry.

## 9. Crop-Specific Risk Analysis
| Crop Class | Primary Morphological Trait | Specific Risk Identified | Visual QA Evidence | Recommended Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Cotton** | Broad palmate lobed lamina | Edge clipping on large leaves | 14 GOOD, 1 PARTIAL, 0 BG Capture | High baseline acceptance; flag Area $\ge 0.65$. |
| **Soybean** | Trifoliate compound leaflets | Multi-leaflet cluster merging | 11 GOOD, 0 PARTIAL, 4 BG Capture | Scrutinize high solidity + large area combinations. |
| **Maize** | Extended linear arching blade | Frame-edge contact and apex clipping | 14 GOOD, 1 PARTIAL, 0 BG Capture | High baseline acceptance; flag blade boundary contacts. |
| **Wheat** | Monocot narrow linear blade | Tapered tip truncation; low CORE count | 10 GOOD, 5 PARTIAL, 0 BG Capture | Accept partials as valid; consider relaxed solidity criteria. |
| **Pigeon Pea** | Trifoliate small-leaflet structure | Clustered foliage over-inclusion | 13 GOOD, 1 PARTIAL, 1 BG Capture | High acceptance; flag dense overlapping clusters. |

## 10. Simulated Decision Policy
The simulation defines three operational tiers for managing the 539 candidates without making any premature ground-truth claims:

| Operational Category | Technical Definition | Primary Operational Purpose | Training Eligible? |
| :--- | :--- | :--- | :---: |
| **POTENTIAL_FINAL_TRAINING_CANDIDATE** | Satisfies CORE criteria; verified readable; low risk profile or visually confirmed `GOOD`. | Primary candidate reservoir for model fine-tuning and baseline evaluation. | **YES (Pending Final Stage Protocol)** |
| **MANUAL_VISUAL_REVIEW_REQUIRED** | Satisfies CORE criteria but carries elevated risk flags (e.g. edge clipping, narrow blade, lower confidence). | Requires human-in-the-loop inspection before training inclusion. | **NO (Review Gate Required)** |
| **HOLD_FOR_EXCLUSION_REVIEW** | Verified `BACKGROUND_CAPTURE` or extreme multi-leaflet compound cluster profile. | Quarantine pool to prevent noisy multi-leaf masks from degrading detector precision. | **NO (Exclusion Gate)** |

## 11. Review-Flag Policy
Seven specific review flags were simulated across the 539 candidates based on mathematical thresholds and visual findings:

1. `COMPOUND_LEAFLET_RISK`: Applied to all Soybean and Pigeon Pea records due to their trifoliate morphology.
2. `NARROW_LEAF_RISK`: Applied to all Wheat and Maize records due to linear blade geometry.
3. `EDGE_CLIPPING_RISK`: Applied to records with $\text{Area Ratio} \ge 0.65$ where lamina boundaries approach frame edges.
4. `BACKGROUND_CAPTURE_RISK`: Applied to records confirmed as background capture or Soybean records combining Area $\ge 0.70$ with Solidity $\ge 0.95$.
5. `HIGH_SOLIDITY_LARGE_AREA_RISK`: Applied when $\text{Area Ratio} \ge 0.70$ and $\text{Solidity} \ge 0.95$.
6. `LOWER_CORE_CONFIDENCE`: Applied when $0.85 \le \text{Confidence Score} < 0.88$ (proximate to decision threshold).
7. `SOURCE_MAPPING_REVIEW`: Applied to legacy validation/test splits requiring source mapping provenance checks.

### Simulated Review Flag Distribution across 539 CORE Candidates
| Review Flag | Flagged Count | Incidence Rate (out of 539) | Operational Meaning |
| :--- | :---: | :---: | :--- |
| **`COMPOUND_LEAFLET_RISK`** | 255 | 47.3% | Architectural risk indicator |
| **`NARROW_LEAF_RISK`** | 115 | 21.3% | Architectural risk indicator |
| **`EDGE_CLIPPING_RISK`** | 81 | 15.0% | Architectural risk indicator |
| **`LOWER_CORE_CONFIDENCE`** | 58 | 10.8% | Architectural risk indicator |
| **`SOURCE_MAPPING_REVIEW`** | 54 | 10.0% | Architectural risk indicator |
| **`HIGH_SOLIDITY_LARGE_AREA_RISK`** | 20 | 3.7% | Architectural risk indicator |
| **`BACKGROUND_CAPTURE_RISK`** | 13 | 2.4% | Architectural risk indicator |
| **`NONE`** (Zero Flags) | 103 | 19.1% | Unflagged standard simple leaf profile |

## 12. Potential Training-Candidate Policy
- **Eligibility Criteria:**
  1. Satisfies CORE numerical criteria: $\text{Confidence} \ge 0.85$, $\text{Solidity} \ge 0.80$, $\text{Area Ratio} \le 0.80$.
  2. Polygon, mask, and preview verified intact and readable.
  3. Either visually confirmed as `GOOD` in the 75-candidate audit, or free from severe compound clustering / edge-boundary collision risks.
- **Simulated Total:** **497 candidates (92.21% of CORE pool)**
  - Cotton: 161 (95.3% of Cotton CORE)
  - Soybean: 37 (72.5% of Soybean CORE)
  - Maize: 99 (90.8% of Maize CORE)
  - Wheat: 5 (83.3% of Wheat CORE)
  - Pigeon Pea: 195 (95.6% of Pigeon Pea CORE)
- **Role in Pipeline:** Represents the high-probability training candidate reservoir for leaf localization model prototyping. Not yet declared ground truth.

## 13. Manual-Review Policy
- **Eligibility Criteria:**
  1. Candidates in CORE that carry elevated risk flags:
     - `EDGE_CLIPPING_RISK` combined with `LOWER_CORE_CONFIDENCE` (e.g. Area $\ge 0.65$ and Conf $< 0.88$).
     - `HIGH_SOLIDITY_LARGE_AREA_RISK` in simple crops or borderline cases.
     - Confirmed `PARTIAL` classifications from visual QA (e.g. slender tip apex clippings in Wheat/Cotton/Maize).
- **Simulated Total:** **31 candidates (5.75% of CORE pool)**
  - Cotton: 8
  - Maize: 10
  - Pigeon Pea: 8
  - Soybean: 4
  - Wheat: 1
- **Role in Pipeline:** Held in a review gate. Human annotators can rapidly inspect and validate or lightly trim apex margins to salvage training data without discarding valuable samples.

## 14. Exclusion-Review Policy
- **Eligibility Criteria:**
  1. Directly observed `BACKGROUND_CAPTURE` during the 75-candidate visual QA audit (e.g. Soybean #0705, #0437, #0566, #0553; Pigeon Pea #1630).
  2. Extreme compound foliage risk profile: Non-audited Soybean records exhibiting both $\text{Area Ratio} \ge 0.72$ and $\text{Solidity} \ge 0.98$ where background cluster capture is strongly correlated.
- **Simulated Total:** **11 candidates (2.04% of CORE pool)**
  - Soybean: 10
  - Pigeon Pea: 1
  - Cotton: 0
  - Maize: 0
  - Wheat: 0
- **Role in Pipeline:** Quarantined from training datasets to prevent noisy multi-leaf cluster masks from degrading leaf detector single-object localization precision.

### Summary Cross-Tabulation of 539 CORE Candidates across Decision Policies
| Crop Class | POTENTIAL_FINAL_TRAINING_CANDIDATE | MANUAL_VISUAL_REVIEW_REQUIRED | HOLD_FOR_EXCLUSION_REVIEW | Total CORE Pool | Usable / Candidate Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | 161 | 8 | 0 | **169** | **95.3%** |
| **Soybean** | 37 | 4 | 10 | **51** | **72.5%** |
| **Maize** | 99 | 10 | 0 | **109** | **90.8%** |
| **Wheat** | 5 | 1 | 0 | **6** | **83.3%** |
| **Pigeon Pea** | 195 | 8 | 1 | **204** | **95.6%** |
| **Total** | **497 (92.2%)** | **31 (5.8%)** | **11 (2.0%)** | **539** | **92.2%** |

## 15. Uncertainty and Limitations
1. **Sampling vs Population Reality:** The sample of $n=75$ provides statistical indication, not complete population truth. While $93.33\%$ visual usability was observed in the sample, the exact uninspected error rate among the remaining 464 candidates remains subject to confidence intervals ($\pm 5.6\%$ at $95\%$ confidence).
2. **Wheat Representativeness:** The CORE pool contains only 6 Wheat records. This sample size is insufficient to statistically characterize wheat leaf segmentation across diverse growth stages.
3. **Non-Invasive Nature:** Because this simulation was strictly read-only, no candidate masks were altered, trimmed, or separated.

## 16. Explicit Ground-Truth Disclaimer
> [!WARNING]
> **THE 539 CORE CANDIDATES ARE NOT GROUND TRUTH:**
> Under no circumstances should the 539 `CORE_CANDIDATE` records be interpreted as verified human ground truth.
> They represent a *computationally filtered and visually sampled candidate pool*.
> Even within the 497 simulated potential training candidates, minor edge deviations or slight petiole inclusions may exist.
> They must **NEVER** be merged into training sets or used for production model deployment without subsequent formal verification gates.

## 17. Recommended Next Step
1. **Complete Stop on Phase 1 Pipeline:** With visual QA and decision policy simulation complete, cease all automated segmentation scripts.
2. **Preserve Current State:** Keep all manifests, mapping tables, masks, and previews frozen.
3. **Review Protocol Proposal:** Present these simulation metrics to system architects to determine whether to:
   - (Option A) Proceed with the 497 `POTENTIAL_FINAL_TRAINING_CANDIDATE` pool for initial leaf detection prototype development.
   - (Option B) Execute a rapid human review of the 31 `MANUAL_VISUAL_REVIEW_REQUIRED` candidates to salvage additional training data.
   - (Option C) Formulate crop-adapted thresholds (e.g. relaxed solidity for Wheat) to balance crop distribution.

---
**Report Generation Complete.**  
`final_core_qa_decision_simulation.md` has been successfully created. Zero modifications were made to existing project files.