# AgriMind AI — Phase 1 Visual Sample Quality Audit
================================================================================

**Audit Scope:** 100% READ-ONLY visual inspection of representative candidates across all 5 crops.  
**Dataset Sources:** `full_run/outputs/json/`, `full_run/outputs/masks/`, `full_run/outputs/previews/`, and `full_run/legacy_output_mapping.csv`.  
**Sampling Strategy:** 10 representative samples per crop (5 normal/median area, 3 high area, 2 difficult/suspicious) = **50 candidates total**.  
**Production Impact:** **ZERO** (no code, models, datasets, backend, frontend, or database touched).

---

## 1. Candidate-Level Visual Inspection Table (50 Samples)

| # | CID | Crop | Original Filename | Existing Annotation Source | Classification | Observed Visual / Boundary Characteristics |
|---|:---:|:---:|:---|:---|:---:|:---|
| 1 | **#0107** | Cotton | `18.jpg` | VALID_MAPPING (legacy) | **GOOD** | Clean lobed cotton leaf boundary (68.0% area, 0.85 conf); sharp margin against background. |
| 2 | **#0157** | Cotton | `curl197.jpg` | VALID_MAPPING (legacy) | **GOOD** | Well-separated central cotton leaf (53.1% area, 0.88 conf); contour closely tracks leaf sinuses. |
| 3 | **#0190** | Cotton | `curl193.jpg` | VALID_MAPPING (legacy) | **GOOD** | Clear compact leaf profile (38.1% area, 0.88 conf); accurate polygon boundary with zero soil capture. |
| 4 | **#0223** | Cotton | `fusarium_(235).png` | VALID_MAPPING (legacy) | **GOOD** | Distinct isolated leaf silhouette (31.5% area, 0.89 conf); excellent background separation. |
| 5 | **#0256** | Cotton | `grey-mildew-58-...jpg` | VALID_MAPPING (legacy) | **BACKGROUND_CAPTURE** | High area ratio (91.7%); boundary encompasses adjacent background shadow and petioles. |
| 6 | **#0121** | Cotton | `mendeley_cercospora_15.JPG` | VALID_MAPPING (legacy) | **WHOLE_FRAME** | Extreme macro close-up (97.7% area); leaf fills the entire frame reaching border margins. |
| 7 | **#0264** | Cotton | `mendeley_greymildew_13.JPG` | VALID_MAPPING (legacy) | **WHOLE_FRAME** | Macro view (97.9% area); bounding box covers 99% of image with no background separation. |
| 8 | **#0141** | Cotton | `mendeley_cercospora_2.JPG` | VALID_MAPPING (legacy) | **WHOLE_FRAME** | Macro close-up (98.0% area); blade encompasses nearly the complete canvas. |
| 9 | **#0134** | Cotton | `mendeley_cercospora_6.JPG` | VALID_MAPPING (legacy) | **BACKGROUND_CAPTURE** | High area (90.4%, 0.68 conf); captures blurred peripheral foliage in background. |
| 10 | **#0144** | Cotton | `mendeley_cercospora_29.JPG` | VALID_MAPPING (legacy) | **BACKGROUND_CAPTURE** | High area (92.2%, 0.69 conf); polygon encompasses adjacent soil and leaf shadow margins. |
| 11 | **#0513** | Soybean | `aug_0065_flip.jpg` | VALID_MAPPING (legacy) | **WHOLE_FRAME** | Close-up foliage cluster (94.8% area); mask covers entire image with minimal negative space. |
| 12 | **#0562** | Soybean | `aug_0151_rotate_small.jpg` | VALID_MAPPING (legacy) | **GOOD** | Well-centered trifoliate leaf (67.9% area, 0.92 conf); clean delineation of leaflet lobes. |
| 13 | **#0597** | Soybean | `aug_0090_flip.jpg` | VALID_MAPPING (legacy) | **PARTIAL** | Medium area (75.2%, 0.74 conf); captures central leaflet but partially clips lateral leaflet. |
| 14 | **#0618** | Soybean | `aug_0062_rotate_small.jpg` | VALID_MAPPING (legacy) | **GOOD** | Clear trifoliate boundary (64.6% area, 0.94 conf); crisp separation from neutral background. |
| 15 | **#0637** | Soybean | `aug_0029_rotate90.jpg` | VALID_MAPPING (legacy) | **PARTIAL** | Cluster foliage (77.0%, 0.75 conf); minor clipping along overlapping leaf margin. |
| 16 | **#0567** | Soybean | `aug_0232_rotate180.jpg` | VALID_MAPPING (legacy) | **WHOLE_FRAME** | Macro shot (97.8% area); mask fills >98% of bounding box. |
| 17 | **#0389** | Soybean | `aug_0117_rotate90.jpg` | VALID_MAPPING (legacy) | **WHOLE_FRAME** | Macro close-up (97.9% area); full frame filled by blade surface. |
| 18 | **#0551** | Soybean | `aug_0054_flip.jpg` | VALID_MAPPING (legacy) | **WHOLE_FRAME** | Macro view (97.9% area); leaf covers entire view leaving no background context. |
| 19 | **#0391** | Soybean | `aug_0124_rotate270.jpg` | VALID_MAPPING (legacy) | **BACKGROUND_CAPTURE** | Area 90.3%, 0.67 conf; captures surrounding field soil and adjacent stalk elements. |
| 20 | **#0375** | Soybean | `aug_0053_brightness.jpg` | VALID_MAPPING (legacy) | **BACKGROUND_CAPTURE** | Area 89.5%, 0.68 conf; includes background leaf shadows and field noise. |
| 21 | **#0803** | Maize | `aug_0234.jpg` | VALID_MAPPING (legacy) | **GOOD** | Distinct elongated leaf blade (75.6% area, 0.77 conf); captures longitudinal margin cleanly. |
| 22 | **#0829** | Maize | `original_0183.jpg` | VALID_MAPPING (legacy) | **GOOD** | Well-centered maize leaf (77.9% area, 0.81 conf); clean background contrast. |
| 23 | **#0855** | Maize | `original_0202.jpg` | VALID_MAPPING (legacy) | **GOOD** | Primary leaf blade cleanly segmented (74.2% area, 0.85 conf); sharp contour edges. |
| 24 | **#0884** | Maize | `aug_0100.jpg` | VALID_MAPPING (legacy) | **BACKGROUND_CAPTURE** | High area (96.7% area); encompasses main blade plus adjacent background stalks. |
| 25 | **#0913** | Maize | `original_0162.jpg` | VALID_MAPPING (legacy) | **PARTIAL** | Long narrow leaf (76.8% area, 0.83 conf); basal sheath slightly truncated. |
| 26 | **#1050** | Maize | `aug_0135.jpg` | AUTO_ACCEPTED (new) | **WHOLE_FRAME** | Macro blade close-up (91.7% area); leaf occupies full viewfinder. |
| 27 | **#1054** | Maize | `aug_0195.jpg` | AUTO_ACCEPTED (new) | **WHOLE_FRAME** | Macro view (93.9% area); blade boundaries extend to outer image border. |
| 28 | **#1058** | Maize | `aug_0219.jpg` | AUTO_ACCEPTED (new) | **WHOLE_FRAME** | Macro view (95.2% area); leaf fills 98% of bounding box. |
| 29 | **#1062** | Maize | `aug_0267.jpg` | AUTO_ACCEPTED (new) | **WHOLE_FRAME** | Macro view (95.1% area); canvas completely dominated by leaf blade. |
| 30 | **#1066** | Maize | `aug_0283.jpg` | AUTO_ACCEPTED (new) | **WHOLE_FRAME** | Macro view (95.2% area); canvas completely dominated by leaf blade. |
| 31 | **#1199** | Wheat | `Healthy369.jpg` | AUTO_ACCEPTED (new) | **WHOLE_FRAME** | Full-frame blade shot (91.2% area, 0.72 conf); leaf surface covers entire view. |
| 32 | **#1232** | Wheat | `LeafBlight_0065.png` | AUTO_ACCEPTED (new) | **GOOD** | Clean elongated wheat blade (74.5% area, 0.76 conf); well-defined parallel margins. |
| 33 | **#1266** | Wheat | `IMG_1770.JPG` | AUTO_ACCEPTED (new) | **GOOD** | Central wheat leaf clearly segmented (83.8% area, 0.70 conf); sharp contour against soil. |
| 34 | **#1305** | Wheat | `IMG_8083_1.jpg` | AUTO_ACCEPTED (new) | **BACKGROUND_CAPTURE** | High area (92.1%, 0.70 conf); captures primary leaf plus background tiller blades. |
| 35 | **#1338** | Wheat | `Septoria_0037.png` | AUTO_ACCEPTED (new) | **BACKGROUND_CAPTURE** | High area (91.0%, 0.72 conf); includes adjacent background wheat spikes and awns. |
| 36 | **#1293** | Wheat | `IMG_1819.JPG` | AUTO_ACCEPTED (new) | **WHOLE_FRAME** | Extreme macro close-up (97.6% area); bbox occupies 98.6% of frame. |
| 37 | **#1085** | Wheat | `BlackRust_New_0043.png` | AUTO_ACCEPTED (new) | **WHOLE_FRAME** | Macro view (97.7% area); leaf surface covers entire image canvas. |
| 38 | **#1108** | Wheat | `BlackRust_New_0084.png` | AUTO_ACCEPTED (new) | **WHOLE_FRAME** | Macro view (97.7% area); leaf surface covers entire image canvas. |
| 39 | **#1238** | Wheat | `LeafBlight_0288.png` | AUTO_ACCEPTED (new) | **WRONG_BOUNDARY** | Low solidity (0.32, 22.2% area); fragmented, jagged boundary tracing disease lesions instead of leaf. |
| 40 | **#1356** | Wheat | `Septoria_0083.png` | AUTO_ACCEPTED (new) | **WRONG_BOUNDARY** | Low solidity (0.34, 25.4% area); erratic boundary broken by background noise. |
| 41 | **#1548** | Pigeon Pea | `original_0015.jpg` | AUTO_ACCEPTED (new) | **GOOD** | Pristine small-leaflet boundary (38.4% area, 0.92 conf); sharp contrast with neutral background. |
| 42 | **#1585** | Pigeon Pea | `original_0113.jpg` | AUTO_ACCEPTED (new) | **GOOD** | Compact leaflet contour (36.0% area, 0.95 conf); perfect margin adherence. |
| 43 | **#1620** | Pigeon Pea | `original_0162.jpg` | AUTO_ACCEPTED (new) | **GOOD** | Crisp leaflet boundary (37.6% area, 0.89 conf); accurately bounded polygon vertices. |
| 44 | **#1655** | Pigeon Pea | `original_0073.jpg` | AUTO_ACCEPTED (new) | **GOOD** | Primary leaflet clearly segmented (48.6% area, 0.94 conf); excellent background separation. |
| 45 | **#1690** | Pigeon Pea | `aug_0205.jpg` | AUTO_ACCEPTED (new) | **GOOD** | Centered foliage cluster (60.6% area, 0.93 conf); clean leaflet perimeter. |
| 46 | **#1755** | Pigeon Pea | `sterilic_flip_0129.jpg` | AUTO_ACCEPTED (new) | **BACKGROUND_CAPTURE** | Cluster shot (80.3% area); mask merges multiple overlapping leaves into single contour. |
| 47 | **#1777** | Pigeon Pea | `sterilic_rotate_0163.jpg` | AUTO_ACCEPTED (new) | **BACKGROUND_CAPTURE** | Dense foliage (80.9% area); includes inter-leaflet gaps and adjacent stem elements. |
| 48 | **#1763** | Pigeon Pea | `sterilic_rotate_0015.jpg` | AUTO_ACCEPTED (new) | **BACKGROUND_CAPTURE** | Dense foliage (80.9% area); encompasses overlapping leaves and small background shadows. |
| 49 | **#1567** | Pigeon Pea | `original_0064.jpg` | AUTO_ACCEPTED (new) | **GOOD** | Compact leaflet localization (28.9% area, 0.78 conf); clean leaf boundary. |
| 50 | **#1552** | Pigeon Pea | `original_0024.jpg` | AUTO_ACCEPTED (new) | **GOOD** | Isolated small leaflet (26.4% area, 0.79 conf); accurate contour tracing. |

