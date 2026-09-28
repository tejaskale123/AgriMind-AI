# AgriMind-AI — Phase 1 Targeted Visual Audit: Area 0.80–0.85 Removed Candidates
================================================================================

## Executive Notice & Verification Guarantees

> [!IMPORTANT]
> **READ-ONLY TARGETED VISUAL AUDIT STATEMENT:**
> 1. **This is a 100% READ-ONLY visual inspection of the cohort removed when tightening the area upper bound from 0.85 to 0.80.**
> 2. **NO annotation file was modified, deleted, overwritten, or regenerated.**
> 3. **NO source image, binary mask, preview, or JSON file was copied, moved, or deleted.**
> 4. **NO production code in `backend/`, `frontend-exp/`, or `models/` was touched.**
> 5. **NO existing disease classification model was modified, retrained, or replaced.**
> 6. **NO training was started, and NO training dataset was generated.**
> 7. **Neither threshold (0.80 nor 0.85) is declared optimal, and NO final threshold decision is made in this report.**

---

## 1. Exact Population Verification

- **Selection Criteria:** Candidates from the 1,552 usable pool satisfying **ALL** of the following conditions:
  $$\text{area\_ratio} > 0.80 \quad\land\quad \text{area\_ratio} \le 0.85 \quad\land\quad \text{solidity} \ge 0.60 \quad\land\quad \text{confidence\_score} \ge 0.75$$
- **Verification Status:** **CONFIRMED EXACTLY 163 CANDIDATES**
  - **Cotton:** 9 candidates
  - **Soybean:** 6 candidates
  - **Maize:** 47 candidates
  - **Wheat:** 26 candidates
  - **Pigeon Pea:** 75 candidates
  - **Total:** **163 candidates**

---

## 2. Sampling Methodology

- **Target Sample Size:** Exactly **50 candidates** selected from the 163 population.
- **Stratification Strategy:**
  - **Complete Crop Inclusion:** All 9 available Cotton candidates (100%) and all 6 available Soybean candidates (100%) were audited due to their small cohort sizes.
  - **Proportional Representation:** The remaining 35 sample slots were stratified across the larger cohorts:
    - **Maize:** 11 samples (from 47 total, 23.4% sampling rate)
    - **Wheat:** 9 samples (from 26 total, 34.6% sampling rate)
    - **Pigeon Pea:** 15 samples (from 75 total, 20.0% sampling rate)
  - **Area-Band Coverage:**
    - **Band A ($0.800 < \text{area} \le 0.815$):** 32 samples (reflecting the 132-candidate cluster in this band)
    - **Band B ($0.815 < \text{area} \le 0.830$):** 10 samples
    - **Band C ($0.830 < \text{area} \le 0.850$):** 8 samples
  - **Source Type Coverage:**
    - **`VALID_MAPPING`:** 26 samples
    - **`AUTO_ACCEPTED`:** 24 samples
- **Artifacts Audited for Each Sample:**
  - Original image in `datasets/processed/`
  - Existing binary mask in `outputs/masks/`
  - Existing visual preview overlay in `outputs/previews/`
  - Existing polygon coordinates in `outputs/json/`

---

## 3. Candidate-Level Visual Audit Table (50 Samples)

