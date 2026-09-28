# AgriMind-AI — Final Human Verification Protocol & Sampling Plan
**Document Type:** Operational Quality Assurance & Verification Architecture Specification  
**Execution Mode:** STRICTLY READ-ONLY (No Dataset Generation — No Model Training)  
**Date & System Timestamp:** 2026-09-27  
**Target Curation Pool:** 497 Candidates (416 Pending Verification + 81 Manual Review)  

---

## 1. Execution Status
- **Protocol Status:** RATIFIED SPECIFICATION (100% READ-ONLY)
- **Purpose:** Formal operational blueprint defining the human verification workflow and statistical sampling strategy required before dataset generation.
- **Safety Verification:** Active. Zero files modified, zero images copied, zero masks regenerated, zero JSONs modified, zero training datasets created, zero git operations.
- **Operational Principle:** No candidate is training-eligible without human sign-off under this protocol.

## 2. Current Population State
The AgriMind-AI leaf annotation pipeline has progressed through systematic filtering, empirical visual QA, and targeted risk audits:

| Pipeline Curation Tier | Total Candidates | Description / Eligibility |
| :--- | :---: | :--- |
| **Master Candidate Pool** | 1,800 | Full universe of evaluated leaf crop images. |
| **Usable Verified-Output Pool** | 1,552 | 750 `AUTO_ACCEPTED` + 802 `VALID_MAPPING` records. |
| **Config-A Candidate Pool** | 994 | $0.15 \le \text{Area Ratio} \le 0.85 \land \text{Solidity} \ge 0.60 \land \text{Confidence} \ge 0.75$. |
| **CORE Pool** | 539 | $\text{Confidence} \ge 0.85 \land \text{Solidity} \ge 0.80 \land \text{Area Ratio} \le 0.80$. |
| **Exclusion Review Quarantined** | 11 | Confirmed compound cluster/background merges (quarantined in Hold). |
| **Active Curation Pool** | **497** | Active pre-training candidates evaluated in curation simulation. |
| **Population A: FINAL_CANDIDATE_PENDING_HUMAN_VERIFICATION** | **416** | High-probability candidate reservoir (83.70% of pool). |
| **Population B: MANUAL_REVIEW_REQUIRED** | **81** | Carries morphological risk flags; held in review gate (16.30% of pool). |
| **Population C: EXCLUSION_REVIEW_REQUIRED** | **0** | Zero unquarantined candidates in active pool. |

## 3. Population A Strategy: 416 Candidates (Pending Verification)
- **Baseline Profile:** Every candidate meets strict CORE criteria (Conf $\ge 0.85$, Sol $\ge 0.80$, Area $\le 0.80$), has verified readable outputs, and possesses clean morphology without cluster/edge conflict.
- **Verification Strategy:** **Progressive Tiered Verification (Census for Rare Classes + 35% Representative Stratified Audit + Human Verification Interface Batch Sign-Off)**.
  1. **Wheat (100% Census):** All 5 Wheat records undergo mandatory 100% human sign-off due to sample rarity.
  2. **Soybean (100% Census):** All 25 approved Soybean candidates undergo 100% human review to confirm individual leaflet isolation against compound cluster merging.
  3. **Cotton, Maize, Pigeon Pea (Stratified Sampling + Batch Verification):** A deterministic stratified sample of 120 candidates (40 Cotton, 40 Maize, 40 Pigeon Pea) is audited first. If sample precision exceeds 95% `APPROVED`/`MINOR_REVIEW`, the remaining batch is verified via accelerated human acceptance tool.

## 4. Population B Strategy: 81 Candidates (Manual Review Required)
- **Baseline Profile:** Carries known morphological risk factors (longitudinal blade edge contact, lower confidence 0.85–0.88, or compound foliage proximity).
- **Verification Strategy:** **MANDATORY 100% CENSUS HUMAN AUDIT (81 / 81 = 100%)**.
  - **Zero Sampling Shortcuts:** No statistical sampling is permitted for Population B.
  - **Every single candidate (81 out of 81) must be directly inspected by a human reviewer.**
  - **Action Paths:**
    - `APPROVED`: Upgraded to training dataset.
    - `MINOR_REVIEW`: Retained as partial-leaf instance or lightly trimmed.
    - `REJECT_*`: Permanently discarded from training pool.

## 5. Deterministic Sampling Methodology
To eliminate selection bias and ensure complete structural reproducibility:
1. **Sort Order:** Within each crop and population stratum, candidates are sorted deterministically by `area_ratio`, then `confidence_score`, then `candidate_id`.
2. **Linear Metric Spacing:** Sample indices are chosen via equal mathematical intervals: $\text{index}_i = \text{round}\left(i \cdot \frac{N - 1}{k - 1}\right)$.
3. **Reproducibility Guarantee:** Any auditor applying this protocol on the AgriMind-AI database will inspect the exact same candidate sequence.

