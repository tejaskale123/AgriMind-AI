# AgriMind AI — Plant Leaf Detection & Segmentation Component

> **Status:** Isolated Planning & Development Area (Pre-Training / Pre-Integration)  
> **Component Role:** Crop-Agnostic Leaf Localization & Segmentation  
> **Production Isolation:** 100% Isolated from Production Disease Models  

---

## 1. Component Overview & Single Responsibility

The **Plant Leaf Detection / Segmentation** component is a dedicated machine learning module designed to answer a single question:

> **"Where is the plant leaf in this image?"**

### What It Does:
- Localizes the actual plant leaf in an uploaded photo or camera stream.
- Generates a precise binary mask and polygon boundary around the leaf blade.
- Extracts a clean, centered Leaf Region of Interest (ROI) for downstream analysis.
- Enables the UI to display a smooth, aesthetic emerald outline (`#22c55e`) hugging the actual leaf contours.

### What It NEVER Does (Strict Separation of Concerns):
- **It is NOT a disease classifier.** It does not predict Cotton, Soybean, Maize, Wheat, or Pigeon Pea conditions.
- **It is crop-agnostic.** It does not identify whether a leaf belongs to Cotton, Soybean, or Maize (that remains the responsibility of the Crop Validation gate).
- **It does not touch production models.** All 5 existing production disease models remain completely separate and untouched.

---

## 2. Planned End-to-End Pipeline

```
[User Camera Stream / Image Upload]
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 1: PLANT LEAF DETECTION & SEGMENTATION          │
│  (Isolated Lightweight Model, e.g. MobileNetV3-UNet)   │
└────────────────────────────────────────────────────────┘
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
[Valid Leaf Found]   [No Valid Leaf Found]
(Confidence >= 70%)  (Confidence < 70%)
       │                   │
       │                   ▼
       │     ┌───────────────────────────────────────────┐
       │     │  STRICT FAIL-SAFE SECURITY RULE:          │
       │     │  REJECT IMAGE IMMEDIATELY.                │
       │     │  Show: "Image Not Suitable for Analysis". │
       │     │  DO NOT PASS TO DISEASE MODEL.            │
       │     └───────────────────────────────────────────┘
       ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 2: OPENCV CONTOUR SMOOTHING & ROI EXTRACTION    │
│  - cv2.findContours() on segmentation mask             │
│  - cv2.approxPolyDP() for smooth vector outline        │
│  - Return polygon points to UI for green leaf outline  │
│  - Crop leaf ROI with 8% safety padding margin         │
└────────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 3: EXISTING CROP VALIDATION GATE (UNTOUCHED)    │
│  - leaf_validator.py -> validate_crop_match()          │
│  - Verifies leaf matches user-selected crop            │
└────────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 4: EXISTING PRODUCTION DISEASE MODELS           │
│  - IMAGE_TRANSFORM (Resize 224x224, Normalize)         │
│  - Evaluates corresponding crop disease model          │
│    (Cotton / Soybean / Maize / Wheat / Pigeon Pea)     │
└────────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 5: ADVISORY & PERSISTENCE (UNTOUCHED)           │
│  - SQLite detection_history logging                    │
│  - SSE /recommendation/stream (Claude RAG / local DB)  │
│  - Symptoms, Prevention, Immediate Action, Sprays      │
└────────────────────────────────────────────────────────┘
```

---

## 3. Strict Fail-Safe Requirement

```
                    [Leaf Detector Confidence]
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
      Confidence >= 0.70                 Confidence < 0.70
               │                                 │
     [Proceed to Crop Gate]            [REJECT IMAGE]
               │                                 │
     [Run Disease Model]               - Show Error Card
                                       - Never pass to Disease Model
                                       - Never generate predictions
```

> [!CRITICAL]
> **No Bypass Guarantee:**  
> If the leaf detector cannot confidently detect a valid crop leaf ($\text{Confidence} < 0.70$ or leaf area $< 5\%$), the image is **strictly rejected**.  
> The system **must never fallback** to passing the full unverified image to the disease models. This prevents non-leaf objects (faces, hands, furniture, electronics) from ever reaching the disease classifier.

---

## 4. Role of OpenCV

OpenCV (`cv2`) is strictly restricted to geometric and visual post-processing:
1. **Contour Extraction:** Extracts outer boundary coordinates from the model's binary segmentation mask via `cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)`.
2. **Contour Smoothing:** Applies `cv2.approxPolyDP()` to eliminate pixelated stairstep edges and generate a smooth curve.
3. **Vector Outline Generation:** Converts pixel coordinates into normalized coordinates `[[x_norm, y_norm], ...]` for SVG rendering in the UI.
4. **ROI Bounding Box Crop:** Applies an 8% padding margin around the bounding box before passing the cropped leaf image to downstream stages.

*OpenCV is not used to replace the machine learning segmentation backbone.*

---

## 5. Workspace Directory Structure

```
ml/leaf_detection/
├── README.md           # Architecture, integration plan & safety rules (this file)
├── config.py           # Centralized configuration (thresholds, sizes, paths)
├── dataset/            # Future training dataset storage (images & polygon masks)
├── training/           # Future model training & loss calculation scripts
├── inference/          # Future standalone leaf segmentation inference module
├── evaluation/         # Future mAP, IoU, and boundary-accuracy evaluation scripts
└── outputs/            # Future training checkpoints, loss curves, and evaluation logs
```

### Production Model Storage (Isolated):
```
models/
├── cotton_9class_efficientnet_b0.pth          # PRODUCTION (100% Untouched)
├── soybean_11class_efficientnet_b0.pth        # PRODUCTION (100% Untouched)
├── maize_extended_efficientnet_b0.pth         # PRODUCTION (100% Untouched)
├── wheat_efficientnet_b0.pth                  # PRODUCTION (100% Untouched)
├── pigeon_pea_targeted_efficientnet_b0.pth    # PRODUCTION (100% Untouched)
│
└── leaf_detector/                             # ISOLATED NEW DIRECTORY
    └── (Future leaf segmenter weights: leaf_segmenter.onnx / .pth)
```

---

## 6. Production Safety Commitments

1. **Zero Impact on Production Weights:** The 5 production `.pth` disease models are never retrained, fine-tuned, or modified.
2. **Zero Impact on Datasets:** Existing classification datasets in `datasets/` are completely untouched.
3. **Zero Impact on Database:** SQLite schema and `agrimind_history.db` remain untouched.
4. **Zero Impact on Active API:** No changes are made to `backend/app/main.py`, routers, or existing endpoints.