| # | CID | Crop | Source | Original Filename | Area Band | Area Ratio | Conf | Solidity | Visual Classification | Observed Visual Characteristics / Issues |
|---|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 1 | **#0081** | Cotton | VALID_MAPPING | `48.jpg` | Band B | 0.821 | 0.755 | 0.933 | **ACCEPTABLE_PARTIAL** | Area 0.821 (Band B); primary cotton leaf dominates canvas; lobes clear but touches edges. |
| 2 | **#0088** | Cotton | VALID_MAPPING | `48_aug1.jpg` | Band B | 0.822 | 0.753 | 0.933 | **ACCEPTABLE_PARTIAL** | Area 0.822 (Band B); primary cotton leaf dominates canvas; lobes clear but touches edges. |
| 3 | **#0089** | Cotton | VALID_MAPPING | `48_aug2.jpg` | Band B | 0.821 | 0.753 | 0.934 | **ACCEPTABLE_PARTIAL** | Area 0.821 (Band B); primary cotton leaf dominates canvas; lobes clear but touches edges. |
| 4 | **#0090** | Cotton | VALID_MAPPING | `48_aug3.jpg` | Band B | 0.820 | 0.753 | 0.934 | **ACCEPTABLE_PARTIAL** | Area 0.820 (Band B); primary cotton leaf dominates canvas; lobes clear but touches edges. |
| 5 | **#0103** | Cotton | VALID_MAPPING | `13_aug6.jpg` | Band A | 0.805 | 0.799 | 0.988 | **ACCEPTABLE_PARTIAL** | Area 0.805 (Band A); well-segmented central cotton leaf, minor margin contact. |
| 6 | **#0119** | Cotton | VALID_MAPPING | `21_aug6.jpg` | Band A | 0.808 | 0.796 | 0.999 | **ACCEPTABLE_PARTIAL** | Area 0.808 (Band A); well-segmented central cotton leaf, minor margin contact. |
| 7 | **#0165** | Cotton | VALID_MAPPING | `curl224.jpg` | Band C | 0.844 | 0.764 | 0.999 | **BACKGROUND_CAPTURE** | Area 0.844 (Band C); cotton leaf lobed margin captures surrounding ground shadows and petioles. |
| 8 | **#0166** | Cotton | VALID_MAPPING | `curl225.jpg` | Band C | 0.842 | 0.764 | 0.998 | **BACKGROUND_CAPTURE** | Area 0.842 (Band C); cotton leaf lobed margin captures surrounding ground shadows and petioles. |
| 9 | **#0167** | Cotton | VALID_MAPPING | `curl226.jpg` | Band C | 0.847 | 0.763 | 0.999 | **BACKGROUND_CAPTURE** | Area 0.847 (Band C); cotton leaf lobed margin captures surrounding ground shadows and petioles. |
| 10 | **#0374** | Soybean | VALID_MAPPING | `aug_0050_rotate_small.jpg` | Band B | 0.819 | 0.790 | 0.991 | **BACKGROUND_CAPTURE** | Area 0.819 (Band B); trifoliate structure merges with background field elements. |
| 11 | **#0382** | Soybean | VALID_MAPPING | `aug_0083_rotate_small.jpg` | Band B | 0.827 | 0.784 | 0.990 | **BACKGROUND_CAPTURE** | Area 0.827 (Band B); trifoliate structure merges with background field elements. |
| 12 | **#0448** | Soybean | VALID_MAPPING | `aug_0126_rotate_small.jpg` | Band A | 0.806 | 0.804 | 0.999 | **ACCEPTABLE_PARTIAL** | Area 0.806 (Band A); central trifoliate blade well delineated; minor petiole inclusion. |
| 13 | **#0557** | Soybean | VALID_MAPPING | `aug_0127_rotate_small.jpg` | Band A | 0.806 | 0.804 | 0.999 | **ACCEPTABLE_PARTIAL** | Area 0.806 (Band A); central trifoliate blade well delineated; minor petiole inclusion. |
| 14 | **#0588** | Soybean | VALID_MAPPING | `aug_0049_rotate_small.jpg` | Band B | 0.830 | 0.782 | 0.995 | **BACKGROUND_CAPTURE** | Area 0.830 (Band B); trifoliate structure merges with background field elements. |
| 15 | **#0658** | Soybean | VALID_MAPPING | `aug_0053_rotate_small.jpg` | Band C | 0.846 | 0.769 | 0.997 | **BACKGROUND_CAPTURE** | Area 0.846 (Band C); mask encompasses multiple overlapping foliage leaflets and background shadows. |
| 16 | **#0806** | Maize | VALID_MAPPING | `original_0017.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); longitudinal maize blade cleanly bounded, blade spans across frame edges. |
| 17 | **#0846** | Maize | VALID_MAPPING | `original_0133.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); longitudinal maize blade cleanly bounded, blade spans across frame edges. |
| 18 | **#0898** | Maize | VALID_MAPPING | `original_0065.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); longitudinal maize blade cleanly bounded, blade spans across frame edges. |
| 19 | **#0917** | Maize | VALID_MAPPING | `original_0009.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); longitudinal maize blade cleanly bounded, blade spans across frame edges. |
| 20 | **#0922** | Maize | VALID_MAPPING | `original_0101.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); longitudinal maize blade cleanly bounded, blade spans across frame edges. |
| 21 | **#0927** | Maize | VALID_MAPPING | `original_0041.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); longitudinal maize blade cleanly bounded, blade spans across frame edges. |
| 22 | **#0931** | Maize | VALID_MAPPING | `original_0097.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); longitudinal maize blade cleanly bounded, blade spans across frame edges. |
| 23 | **#0936** | Maize | VALID_MAPPING | `original_0201.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); longitudinal maize blade cleanly bounded, blade spans across frame edges. |
| 24 | **#0940** | Maize | VALID_MAPPING | `original_0005.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); longitudinal maize blade cleanly bounded, blade spans across frame edges. |
| 25 | **#0975** | Maize | VALID_MAPPING | `aug_0176.jpg` | Band A | 0.809 | 0.754 | 0.924 | **GOOD** | Area 0.809 (Band A); clean longitudinal leaf boundary with distinct background separation. |
| 26 | **#0821** | Maize | VALID_MAPPING | `original_0131.jpg` | Band B | 0.823 | 0.772 | 0.948 | **BACKGROUND_CAPTURE** | Area 0.823 (Band B); elongated maize leaf blade merges into background stalk/neighboring plant. |
| 27 | **#1436** | Wheat | AUTO_ACCEPTED | `Yellow_rust467.jpg` | Band A | 0.800 | 0.801 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.800 (Band A); close-up wheat blade surface accurately enclosed without background noise. |
| 28 | **#1391** | Wheat | AUTO_ACCEPTED | `TanSpot_0094.png` | Band A | 0.803 | 0.798 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.803 (Band A); close-up wheat blade surface accurately enclosed without background noise. |
| 29 | **#1162** | Wheat | AUTO_ACCEPTED | `Brown_rust006.jpg` | Band A | 0.808 | 0.796 | 1.000 | **ACCEPTABLE_PARTIAL** | Area 0.808 (Band A); close-up wheat blade surface accurately enclosed without background noise. |
| 30 | **#1418** | Wheat | AUTO_ACCEPTED | `TanSpot_0109.png` | Band B | 0.819 | 0.783 | 0.999 | **GOOD** | Area 0.819 (Band B); parallel blade margins cleanly traced against neutral background. |
| 31 | **#1427** | Wheat | AUTO_ACCEPTED | `TanSpot_0175.png` | Band B | 0.822 | 0.781 | 1.000 | **GOOD** | Area 0.822 (Band B); parallel blade margins cleanly traced against neutral background. |
| 32 | **#1437** | Wheat | AUTO_ACCEPTED | `Yellow_rust492.jpg` | Band C | 0.831 | 0.773 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.831 (Band C); narrow wheat blade mask expands into background awns and tillers. |
| 33 | **#1389** | Wheat | AUTO_ACCEPTED | `TanSpot_0062.png` | Band C | 0.840 | 0.766 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.840 (Band C); narrow wheat blade mask expands into background awns and tillers. |
| 34 | **#1412** | Wheat | AUTO_ACCEPTED | `TanSpot_0089.png` | Band C | 0.843 | 0.764 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.843 (Band C); narrow wheat blade mask expands into background awns and tillers. |
| 35 | **#1426** | Wheat | AUTO_ACCEPTED | `TanSpot_0173.png` | Band C | 0.850 | 0.760 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.850 (Band C); narrow wheat blade mask expands into background awns and tillers. |
| 36 | **#1442** | Pigeon Pea | AUTO_ACCEPTED | `aug_0227.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 37 | **#1463** | Pigeon Pea | AUTO_ACCEPTED | `aug_0284.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 38 | **#1468** | Pigeon Pea | AUTO_ACCEPTED | `aug_0293.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 39 | **#1484** | Pigeon Pea | AUTO_ACCEPTED | `original_0092.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 40 | **#1513** | Pigeon Pea | AUTO_ACCEPTED | `aug_0292.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 41 | **#1624** | Pigeon Pea | AUTO_ACCEPTED | `aug_0194.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); webbed cluster merges multiple leaves into single compound polygon. |
| 42 | **#1643** | Pigeon Pea | AUTO_ACCEPTED | `aug_0280.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); webbed cluster merges multiple leaves into single compound polygon. |
| 43 | **#1659** | Pigeon Pea | AUTO_ACCEPTED | `aug_0201.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); webbed cluster merges multiple leaves into single compound polygon. |
| 44 | **#1688** | Pigeon Pea | AUTO_ACCEPTED | `aug_0200.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); webbed cluster merges multiple leaves into single compound polygon. |
| 45 | **#1719** | Pigeon Pea | AUTO_ACCEPTED | `original_0101.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 46 | **#1735** | Pigeon Pea | AUTO_ACCEPTED | `original_0226.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 47 | **#1756** | Pigeon Pea | AUTO_ACCEPTED | `sterilic_flip_0137.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 48 | **#1776** | Pigeon Pea | AUTO_ACCEPTED | `sterilic_rotate_0139.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 49 | **#1789** | Pigeon Pea | AUTO_ACCEPTED | `original_0263.jpg` | Band A | 0.800 | 0.801 | 1.000 | **BACKGROUND_CAPTURE** | Area 0.800 (Band A); compound foliage cluster enclosed as a single large polygon. |
| 50 | **#1763** | Pigeon Pea | AUTO_ACCEPTED | `sterilic_rotate_0015.jpg` | Band A | 0.809 | 0.802 | 0.999 | **BACKGROUND_CAPTURE** | Area 0.809 (Band A); small leaflets clustered closely; mask merges multiple leaflets and inter-leaf gaps. |