## 6. Crop-Wise Verification Allocation Plan
| Crop Class | Population A (416) | Pop A Human Inspection Target | Population B (81) | Pop B Human Inspection Target | Total Human Inspections | Strategy Rationale |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Cotton** | 152 | 40 (Stratified) | 9 | 9 (100% Census) | **49** | Very clean lobed profile; focus on boundary edges. |
| **Soybean** | 25 | 25 (100% Census) | 12 | 12 (100% Census) | **37** | 100% verification to guard against compound leaflet bridging. |
| **Maize** | 66 | 40 (Stratified) | 33 | 33 (100% Census) | **73** | High review burden due to frame-boundary blade contact. |
| **Wheat** | 5 | 5 (100% Census) | 0 | 0 (N/A) | **5** | 100% verification of rare monocot blade instances. |
| **Pigeon Pea** | 168 | 40 (Stratified) | 27 | 27 (100% Census) | **67** | High volume; audit clusters and petiole attachments. |
| **Total** | **416** | **150 (36.1%)** | **81** | **81 (100.0%)** | **231 (46.5%)** | **Exhaustive coverage of all risk-bearing and rare records.** |

## 7. Source-Wise Verification Allocation
| Annotation Source | Population A (416) | Population B (81) | Total Candidates | Human Audit Target | Allocation Rationale |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`AUTO_ACCEPTED`** | 173 | 27 | 200 | 72 | Full coverage of automated Wheat and Pigeon Pea pipelines. |
| **`VALID_MAPPING`** | 243 | 54 | 297 | 159 | Full coverage of legacy Cotton, Soybean, and Maize mappings. |
| **Total** | **416** | **81** | **497** | **231** | **Balanced dual-source verification.** |

## 8. Multi-Dimensional Metric Coverage
The verification plan deliberately targets all operational metric bands:
1. **Confidence Bands:**
   - `0.85 – 0.88`: Lower CORE boundary (100% of Population B cases in this band inspected).
   - `0.88 – 0.95`: Core distribution body.
   - `>= 0.95`: Ultra-high confidence tier (auditing for false confidence on compound clusters).
2. **Area Bands:**
   - `0.15 – 0.40`: Macro/isolated leaves.
   - `0.40 – 0.60`: Medium balanced framing.
   - `0.60 – 0.80`: High-risk zone (100% of Population B cases in this band inspected).
3. **Solidity Bands:**
   - `0.80 – 0.90`: Lobed and dentated leaf margins (Cotton, Wheat).
   - `0.90 – 0.95`: Standard elliptic foliage.
   - `>= 0.95`: Highly compact foliage (strictly audited in Soybean/Pigeon Pea for cluster hulls).

## 9. Crop-Specific Verification Focus
- **Cotton:** Verify that outer leaf lobes contact frame borders cleanly without background inclusion. Ensure petiole is not included unless part of the target leaf.
- **Soybean:** Verify single-leaflet semantic isolation. If mask bridges two adjacent leaflets across petiolules, it must be labeled `REJECT_BACKGROUND`.
- **Maize:** Verify longitudinal continuity. Minor tip clipping at the frame boundary is acceptable under `MINOR_REVIEW`, but severe diagonal cuts must be flagged.
- **Wheat:** Verify parallel blade margins and sheath attachment. Ensure slender tip is not severely truncated.
- **Pigeon Pea:** Check for multi-leaflet merging in dense clusters. Verify that small individual leaflets are cleanly bounded.

## 10. Human Reviewer Standard Operating Checklist
Reviewers must systematically evaluate four visual layers (Original Image, Mask, Preview Overlay, Polygon Coordinates) against this 7-point checklist:
1. [ ] **Single Instance Integrity:** Does the mask enclose exactly one target leaf/leaflet, rather than a merged cluster?
2. [ ] **Margin Precision:** Does the polygon boundary adhere to the true visual edge within $\pm 5$ pixels?
3. [ ] **Background Exclusion:** Are soil, background shadows, dry twigs, and non-target leaves excluded?
4. [ ] **Boundary Clipping Severity:** If the leaf touches the image frame, is at least 85% of the visible lamina captured?
5. [ ] **Petiole Adherence:** Is petiole inclusion limited to the immediate leaf base, avoiding long branch stems?
6. [ ] **Internal Voids / Holes:** Is the leaf interior fully solid without artificial dropouts or holes?
7. [ ] **Visual Clarity:** Is image contrast sufficient to definitively confirm the boundary without ambiguity?

