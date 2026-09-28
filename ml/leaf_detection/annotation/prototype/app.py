"""
AgriMind AI - Prototype Leaf Annotation Server
==============================================

Phase 3C: Local Browser Polygon Annotation Prototype

STRICT SAFETY CONSTRAINTS:
- 100% standard library Python (http.server, urllib, json, pathlib)
- Zero external package installation required
- Serves candidate images read-only directly from existing paths
- Zero source image copy, rename, delete, or modification
- Validates polygon coordinates strictly in ORIGINAL image coordinates
- Saves prototype validation JSON into outputs/
- Does NOT start automatically; run manually with:
    python ml/leaf_detection/annotation/prototype/app.py
"""

import os
import sys
import json
import csv
import mimetypes
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# =====================================================================
# PATH CONFIGURATION
# =====================================================================

PROTOTYPE_DIR = Path(__file__).resolve().parent
STATIC_DIR = PROTOTYPE_DIR / "static"
OUTPUTS_DIR = PROTOTYPE_DIR / "outputs"
ANNOTATION_ROOT = PROTOTYPE_DIR.parent
LEAF_DETECTION_ROOT = ANNOTATION_ROOT.parent
ML_ROOT = LEAF_DETECTION_ROOT.parent
PROJECT_ROOT = ML_ROOT.parent

MANIFEST_PATH = ANNOTATION_ROOT / "manifests" / "annotation_manifest.csv"

# Ensure output directory exists
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================================
# LOAD FIRST COTTON CANDIDATE
# =====================================================================

def get_first_cotton_candidate():
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"Manifest not found: {MANIFEST_PATH}")

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            if r["crop"] == "Cotton":
                img_path = PROJECT_ROOT / r["relative_path"]
                if not img_path.is_file():
                    raise FileNotFoundError(f"Image file does not exist on disk: {img_path}")
                return {
                    "id": int(r["id"]),
                    "crop": r["crop"],
                    "source_dataset": r["source_dataset"],
                    "source_split": r["source_split"],
                    "relative_path": r["relative_path"],
                    "filename": r["filename"],
                    "sha256": r["sha256"],
                    "visual_category": r["visual_category"],
                    "annotation_priority": int(r["annotation_priority"]),
                    "width": 700,   # Verified via PIL in Phase 3C audit
                    "height": 700,  # Verified via PIL in Phase 3C audit
                    "absolute_path": str(img_path)
                }
    raise ValueError("No Cotton candidate found in annotation_manifest.csv")


SELECTED_CANDIDATE = get_first_cotton_candidate()


# =====================================================================
# GEOMETRY VALIDATION HELPERS
# =====================================================================

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


def validate_annotation(data, orig_w, orig_h):
    """
    Validates prototype annotation points:
    1. Points list exists and has at least 3 vertices
    2. Coordinates non-negative and strictly within original image bounds
    3. Polygon has positive non-zero area
    4. Target category is strictly 'leaf'
    """
    errors = []

    if data.get("category") != "leaf":
        errors.append(f"Invalid category: {data.get('category')}. Expected 'leaf'.")

    points = data.get("points", [])
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

class PrototypeHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[Prototype Server] {format % args}\n")

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. Root -> Index UI
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

        # 2. API -> Candidate metadata
        elif path == "/api/candidate":
            payload = {
                "id": SELECTED_CANDIDATE["id"],
                "crop": SELECTED_CANDIDATE["crop"],
                "filename": SELECTED_CANDIDATE["filename"],
                "relative_path": SELECTED_CANDIDATE["relative_path"],
                "width": SELECTED_CANDIDATE["width"],
                "height": SELECTED_CANDIDATE["height"],
                "category": "leaf",
                "image_url": "/api/image"
            }
            body = json.dumps(payload, indent=2).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # 3. API -> Read-Only Image Serve
        elif path == "/api/image":
            img_path = Path(SELECTED_CANDIDATE["absolute_path"])
            if not img_path.is_file():
                self.send_error(404, f"Source image missing: {img_path}")
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

        # 4. Unknown endpoint
        else:
            self.send_error(404, "Endpoint not found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

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

            # Strict validation
            orig_w = SELECTED_CANDIDATE["width"]
            orig_h = SELECTED_CANDIDATE["height"]
            is_valid, errors, area = validate_annotation(data, orig_w, orig_h)

            if not is_valid:
                self._send_json({
                    "status": "error",
                    "message": "Validation failed",
                    "errors": errors
                }, 422)
                return

            # Build final prototype output JSON
            output_payload = {
                "prototype_version": "1.0",
                "image_filename": SELECTED_CANDIDATE["filename"],
                "relative_path": SELECTED_CANDIDATE["relative_path"],
                "sha256": SELECTED_CANDIDATE["sha256"],
                "original_width": orig_w,
                "original_height": orig_h,
                "category": "leaf",
                "polygon_coordinates": data["points"],
                "point_count": len(data["points"]),
                "polygon_area_pixels": round(area, 2),
                "is_closed": True,
                "annotation_status": "PROTOTYPE_VALIDATED",
                "notes": "Verified in Phase 3C local prototype environment"
            }

            out_file = OUTPUTS_DIR / "prototype_cotton_test_annotation.json"
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(output_payload, f, indent=2)

            self._send_json({
                "status": "success",
                "message": "Prototype polygon annotation successfully validated and saved!",
                "saved_file": str(out_file.relative_to(PROJECT_ROOT)),
                "point_count": len(data["points"]),
                "area_pixels": round(area, 2)
            }, 200)
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

def run_server(port=8088):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, PrototypeHandler)
    print("=" * 70)
    print("AGRIMIND AI - PROTOTYPE LEAF ANNOTATION SERVER")
    print("=" * 70)
    print(f"Target Image : {SELECTED_CANDIDATE['filename']} ({SELECTED_CANDIDATE['crop']})")
    print(f"Resolution   : {SELECTED_CANDIDATE['width']} x {SELECTED_CANDIDATE['height']}")
    print(f"Server URL   : http://127.0.0.1:{port}/")
    print("Press Ctrl+C to terminate the prototype server.")
    print("=" * 70)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nPrototype server stopped safely.")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
    run_server(port)