---

## 4. Crop-Wise Visual Classification Summary

| Crop | Audited Samples | GOOD | ACCEPTABLE_PARTIAL | BACKGROUND_CAPTURE | WRONG_BOUNDARY | WHOLE_FRAME | UNCERTAIN | Visually Useful (GOOD + PARTIAL) | Problematic (BACKGROUND_CAPTURE) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | 9 | 0 | **6** | **3** | 0 | 0 | 0 | **6 (66.7%)** | **3 (33.3%)** |
| **Soybean** | 6 | 0 | **2** | **4** | 0 | 0 | 0 | **2 (33.3%)** | **4 (66.7%)** |
| **Maize** | 11 | **1** | **9** | **1** | 0 | 0 | 0 | **10 (90.9%)** | **1 (9.1%)** |
| **Wheat** | 9 | **2** | **3** | **4** | 0 | 0 | 0 | **5 (55.6%)** | **4 (44.4%)** |
| **Pigeon Pea** | 15 | 0 | 0 | **15** | 0 | 0 | 0 | **0 (0.0%)** | **15 (100.0%)** |
| **TOTAL** | **50** | **3** | **20** | **27** | **0** | **0** | **0** | **23 (46.0%)** | **27 (54.0%)** |

---

## 5. Overall Visual Classification Percentages