## 11. Formal Human Decision Labels
| Verification Label | Visual Standard & Criterion | Training Dataset Eligibility |
| :--- | :--- | :---: |
| **`APPROVED`** | Single target leaf correctly segmented; background excluded; polygon adheres cleanly to margins. | **YES (Direct Training Inclusion)** |
| **`MINOR_REVIEW`** | Primary leaf correctly captured (>85% area); minor tip, apex, or petiole clipping at frame border. | **YES (Eligible as Partial Instance)** |
| **`REJECT_BACKGROUND`** | Significant soil, background, shadow, or adjacent clustered foliage included. | **NO (Permanently Discarded)** |
| **`REJECT_WRONG_BOUNDARY`** | Polygon does not follow the actual leaf boundary; inverted or distorted. | **NO (Permanently Discarded)** |
| **`REJECT_WHOLE_FRAME`** | Mask captures most or all of the image rather than the target leaf. | **NO (Permanently Discarded)** |
| **`UNCERTAIN`** | Image quality, lighting, or overlap is too ambiguous for confident classification. | **NO (Routed to Second Review)** |

## 12. Second-Review Rules
A mandatory second independent review is triggered under any of the following conditions:
1. The primary reviewer assigns **`UNCERTAIN`**.
2. Any candidate in **Soybean** with $\text{Area Ratio} \ge 0.60$ and $\text{Solidity} \ge 0.95$ proposed for `APPROVED`.
3. Any candidate where the primary reviewer proposes switching a `MANUAL_REVIEW_REQUIRED` record into `APPROVED`.
4. A random 10% quality audit of all primary approvals.

## 13. Disagreement Resolution Protocol
- If Reviewer 1 and Reviewer 2 agree $\rightarrow$ Final label recorded.
- If Reviewer 1 votes `APPROVED` and Reviewer 2 votes `MINOR_REVIEW` $\rightarrow$ Default to `MINOR_REVIEW` (conservative safety).
- If Reviewer 1 votes `APPROVED` and Reviewer 2 votes `REJECT_*` $\rightarrow$ Escalated to Lead Computer Vision Engineer / Domain Agronomist for binding arbitration.
- If arbitration is inconclusive $\rightarrow$ Record is permanently labeled `UNCERTAIN` and excluded from training.

## 14. Handling of Uncertain Cases
> [!IMPORTANT]
> **Zero-Tolerance for Ambiguity:** Any candidate that remains labeled `UNCERTAIN` after second review must be **strictly excluded from all training datasets**.
> It is vastly preferable to have a smaller, pristine training pool than a larger pool contaminated by ambiguous ground truth.

## 15. Final Approval Policy for Dataset Inclusion
A candidate enters the finalized training dataset if and only if:
1. It receives a formal human verification label of **`APPROVED`** or **`MINOR_REVIEW`**.
2. Both primary and secondary reviews (where applicable) have signed off.
3. Hash integrity (`sha256`), image dimensions, and JSON polygon formatting pass automated validation.
4. All `REJECT_*` and `UNCERTAIN` candidates are quarantined into an exclusion registry.

## 16. Train / Validation / Test Leakage Prevention Protocol
To ensure scientific validity and eliminate data contamination:
1. **Source Split Preservation:** Pre-existing split designations (`train`, `val`, `test`) from source datasets (`cotton_final`, `maize_extended_final300`, `wheat`, `soybean_11class_balanced`, `pigeon_pea_targeted`) must be strictly maintained.
2. **Augmentation Grouping:** All augmented variations (e.g. `aug_0000_rotate180.jpg`) derived from the same base image must reside in the identical split as the original parent image.
3. **Cross-Split Integrity Hash:** A SHA-256 hash collision check across `train`, `val`, and `test` splits will run automatically before dataset export.

## 17. Final Dataset Generation Prerequisites
Dataset generation (exporting YOLO bounding boxes, COCO polygon JSONs, or segmentation masks) must **NOT** begin until:
1. [ ] All 231 targeted human verification reviews are complete and digitally signed.
2. [ ] Disagreements and `UNCERTAIN` cases are fully resolved or quarantined.
3. [ ] Split leakage verification script completes with zero cross-contamination.
4. [ ] Formal stakeholder authorization is received.

## 18. Safety Limitations
1. **Planning Only:** This document is an operational protocol and sampling specification. It does NOT generate datasets, alter candidate records, or start training.
2. **Human Dependency:** The efficacy of this protocol relies upon diligent execution of the reviewer checklist.
3. **System Isolation:** Production backend and frontend services remain completely decoupled from this verification workflow.

## 19. Explicit Ground-Truth Disclaimer
> [!WARNING]
> **NO CANDIDATE IS GROUND TRUTH UNTIL FINAL HUMAN VERIFICATION IS COMPLETED:**
> Under no circumstances should any candidate from Population A (416), Population B (81), or any earlier curation tier be treated as ground truth.
> They are candidate segmentations subject to verification.
> True ground truth is established exclusively upon human visual sign-off under this ratified protocol.

---
**Protocol Specification Complete.**  
`final_human_verification_protocol.md` has been successfully created. Zero modifications were made to existing project files.