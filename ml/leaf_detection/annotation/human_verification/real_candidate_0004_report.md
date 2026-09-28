# AgriMind-AI — Real Candidate #0004 Human Verification Report

**Phase:** PHASE 1: ONE REAL CANDIDATE ONLY  
**Date & System Timestamp:** 2026-09-27  
**Candidate Evaluated:** Candidate `#0004` ONLY  
**Review Type:** Real Human Visual Verification Inspection  
**Safety Mode:** Strictly Read-Only (Zero Codebase / Source Dataset Mutations — Zero Training)  

---

## 1. Candidate Identity & Provenance

- **Candidate ID:** `0004` (Internal ID: `4`)
- **Crop:** Cotton
- **Population:** Population A (`FINAL_CANDIDATE_PENDING_HUMAN_VERIFICATION`)
- **Source Dataset:** `cotton_final`
- **Source Split:** `test`
- **Image Path:** `datasets/processed/cotton_final/test/Alternaria Leaf Spot/alternaria_(115).png`
- **Mask Path:** `ml/leaf_detection/annotation/automatic_test/full_run/outputs/masks/mask_0004_alternaria_(115).png`
- **Preview Path:** `ml/leaf_detection/annotation/automatic_test/full_run/outputs/previews/preview_0004_alternaria_(115).png`
- **Annotation JSON Path:** `ml/leaf_detection/annotation/automatic_test/full_run/outputs/json/annotation_0004.json`
- **Confidence Score:** 0.899
- **Area Ratio:** 0.2032
- **Solidity:** 0.869

---

## 2. Human Verification Decision

| Attribute | Verified Value | Description / Operational Meaning |
| :--- | :--- | :--- |
| **Human Decision Label** | **`MINOR_REVIEW`** | Selected explicitly by human reviewer from the 6 ratified decision labels. |
| **Reviewer Notes** | *\"Main leaf is captured, but shadow at the bottom boundary requires trimming\"* | Visual inspection confirms upper leaf lobes are cleanly bounded, but polygon boundary extends downward into the cast background shadow. |
| **Reviewed At (UTC)** | `2026-09-27T01:27:00Z` | Standard ISO 8601 audit timestamp. |
| **Decision Record File** | [`decisions/decision_0004.json`](file:///c:/Users/admin/OneDrive/Documents/Desktop/AgriMind-AI/ml/leaf_detection/annotation/human_verification/decisions/decision_0004.json) | Standalone JSON audit record. |
| **Decisions Count in Directory** | **Exactly 1 file** | `decision_0004.json` (plus `.gitkeep`). No other candidate processed. |

---

## 3. Strict Safety & Integrity Verification

Automated integrity verification confirmed all 7 safety criteria:

1. **Exactly One Decision Record:** Confirmed. Only `decision_0004.json` exists in `decisions/`.
2. **No Other Candidates Processed:** Confirmed. Zero decisions recorded for Candidate #0005 or any of the remaining 230 candidates.
3. **Verification Manifest Unchanged:** Confirmed. `verification_manifest.csv` remains strictly untouched (SHA-256: `295dd8fb317b8da408ed9107c3177c45e68fb4a378f125339bd3f0349aedfad6`).
4. **Original Source Files Intact:** Confirmed. Raw image, binary mask, preview overlay, and annotation JSON SHA-256 hashes matched pre-test baselines 100%.
5. **No Production Codebase / Model Modifications:** Confirmed. `backend/`, `frontend-exp/`, `models/`, and application databases remain unmodified.
6. **No Training or Dataset Generation:** Confirmed. Zero training runs initiated; zero COCO/YOLO training datasets exported.
7. **Immediate Process Termination:** Confirmed. The reviewer server process has been shut down. Execution stopped.
