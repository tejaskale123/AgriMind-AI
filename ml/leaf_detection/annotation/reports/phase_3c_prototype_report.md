# AGRIMIND AI — PHASE 3C
## SAFE SINGLE-IMAGE ANNOTATION PROTOTYPE REPORT

**Execution Date**: September 26, 2026  
**Phase**: 3C — Safe Single-Image Annotation Prototype  
**Workspace Root**: `ml/leaf_detection/annotation/prototype/`  
**Input Manifest**: `ml/leaf_detection/annotation/manifests/annotation_manifest.csv`  

---

### 1. Selected Test Image Details
From `annotation_manifest.csv`, the first Cotton candidate was selected for the prototype:
- **Candidate ID**: `1`
- **Crop**: `Cotton`
- **Source Dataset**: `cotton_final`
- **Source Split**: `test`
- **Relative Path**: `datasets/processed/cotton_final/test/Alternaria Leaf Spot/alternaria_(100).png`
- **Filename**: `alternaria_(100).png`
- **SHA-256**: `7373e7bcee92eb641fd7d2de03eba850d03dfdfccadd127a3a2cd5da52516b91`
- **Visual Category**: `MEDIUM` (Priority 2)
- **Original Dimensions**: **700 × 700 pixels** (Aspect ratio 1:1)
- **Disk Existence**: Verified on disk, 100% read-only.

---

### 2. Prototype Files Created

| Path | Purpose | Dependencies |
| :--- | :--- | :--- |
| `ml/leaf_detection/annotation/prototype/app.py` | Lightweight HTTP & API server | Standard library Python (`http.server`, `urllib`, `json`, `pathlib`) — 0 third-party packages |
| `ml/leaf_detection/annotation/prototype/static/index.html` | Client-side Canvas annotation interface | HTML5 Canvas, Vanilla JavaScript, CSS3 — 0 external JS libraries, 0 npm packages |
| `ml/leaf_detection/annotation/prototype/outputs/.gitkeep` | Output placeholder directory | N/A |
| `ml/leaf_detection/annotation/prototype/README.md` | Prototype documentation & labeling protocol | Markdown |
| `ml/leaf_detection/annotation/reports/phase_3c_prototype_report.md` | Formal Phase 3C audit report | Markdown |

---

### 3. Annotation UI Functionality
The prototype interface (`index.html`) provides a responsive, desktop-friendly labeling workflow:
1. **Aspect-Ratio Preserved Display**: Automatically scales the $700 \times 700$ image to fit the browser viewport without distortion.
2. **Point Placement**: Clicking on the leaf contour places polygon vertices along the visible exterior margin.
3. **Real-Time Visual Feedback**:
   - Connecting lines between vertices.
   - Distinct vertex markers (4px radius white circles with emerald borders).
   - Prominent gold starting-vertex handle (6px radius) indicating where to close the contour.
   - Semi-transparent emerald overlay fill upon polygon closure.
4. **Interactive Controls**:
   - **Undo Point**: Removes the most recently placed vertex (`Ctrl+Z` / `Z`).
   - **Reset Polygon**: Clears all points to restart (`Escape` / `R`).
   - **Close Polygon**: Connects the final vertex back to vertex #1 (`Enter` / `C` or clicking the first vertex).
   - **Save Annotation**: Validates geometry and transmits the coordinates to the prototype backend (`S`).
5. **Class Isolation**: Hardcoded to single target class **`leaf`** (Category ID: `1`). No multi-class selection options exist.
6. **Accidental Multi-Object Prevention**: The canvas permits only one active closed polygon at a time for this prototype.

---

### 4. Coordinate System & Geometry Preservation
- **Original Space Transformation**: Although rendered on an HTML5 canvas scaled to viewport dimensions, clicks are translated back to original image space using:
  $$\text{origX} = \text{round}\left(\text{canvasClickX} \times \frac{W_{\text{orig}}}{\text{canvasWidth}}\right)$$
  $$\text{origY} = \text{round}\left(\text{canvasClickY} \times \frac{H_{\text{orig}}}{\text{canvasHeight}}\right)$$
- **Zero Coordinate Resizing**: Coordinates saved to `outputs/` strictly range between $[0, 700]$ along both axes. Resizing to $256 \times 256$ is explicitly prohibited at the annotation layer and belongs exclusively to model training preprocessing.

---

### 5. Validation Rules
Both the client-side JavaScript and server-side Python enforce the following strict criteria:
- **Vertex Threshold**: At least 3 non-collinear vertices required ($\ge 3$).
- **Polygon Closure**: Polygon must be explicitly closed before saving.
- **Bounding Box Bounds**: $0 \le x \le 700$ and $0 \le y \le 700$ for all vertices.
- **Non-Negative Coordinates**: Negative values trigger an immediate validation failure.
- **Positive Non-Zero Area**: Calculated via the Shoelace formula ($A = \frac{1}{2} \left| \sum (x_i y_{i+1} - x_{i+1} y_i) \right| > 0$).
- **Category Match**: Category must strictly equal `"leaf"`.

---

### 6. System & Safety Confirmations

| Metric | Verification Result |
| :--- | :---: |
| **Source image files copied** | **NO (0)** |
| **Source image files moved** | **NO (0)** |
| **Source image files deleted** | **NO (0)** |
| **Source image files renamed** | **NO (0)** |
| **Source image files modified / resized** | **NO (0)** |
| **Datasets modified (`datasets/processed/`)** | **NO** |
| **Production disease models modified (`models/`)** | **NO** |
| **Backend services modified (`backend/`)** | **NO** |
| **Frontend application modified (`frontend-exp/`)** | **NO** |
| **SQLite database modified (`agrimind_history.db`)** | **NO** |
| **Python packages installed** | **NO (0)** |
| **External models downloaded** | **NO (0)** |
| **Model training executed** | **NO (0)** |
| **Production integration performed** | **NO** |
| **Mass annotation performed** | **NO (0 of 1,800 annotated)** |
| **Server started automatically** | **NO (Manual startup only)** |
| **Browser opened automatically** | **NO** |

---

### 7. Git Safety Status
- **Pre-Execution Git Status**: `?? ml/leaf_detection/`
- **Post-Execution Git Status**: `?? ml/leaf_detection/`
- **Git Staging**: None (`git add` was not executed)
- **Git Commits**: None (`git commit` was not executed)
- **Git Push**: None (`git push` was not executed)

---

### FINAL SAFETY STATEMENT

No source images were copied.  
No source images were moved.  
No source images were deleted.  
No source images were modified.  
Datasets were not modified.  
Production models were not modified.  
Backend was not modified.  
Frontend was not modified.  
Database was not modified.  
Packages were not installed.  
Models were not downloaded.  
Training was not performed.  
Application integration was not performed.  
Git commit was not created.  
Git push was not performed.