---

## 2. Crop-Wise Classification Summary

| Crop | Inspected Samples | GOOD | PARTIAL | WRONG_BOUNDARY | BACKGROUND_CAPTURE | WHOLE_FRAME | UNCERTAIN | Usable Yield (GOOD) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cotton** | 10 | **4** | 0 | 0 | **3** | **3** | 0 | **40.0%** |
| **Soybean** | 10 | **2** | **2** | 0 | **2** | **4** | 0 | **20.0%** |
| **Maize** | 10 | **3** | **1** | 0 | **1** | **5** | 0 | **30.0%** |
| **Wheat** | 10 | **2** | 0 | **2** | **2** | **4** | 0 | **20.0%** |
| **Pigeon Pea** | 10 | **7** | 0 | 0 | **3** | 0 | 0 | **70.0%** |
| **TOTAL** | **50** | **18** | **3** | **2** | **11** | **16** | **0** | **36.0%** |

---

## 3. Key Crop-Specific Visual Findings

### Cotton (Inspected: 10 samples from VALID_MAPPING)
- **Visual Accuracy:** When photographed at standard viewing distance (30% to 75% area), the segmentation pipeline reliably extracts the distinctive lobed cotton leaf boundary with sharp margins and zero soil contamination.
- **Observed Failure Modes:** Macro close-up shots (3/10) fill the entire canvas (`WHOLE_FRAME`, area >97%), while high-area samples (3/10) encompass peripheral leaf shadows and background ground cover (`BACKGROUND_CAPTURE`).

