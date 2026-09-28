"""
AgriMind AI - Multi-Image Leaf Annotation Workflow Server
=========================================================

Phase 3D: Multi-Image Annotation Workflow for 1,800 Candidates

STRICT SAFETY CONSTRAINTS:
- 100% standard library Python (http.server, urllib, json, csv, pathlib) + Pillow
- Zero external package installation required
- Serves candidate images read-only directly from existing paths in datasets/processed/
- Zero source image copy, rename, delete, or modification
- Coordinates strictly mapped and validated in ORIGINAL image dimensions
- Per-candidate modular JSON outputs saved into outputs/
- Supports resume: checks existing annotations, displays them, prevents accidental overwrites
- Does NOT start automatically; run manually with:
    python ml/leaf_detection/annotation/workflow/app.py 8089
"""

import os
import sys
import json
import csv
import mimetypes
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime
from PIL import Image

# =====================================================================
# PATH CONFIGURATION
# =====================================================================

WORKFLOW_DIR = Path(__file__).resolve().parent
STATIC_DIR = WORKFLOW_DIR / "static"
OUTPUTS_DIR = WORKFLOW_DIR / "outputs"
ANNOTATION_ROOT = WORKFLOW_DIR.parent
LEAF_DETECTION_ROOT = ANNOTATION_ROOT.parent
ML_ROOT = LEAF_DETECTION_ROOT.parent
PROJECT_ROOT = ML_ROOT.parent

MANIFEST_PATH = ANNOTATION_ROOT / "manifests" / "annotation_manifest.csv"

# Ensure output directory exists
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================================
# LOAD 1,800 CANDIDATES FROM MANIFEST
# =====================================================================

CANDIDATES = []
CANDIDATE_BY_ID = {}

def load_manifest():
    global CANDIDATES, CANDIDATE_BY_ID
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"Annotation manifest missing: {MANIFEST_PATH}")

    CANDIDATES = []
    CANDIDATE_BY_ID = {}

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            cid = int(r["id"])
            item = {
                "id": cid,
                "crop": r["crop"],
                "source_dataset": r["source_dataset"],
                "source_split": r["source_split"],
                "relative_path": r["relative_path"],
                "filename": r["filename"],
                "sha256": r["sha256"],
                "visual_category": r["visual_category"],
                "annotation_priority": int(r["annotation_priority"]),
                "category": "leaf"
            }
            CANDIDATES.append(item)
            CANDIDATE_BY_ID[cid] = item

    print(f"Loaded {len(CANDIDATES)} candidates from {MANIFEST_PATH.name}.")

load_manifest()


# =====================================================================
# ANNOTATION STORAGE & RESUME HELPERS
# =====================================================================

def get_annotation_file_path(candidate_id: int) -> Path:
    return OUTPUTS_DIR / f"annotation_{candidate_id:04d}.json"


def get_candidate_annotation(candidate_id: int):
    fpath = get_annotation_file_path(candidate_id)
    if fpath.is_file():
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None


def get_candidate_dimensions(candidate: dict) -> tuple:
    """Reads original image dimensions (width, height) without modifying image."""
    img_path = PROJECT_ROOT / candidate["relative_path"]
    with Image.open(img_path) as im:
        return im.size  # (width, height)


def compute_polygon_area(points):
    """Computes polygon area using the Shoelace formula."""
    n = len(points)
    if n < 3:
        return 0.0
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += points[i][0] * points[j][1]
        area -= points[j][0] * points[i][1]
    return abs(area) / 2.0


def validate_polygon_geometry(points, orig_w, orig_h):
    """Strict polygon geometry validator."""
    errors = []
    if not isinstance(points, list) or len(points) < 3:
        errors.append(f"At least 3 vertices required, got {len(points) if isinstance(points, list) else 0}.")
        return False, errors, 0.0

    for idx, pt in enumerate(points):
        if not isinstance(pt, (list, tuple)) or len(pt) != 2:
            errors.append(f"Vertex {idx} must be [x, y], got {pt}")
            continue
        x, y = pt[0], pt[1]
        if not (0 <= x <= orig_w):
            errors.append(f"Vertex {idx} x-coordinate {x} outside [0, {orig_w}]")
        if not (0 <= y <= orig_h):
            errors.append(f"Vertex {idx} y-coordinate {y} outside [0, {orig_h}]")

    area = compute_polygon_area(points)
    if area <= 0.0:
        errors.append(f"Polygon area must be positive, got {area}")

    return len(errors) == 0, errors, area


# =====================================================================
# HTTP REQUEST HANDLER
# =====================================================================

class WorkflowHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        sys.stderr.write(f"[Workflow Server] {format % args}\n")

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # 1. Root / static index.html
        if path == "/" or path == "/index.html":
            index_file = STATIC_DIR / "index.html"
            if not index_file.exists():
                self.send_error(404, "index.html not found")
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(index_file, "rb") as f:
                self.wfile.write(f.read())
            return

        # 2. API -> Overview & Stats
        elif path == "/api/stats":
            annotated_count = 0
            review_count = 0
            for c in CANDIDATES:
                ann = get_candidate_annotation(c["id"])
                if ann:
                    st = ann.get("annotation_status")
                    if st == "ANNOTATED":
                        annotated_count += 1
                    elif st == "REVIEW_REQUIRED":
                        review_count += 1

            total = len(CANDIDATES)
            not_started = total - (annotated_count + review_count)
            payload = {
                "total_candidates": total,
                "annotated": annotated_count,
                "review_required": review_count,
                "not_started": not_started,
                "progress_percent": round((annotated_count / total) * 100, 2) if total > 0 else 0
            }
            self._send_json(payload)
            return

        # 3. API -> List Candidates (with metadata & current status)
        elif path == "/api/candidates":
            crop_filter = query.get("crop", [None])[0]
            status_filter = query.get("status", [None])[0]

            results = []
            for c in CANDIDATES:
                if crop_filter and crop_filter != "ALL" and c["crop"].lower() != crop_filter.lower():
                    continue

                ann = get_candidate_annotation(c["id"])
                current_status = ann.get("annotation_status", "NOT_STARTED") if ann else "NOT_STARTED"

                if status_filter and status_filter != "ALL" and current_status != status_filter:
                    continue

                results.append({
                    "id": c["id"],
                    "crop": c["crop"],
                    "filename": c["filename"],
                    "source_split": c["source_split"],
                    "visual_category": c["visual_category"],
                    "annotation_priority": c["annotation_priority"],
                    "annotation_status": current_status
                })

            self._send_json({"total": len(results), "candidates": results})
            return

        # 4. API -> Single Candidate Detail & Existing Annotation
        elif path.startswith("/api/candidate/"):
            try:
                cid = int(path.split("/")[-1])
            except ValueError:
                self._send_json({"status": "error", "message": "Invalid candidate ID"}, 400)
                return

            if cid not in CANDIDATE_BY_ID:
                self._send_json({"status": "error", "message": f"Candidate ID {cid} not found"}, 404)
                return

            c = CANDIDATE_BY_ID[cid]
            img_path = PROJECT_ROOT / c["relative_path"]
            if not img_path.is_file():
                self._send_json({"status": "error", "message": f"Image file missing on disk: {img_path}"}, 404)
                return

            orig_w, orig_h = get_candidate_dimensions(c)
            existing_ann = get_candidate_annotation(cid)

            payload = {
                "id": c["id"],
                "crop": c["crop"],
                "source_dataset": c["source_dataset"],
                "source_split": c["source_split"],
                "relative_path": c["relative_path"],
                "filename": c["filename"],
                "sha256": c["sha256"],
                "visual_category": c["visual_category"],
                "annotation_priority": c["annotation_priority"],
                "original_width": orig_w,
                "original_height": orig_h,
                "category": "leaf",
                "image_url": f"/api/image/{cid}",
                "annotation_status": existing_ann.get("annotation_status", "NOT_STARTED") if existing_ann else "NOT_STARTED",
                "existing_annotation": existing_ann
            }
            self._send_json(payload)
            return

        # 5. API -> Serve Source Image Read-Only
        elif path.startswith("/api/image/"):
            try:
                cid = int(path.split("/")[-1])
            except ValueError:
                self.send_error(400, "Invalid candidate ID")
                return

            if cid not in CANDIDATE_BY_ID:
                self.send_error(404, "Candidate not found")
                return

            c = CANDIDATE_BY_ID[cid]
            img_path = PROJECT_ROOT / c["relative_path"]
            if not img_path.is_file():
                self.send_error(404, f"Image file missing on disk: {img_path}")
                return

            mime_type, _ = mimetypes.guess_type(str(img_path))
            if not mime_type:
                mime_type = "image/png" if img_path.suffix.lower() == ".png" else "image/jpeg"

            file_size = img_path.stat().st_size
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(file_size))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            with open(img_path, "rb") as f:
                self.wfile.write(f.read())
            return

        else:
            self.send_error(404, "Endpoint not found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Save or Update Polygon Annotation
        if path == "/api/save_annotation":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length <= 0:
                self._send_json({"status": "error", "message": "Empty body"}, 400)
                return

            try:
                raw_body = self.rfile.read(content_length).decode("utf-8")
                data = json.loads(raw_body)
            except Exception as e:
                self._send_json({"status": "error", "message": f"Malformed JSON: {str(e)}"}, 400)
                return

            cid = data.get("candidate_id")
            if cid not in CANDIDATE_BY_ID:
                self._send_json({"status": "error", "message": f"Invalid candidate ID: {cid}"}, 400)
                return

            c = CANDIDATE_BY_ID[cid]
            orig_w, orig_h = get_candidate_dimensions(c)
            target_status = data.get("annotation_status", "ANNOTATED")
            overwrite_confirmed = data.get("overwrite_confirmed", False)

            # Check existing annotation
            existing = get_candidate_annotation(cid)
            if existing and not overwrite_confirmed:
                self._send_json({
                    "status": "warning",
                    "require_confirmation": True,
                    "message": f"Candidate #{cid} already has a saved annotation with {existing.get('point_count', 0)} points. Explicit confirmation required to overwrite."
                }, 200)
                return

            # Validate geometry
            points = data.get("points", [])
            is_valid, errors, area = validate_polygon_geometry(points, orig_w, orig_h)
            if not is_valid:
                self._send_json({
                    "status": "error",
                    "message": "Polygon geometry validation failed",
                    "errors": errors
                }, 422)
                return

            # Compute bounding box [min_x, min_y, width, height]
            xs = [p[0] for p in points]
            ys = [p[1] for p in points]
            min_x, max_x = min(xs), max(xs)
            min_y, max_y = min(ys), max(ys)
            bbox = [min_x, min_y, max_x - min_x, max_y - min_y]

            # Build standardized annotation record
            now_iso = datetime.utcnow().isoformat() + "Z"
            output_payload = {
                "candidate_id": c["id"],
                "crop": c["crop"],
                "source_dataset": c["source_dataset"],
                "source_split": c["source_split"],
                "filename": c["filename"],
                "relative_path": c["relative_path"],
                "sha256": c["sha256"],
                "original_width": orig_w,
                "original_height": orig_h,
                "category": "leaf",
                "polygon_coordinates": points,
                "point_count": len(points),
                "bbox": bbox,
                "polygon_area_pixels": round(area, 2),
                "is_closed": True,
                "annotation_status": target_status,
                "reviewer_notes": data.get("notes", ""),
                "created_at": existing.get("created_at", now_iso) if existing else now_iso,
                "updated_at": now_iso
            }

            out_file = get_annotation_file_path(cid)
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(output_payload, f, indent=2)

            self._send_json({
                "status": "success",
                "message": f"Candidate #{cid} ({c['crop']}) successfully saved!",
                "saved_file": str(out_file.relative_to(PROJECT_ROOT)),
                "candidate_id": cid,
                "point_count": len(points),
                "area_pixels": round(area, 2),
                "annotation_status": target_status
            }, 200)
            return

        # Mark candidate status directly (e.g. flag for REVIEW_REQUIRED)
        elif path == "/api/update_status":
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(raw_body)
            cid = data.get("candidate_id")
            new_status = data.get("annotation_status", "REVIEW_REQUIRED")

            if cid not in CANDIDATE_BY_ID:
                self._send_json({"status": "error", "message": f"Invalid candidate ID: {cid}"}, 400)
                return

            c = CANDIDATE_BY_ID[cid]
            orig_w, orig_h = get_candidate_dimensions(c)
            existing = get_candidate_annotation(cid) or {}
            now_iso = datetime.utcnow().isoformat() + "Z"

            existing.update({
                "candidate_id": c["id"],
                "crop": c["crop"],
                "source_dataset": c["source_dataset"],
                "source_split": c["source_split"],
                "filename": c["filename"],
                "relative_path": c["relative_path"],
                "sha256": c["sha256"],
                "original_width": orig_w,
                "original_height": orig_h,
                "category": "leaf",
                "annotation_status": new_status,
                "reviewer_notes": data.get("notes", ""),
                "updated_at": now_iso
            })

            out_file = get_annotation_file_path(cid)
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(existing, f, indent=2)

            self._send_json({
                "status": "success",
                "message": f"Candidate #{cid} status updated to {new_status}.",
                "annotation_status": new_status
            })
            return

        else:
            self.send_error(404, "Endpoint not found")

    def _send_json(self, payload, code=200):
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


# =====================================================================
# SERVER RUNNER (CALLED MANUALLY BY USER)
# =====================================================================

def run_server(port=8089):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, WorkflowHandler)
    print("=" * 70)
    print("AGRIMIND AI - MULTI-IMAGE LEAF ANNOTATION WORKFLOW SERVER")
    print("=" * 70)
    print(f"Total Candidates : {len(CANDIDATES)}")
    print(f"Crops Loaded     : Cotton (360), Soybean (360), Maize (360), Wheat (360), Pigeon Pea (360)")
    print(f"Server URL       : http://127.0.0.1:{port}/")
    print("Press Ctrl+C to terminate the workflow server.")
    print("=" * 70)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nWorkflow server stopped safely.")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8089
    run_server(port)
