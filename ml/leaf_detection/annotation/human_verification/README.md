# AgriMind-AI — Human Verification Workspace

**Status:** Isolated, Non-Destructive Quality Assurance Environment  
**Active Population:** 231 Target Candidates (150 Population A + 81 Population B)  
**Safety Mode:** Strictly Read-Only (Zero Source Dataset Mutations — Zero Training Invocations)  

---

## 1. Workspace Overview & Directory Layout

This isolated workspace hosts the human verification interface and manifest for the AgriMind-AI leaf localization pipeline. It allows domain experts to review, audit, and label candidate leaf segmentation annotations before any final training dataset is exported.

```
ml/leaf_detection/annotation/human_verification/
├── README.md                   # Workspace operations and verification guidelines (this file)
├── config.py                   # Central workspace path and server configuration
├── verification_manifest.csv   # The 231 deterministic human verification candidate records
├── review_app.py               # Standalone local review web application (100% standard Python)
├── decisions/                  # Individual reviewer decision audit records (JSON)
├── exports/                    # Directory reserved for approved candidate exports (future phase)
└── logs/                       # Server and audit execution logs
```

---

## 2. Verification Allocation (231 Candidates)

The workspace implements the ratified sampling plan from `final_human_verification_protocol.md`:

| Crop Class | Population A (416 Total) | Pop A Human Target | Population B (81 Total) | Pop B Human Target | Total Target Candidates | Verification Strategy Rationale |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Cotton** | 152 | 40 (Stratified) | 9 | 9 (100% Census) | **49** | Very clean lobed profile; focus on frame-boundary clipping. |
| **Soybean** | 25 | 25 (100% Census) | 12 | 12 (100% Census) | **37** | 100% verification to guard against compound leaflet bridging. |
| **Maize** | 66 | 40 (Stratified) | 33 | 33 (100% Census) | **73** | High review burden due to frame-boundary blade contact. |
| **Wheat** | 5 | 5 (100% Census) | 0 | 0 (N/A) | **5** | 100% verification of rare monocot blade instances. |
| **Pigeon Pea** | 168 | 40 (Stratified) | 27 | 27 (100% Census) | **67** | High volume; audit clusters and petiole attachments. |
| **Total** | **416** | **150 (36.1%)** | **81** | **81 (100.0%)** | **231 (46.5%)** | **Exhaustive coverage of all risk-bearing and rare records.** |

- **Population B (81 records):** Included at **100% census**. Every single candidate must be directly reviewed.
- **Population A (150 records):** Sampled via deterministic stratified intervals across confidence, area, and solidity.

---

## 3. How to Start the Reviewer App

The review server is 100% standard library Python and requires **zero external pip package installations**.

### Launch Command
From the project root directory, run:
```bash
python ml/leaf_detection/annotation/human_verification/review_app.py
```

### Accessing the Interface
Open your web browser and navigate to:
```
http://127.0.0.1:8088
```

The review server reads media directly from existing dataset paths and automatically resumes at the first pending candidate.

---

## 4. Decision Labels & Operational Definitions

Reviewers evaluate each candidate against six formal decision labels:

| Label | Keyboard Shortcut | Visual Standard & Operational Criterion | Dataset Eligibility |
| :--- | :---: | :--- | :---: |
| **`APPROVED`** | `[1]` | Single target leaf correctly segmented; background excluded; polygon adheres cleanly to visual edges ($\pm 5$ px). | **Eligible for Training** |
| **`MINOR_REVIEW`** | `[2]` | Primary leaf correctly captured (>85% lamina area); minor tip, apex, or petiole clipping at frame border. | **Eligible (Partial Instance)** |
| **`REJECT_BACKGROUND`** | `[3]` | Significant soil, background, shadow, or adjacent clustered foliage included. | **Permanently Discarded** |
| **`REJECT_WRONG_BOUNDARY`** | `[4]` | Polygon does not follow the actual leaf boundary; inverted, distorted, or misaligned. | **Permanently Discarded** |
| **`REJECT_WHOLE_FRAME`** | `[5]` | Mask captures most or all of the image rather than the target leaf. | **Permanently Discarded** |
| **`UNCERTAIN`** | `[6]` | Image quality, lighting, or overlap is too ambiguous for confident classification. | **Escalated to Second Review** |

---

## 5. Reviewer Workflow & Checklist

For every candidate, the reviewer must check:
1. **Single Instance Integrity:** Does the mask enclose exactly one target leaf, rather than a merged cluster of leaves?
2. **Boundary Adherence:** Does the polygon boundary adhere to the true visual leaf margin?
3. **Background Exclusion:** Are soil, background shadows, dry twigs, and non-target leaves excluded?
4. **Boundary Clipping Severity:** If touching the image frame, is at least 85% of the visible lamina captured?
5. **Petiole Adherence:** Is petiole inclusion limited to the immediate leaf base, avoiding long branch stems?
6. **Internal Voids:** Is the leaf interior fully solid without artificial dropouts or holes?
7. **Visual Clarity:** Is image contrast sufficient to definitively confirm the boundary without ambiguity?

### Keyboard Shortcuts
- `[1]`: Record `APPROVED`
- `[2]`: Record `MINOR_REVIEW`
- `[3]`: Record `REJECT_BACKGROUND`
- `[4]`: Record `REJECT_WRONG_BOUNDARY`
- `[5]`: Record `REJECT_WHOLE_FRAME`
- `[6]`: Record `UNCERTAIN`
- `[Q]`: Switch to Preview Overlay
- `[W]`: Switch to Original Image
- `[E]`: Switch to Binary Mask
- `[A]` or `[←]`: Previous Candidate
- `[D]` or `[→]`: Next Candidate

---

## 6. How Progress is Saved & Audit Trails

1. When a decision button is clicked (or shortcut pressed), a JSON record is immediately written to:
   ```
   decisions/decision_<candidate_id>.json
   ```
   containing `candidate_id`, `reviewer_label`, `reviewer_notes`, and UTC `reviewed_at`.
2. Simultaneously, `verification_manifest.csv` is updated atomically with the verification status.
3. If the server is restarted, it automatically detects completed reviews, updates the progress counter, and jumps directly to the next `PENDING` candidate.

---

## 7. Explicit Ground-Truth & Safety Warning

> [!WARNING]
> **HUMAN VERIFICATION RECORDS ONLY — NOT YET A TRAINING DATASET:**
> The decisions recorded in this workspace represent human verification audit records.
> **They do NOT automatically generate a training dataset, alter source files, or initiate model training.**
> A separate, explicitly authorized export protocol must be executed before approved records are formatted into YOLO/COCO datasets for model training.