- **Total Inspected Samples:** **50**
- **GOOD:** **3 / 50 (6.00%)**
- **ACCEPTABLE_PARTIAL:** **20 / 50 (40.00%)**
- **BACKGROUND_CAPTURE:** **27 / 50 (54.00%)**
- **WRONG_BOUNDARY:** **0 / 50 (0.00%)**
- **WHOLE_FRAME:** **0 / 50 (0.00%)**
- **UNCERTAIN:** **0 / 50 (0.00%)**
- **Total Visually Useful (GOOD + ACCEPTABLE_PARTIAL):** **23 / 50 (46.00%)**
- **Total Visually Problematic (BACKGROUND_CAPTURE):** **27 / 50 (54.00%)**

---

## 6. Area-Band Visual Quality Distribution

| Area Band | Audited Samples | GOOD | ACCEPTABLE_PARTIAL | BACKGROUND_CAPTURE | Useful Count & % | Problematic Count & % |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Band A ($0.800 < \text{area} \le 0.815$)** | 32 | 1 | 16 | 15 | **17 (53.1%)** | **15 (46.9%)** |
| **Band B ($0.815 < \text{area} \le 0.830$)** | 10 | 2 | 4 | 4 | **6 (60.0%)** | **4 (40.0%)** |
| **Band C ($0.830 < \text{area} \le 0.850$)** | 8 | 0 | 0 | 8 | **0 (0.0%)** | **8 (100.0%)** |
| **TOTAL** | **50** | **3** | **20** | **27** | **23 (46.0%)** | **27 (54.0%)** |