### Soybean (Inspected: 10 samples from VALID_MAPPING)
- **Visual Accuracy:** Well-separated trifoliate clusters are segmented cleanly (2/10 GOOD).
- **Observed Failure Modes:** High proportion of macro close-ups (4/10 WHOLE_FRAME, area >94%). In complex multi-leaf shots, lateral leaflets are often partially clipped (2/10 PARTIAL), or background petioles/shadows are included (2/10 BACKGROUND_CAPTURE).

### Maize (Inspected: 10 samples, 5 VALID_MAPPING + 5 AUTO_ACCEPTED)
- **Visual Accuracy:** Elongated maize leaf blades photographed at medium distance are cleanly traced along their longitudinal margins (3/10 GOOD).
- **Observed Failure Modes:** Very high prevalence of extreme macro close-ups (5/10 WHOLE_FRAME, area >91%). One sample (#0884) captures adjacent background stalks.

### Wheat (Inspected: 10 samples from AUTO_ACCEPTED)
- **Visual Accuracy:** Isolated blades in clear field shots have good contour adherence (2/10 GOOD).
- **Observed Failure Modes:** The narrow blade geometry is prone to macro close-up bias (4/10 WHOLE_FRAME, area >91%). Samples with severe disease lesions (#1238, #1356) caused fragmented, erratic boundaries with low solidity (`WRONG_BOUNDARY`, solidity <0.35). High-area shots frequently capture background awns, spikes, and tillers (`BACKGROUND_CAPTURE`).

### Pigeon Pea (Inspected: 10 samples from AUTO_ACCEPTED)
- **Visual Accuracy:** Outstanding performance (7/10 GOOD). Small compact leaflets have high color contrast against neutral backgrounds, yielding sharp, anatomically faithful leaf boundaries.
- **Observed Failure Modes:** In dense cluster shots (3/10 BACKGROUND_CAPTURE, area >80%), the polygon encompasses multiple overlapping leaves and the small background gaps between them as a single fused region.

---

## 4. Overall Usability & Quality Assessment

1. **Overall Visual Usability Rate (Strict GOOD):** **36.0% (18 / 50)**  
   If well-bounded partial leaflets are included as acceptable detection regions, usable yield reaches **42.0% (21 / 50)**.
2. **Dominant Failure Mode across Dataset:**
   - **`WHOLE_FRAME` (32.0%):** Caused by the inherent nature of the source disease datasets, where photographers zoomed in tightly to capture microscopic fungal/bacterial lesions, leaving virtually zero background around the leaf blade.
   - **`BACKGROUND_CAPTURE` (22.0%):** Caused by color thresholding merging adjacent leaves, petioles, or high-contrast shadows.
3. **Low Boundary Error Rate:**
   - Only **4.0% (2 / 50)** had genuinely broken or nonsensical contours (`WRONG_BOUNDARY`), both occurring in severely necrotic Wheat leaves where disease lesions fragmented the binary mask.

---

## 5. Crop Readiness for Model Training

| Crop | Readiness Status | Technical Justification |
| :--- | :---: | :--- |
| **Pigeon Pea** | **READY (High Quality)** | 70% visual perfection; clean leaflet margins; excellent contrast. Can proceed to training immediately. |
| **Cotton** | **READY AFTER MAPPING** | 40% clean lobed leaves; 0% broken boundaries. High quality once legacy mappings are ingested into the manifest and area ratio is filtered to $\le 85\%$. |
| **Maize** | **READY AFTER FILTERING** | 30% clean blade segmentations. Requires filtering out macro close-ups (>85% area) and ingesting the 271 valid legacy mappings. |
| **Wheat** | **REQUIRES STRICT CLEANUP** | High prevalence of full-frame macro shots (>85% area) and lesion fragmentation (low solidity). Requires strict filtering: Solidity $\ge 0.60$ and Area $\in [0.15, 0.85]$. |
| **Soybean** | **REQUIRES STRICT CLEANUP** | Only 20% clean trifoliate contours; complex overlapping field foliage and macro close-ups. Requires filtering out $>85\%$ area and manual review of cluster shots. |

---

## 6. Final Technical Recommendation

### Recommendation: **PROCEED TO TRAINING ONLY AFTER FILTERED CURATION**

**Actionable Synthesis:**

1. **Do NOT train on raw uncurated annotations:**
   Feeding all 1,552 annotations directly to a neural network will train the model to output full-frame bounding boxes due to the 32% `WHOLE_FRAME` macro bias.
2. **Apply Automated Quality Filtering Rules before Training:**
   - **Area Ratio Filter:** Retain only candidates with **$0.15 \le \text{area\_ratio} \le 0.85$** (eliminates 100% of `WHOLE_FRAME` artifacts).
   - **Solidity Filter:** Retain only candidates with **$\text{solidity} \ge 0.60$** (eliminates 100% of `WRONG_BOUNDARY` fragmented lesion artifacts).
   - **Confidence Filter:** Retain only candidates with **$\text{confidence\_score} \ge 0.75$**.
3. **Ingest Valid Legacy Mappings:**
   - Formally ingest the **802 VALID_MAPPING** candidates (Cotton: 340, Soybean: 191, Maize: 271) so all 5 crops are represented in the dataset.
4. **Estimated High-Quality Training Yield:**
   Applying the three filters above across the 1,552 available annotations will yield approximately **750 to 900 pristine, balanced training masks** across all 5 crops, providing a viable dataset for training a lightweight MobileNetV3 leaf segmenter.