---

## 7. Neutral Evidence Synthesis

1. **How many audited candidates appear genuinely problematic?**  
   **27 / 50 (54.00%)** exhibit significant `BACKGROUND_CAPTURE`.
2. **How many appear visually useful?**  
   **23 / 50 (46.00%)** provide valid leaf boundary supervision (3 pristine `GOOD` + 20 clean `ACCEPTABLE_PARTIAL`).
3. **How many are uncertain?**  
   **0 / 50 (0.00%)**.
4. **Which crops contain the most useful candidates above area 0.80?**  
   - **Maize:** **90.9% useful (10 / 11)**. Maize close-ups in this range represent clean longitudinal blade surfaces where the leaf cleanly spans the camera view without capturing extraneous field objects.
   - **Cotton:** **66.7% useful (6 / 9)**. Cotton leaves in Band A & B maintain distinct lobed perimeters, with minor edge contacts.
5. **Which crops contain the most background-capture problems above area 0.80?**  
   - **Pigeon Pea:** **100.0% problematic (15 / 15)**. Because Pigeon Pea has small leaflets, any mask reaching $>0.80$ area is inevitably a merged multi-leaflet compound cluster encompassing inter-leaflet background gaps.
   - **Soybean:** **66.7% problematic (4 / 6)**. Masks above $0.815$ merge adjacent foliage leaflets and background shadows.
6. **Which area band appears most problematic?**  
   - **Band C ($0.830 < \text{area} \le 0.850$) is 100% problematic (8 / 8 BACKGROUND_CAPTURE)**. In this extreme upper band, masks across all crops (Cotton, Soybean, Wheat) uniformly absorb extraneous background textures, soil margins, or tiller awns.
   - In contrast, Band A ($0.800 < \text{area} \le 0.815$) and Band B ($0.815 < \text{area} \le 0.830$) contain a balanced mixture of useful and problematic masks (~53% to 60% useful).
7. **Does the visual evidence suggest that lowering the upper bound to 0.80 removes mostly bad masks, mostly useful masks, or a mixture?**  
   - The visual evidence demonstrates that lowering the threshold to 0.80 removes a **MIXTURE** (**54.0% problematic vs. 46.0% visually useful**).
   - Crucially, the effect is **asymmetric across crops**:
     - For **Pigeon Pea**, the 0.80 cutoff eliminates **100% bad masks** (clustered background captures).
     - For **Maize**, the 0.80 cutoff eliminates **mostly useful masks (90.9%)**, needlessly penalizing valid longitudinal blade close-ups.
     - For **Wheat**, the 0.80 cutoff removes a **50/50 mixture** (useful blade close-ups vs. awn/tiller background captures).

---

## 8. Non-Decision & Policy Declaration

> [!NOTE]
> - **Neither 0.80 nor 0.85 is declared optimal.**
> - **No final training threshold is selected or locked in at this stage.**
> - **No dataset generation or training has been started.**
> - This report serves strictly as an empirical evidence base for future dataset curation planning.

---

## 9. Absolute Safety & Production Integrity Confirmation

The existing AgriMind-AI project remains completely intact:
- **Backend codebase (`backend/`):** UNCHANGED
- **Frontend codebase (`frontend-exp/`):** UNCHANGED
- **Datasets (`datasets/processed/`):** UNCHANGED (zero images copied, moved, or deleted)
- **Existing trained models (`models/*.pth`):** UNCHANGED
- **Database (`agrimind_history.db`):** UNCHANGED
- **Existing binary masks, JSONs, and previews:** UNCHANGED
- **No files deleted, moved, or renamed**
- **Model training:** NOT STARTED
- **Training dataset generation:** NOT STARTED
- **Segmentation reruns:** NONE
- **Git status:** NO COMMITS, NO PUSHES

---

## 10. Final Status

- **Report saved:** `ml/leaf_detection/annotation/automatic_test/full_run/phase1_area_080_rejected_visual_audit.md`
- **Action taken:** **STOPPED**. No further actions executed.
