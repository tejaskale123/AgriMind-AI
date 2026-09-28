"""
AgriMind-AI — Human Verification Review Application
===================================================
Standalone Local Review Server (100% Standard Library Python)

STRICT SAFETY:
- Read-only media serving from existing paths
- Zero external package dependencies (http.server, json, csv, urllib)
- Saves human decision records safely to decisions/ and updates verification_manifest.csv
- Does NOT train any model or generate training datasets

Usage:
    python ml/leaf_detection/annotation/human_verification/review_app.py
    Open browser at: http://127.0.0.1:8088
"""

import sys
import os
import json
import csv
import mimetypes
from datetime import datetime
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Import configuration
try:
    from config import (
        BASE_DIR, PROJECT_ROOT, MANIFEST_PATH, DECISIONS_DIR,
        SERVER_HOST, SERVER_PORT, DECISION_LABELS, LABEL_DESCRIPTIONS
    )
except ImportError:
    BASE_DIR = Path(__file__).resolve().parent
    PROJECT_ROOT = BASE_DIR.parents[3]
    MANIFEST_PATH = BASE_DIR / "verification_manifest.csv"
    DECISIONS_DIR = BASE_DIR / "decisions"
    SERVER_HOST = "127.0.0.1"
    SERVER_PORT = 8088
    DECISION_LABELS = [
        "APPROVED", "MINOR_REVIEW", "REJECT_BACKGROUND",
        "REJECT_WRONG_BOUNDARY", "REJECT_WHOLE_FRAME", "UNCERTAIN"
    ]
    LABEL_DESCRIPTIONS = {
        "APPROVED": "Single target leaf correctly segmented; background excluded.",
        "MINOR_REVIEW": "Main leaf correct; small boundary/tip clipping at border.",
        "REJECT_BACKGROUND": "Significant soil, background, or adjacent foliage included.",
        "REJECT_WRONG_BOUNDARY": "Polygon does not follow actual leaf boundary.",
        "REJECT_WHOLE_FRAME": "Segmentation captures full image rather than leaf.",
        "UNCERTAIN": "Reviewer cannot confidently decide."
    }

DECISIONS_DIR.mkdir(parents=True, exist_ok=True)

# Cache manifest in memory
def load_manifest():
    if not MANIFEST_PATH.exists():
        return []
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

def save_manifest(rows):
    if not rows:
        return
    fieldnames = list(rows[0].keys())
    # Atomic write via temp file
    temp_path = MANIFEST_PATH.with_suffix(".tmp")
    with open(temp_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    temp_path.replace(MANIFEST_PATH)

def get_stats():
    candidates = load_manifest()
    total = len(candidates)
    reviewed = sum(1 for c in candidates if c.get("verification_status") == "REVIEWED")
    pending = total - reviewed
    label_counts = {lbl: 0 for lbl in DECISION_LABELS}
    for c in candidates:
        lbl = c.get("reviewer_label")
        if lbl in label_counts:
            label_counts[lbl] += 1
    return {
        "total": total,
        "reviewed": reviewed,
        "pending": pending,
        "progress_pct": round((reviewed / total) * 100, 1) if total > 0 else 0,
        "labels": label_counts
    }

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AgriMind-AI — Human Verification Workspace</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg-dark: #0b1118;
  --panel-bg: #141f2c;
  --card-bg: #1a293a;
  --border-color: #2b3e52;
  --text-main: #f0f6fc;
  --text-muted: #8b9bb0;
  --accent-green: #10b981;
  --accent-amber: #f59e0b;
  --accent-red: #ef4444;
  --accent-orange: #f97316;
  --accent-purple: #8b5cf6;
  --accent-gray: #64748b;
  --accent-blue: #38bdf8;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-main);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
header {
  background: var(--panel-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand { display: flex; align-items: center; gap: 12px; }
.brand h1 { font-size: 1.15rem; font-weight: 700; color: var(--accent-green); letter-spacing: -0.5px; }
.badge { background: #064e3b; color: #6ee7b7; font-size: 0.72rem; padding: 3px 8px; border-radius: 999px; font-weight: 600; }
.progress-bar-container { flex: 1; max-width: 420px; margin: 0 30px; }
.progress-meta { display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px; color: var(--text-muted); }
.progress-bar-track { background: var(--card-bg); height: 8px; border-radius: 999px; overflow: hidden; border: 1px solid var(--border-color); }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, #10b981, #38bdf8); width: 0%; transition: width 0.3s ease; }
.nav-controls { display: flex; align-items: center; gap: 10px; }
button {
  background: var(--card-bg); color: var(--text-main); border: 1px solid var(--border-color);
  padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;
  transition: all 0.15s ease;
}
button:hover { background: var(--border-color); }
button.active { border-color: var(--accent-blue); }
main { flex: 1; display: grid; grid-template-columns: 1fr 380px; gap: 15px; padding: 15px; overflow: hidden; }
.visual-area { display: flex; flex-direction: column; gap: 10px; height: 100%; }
.tab-controls { display: flex; gap: 8px; }
.tab-btn { padding: 6px 16px; border-radius: 6px; font-size: 0.82rem; }
.tab-btn.active { background: var(--accent-blue); color: #04101e; border-color: var(--accent-blue); font-weight: 600; }
.viewport-card {
  flex: 1; background: var(--panel-bg); border: 1px solid var(--border-color); border-radius: 8px;
  position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.image-canvas-container { position: relative; max-width: 100%; max-height: 100%; display: flex; align-items: center; justify-content: center; }
.viewport-img { max-width: 100%; max-height: calc(100vh - 170px); object-fit: contain; border-radius: 4px; display: block; }
.svg-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
.sidebar {
  background: var(--panel-bg); border: 1px solid var(--border-color); border-radius: 8px;
  display: flex; flex-direction: column; gap: 15px; padding: 18px; overflow-y: auto;
}
.meta-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; }
.meta-card h3 { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem; }
.meta-item span:first-child { color: var(--text-muted); display: block; font-size: 0.72rem; }
.meta-item span:last-child { font-weight: 600; color: #fff; }
.decision-panel { display: flex; flex-direction: column; gap: 8px; }
.decision-btn {
  padding: 10px 14px; text-align: left; font-size: 0.85rem; border-radius: 6px; display: flex;
  justify-content: space-between; align-items: center; font-weight: 600;
}
.decision-btn span.key { font-size: 0.72rem; opacity: 0.75; padding: 2px 6px; background: rgba(0,0,0,0.3); border-radius: 4px; }
.btn-approved { border-color: var(--accent-green); color: #34d399; }
.btn-approved:hover, .btn-approved.selected { background: #064e3b; color: #6ee7b7; }
.btn-minor { border-color: var(--accent-amber); color: #fbbf24; }
.btn-minor:hover, .btn-minor.selected { background: #78350f; color: #fde68a; }
.btn-reject-bg { border-color: var(--accent-red); color: #f87171; }
.btn-reject-bg:hover, .btn-reject-bg.selected { background: #7f1d1d; color: #fca5a5; }
.btn-reject-boundary { border-color: var(--accent-orange); color: #fb923c; }
.btn-reject-boundary:hover, .btn-reject-boundary.selected { background: #7c2d12; color: #fdba74; }
.btn-reject-frame { border-color: var(--accent-purple); color: #c084fc; }
.btn-reject-frame:hover, .btn-reject-frame.selected { background: #581c87; color: #e9d5ff; }
.btn-uncertain { border-color: var(--accent-gray); color: #94a3b8; }
.btn-uncertain:hover, .btn-uncertain.selected { background: #334155; color: #e2e8f0; }
.notes-input {
  width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-main);
  padding: 10px; border-radius: 6px; resize: vertical; min-height: 65px; font-family: inherit; font-size: 0.82rem;
}
.notes-input:focus { outline: none; border-color: var(--accent-blue); }
.status-pill { padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
.status-pending { background: #334155; color: #94a3b8; }
.status-reviewed { background: #064e3b; color: #34d399; }
</style>
</head>
<body>

<header>
  <div class="brand">
    <h1>AgriMind-AI</h1>
    <span class="badge">Human Verification Workspace</span>
  </div>
  <div class="progress-bar-container">
    <div class="progress-meta">
      <span id="progress-text">Loading verification progress...</span>
      <span id="progress-pct">0%</span>
    </div>
    <div class="progress-bar-track">
      <div id="progress-bar-fill" class="progress-bar-fill"></div>
    </div>
  </div>
  <div class="nav-controls">
    <button id="prev-btn" onclick="prevCandidate()">← Previous [A]</button>
    <select id="jump-select" onchange="jumpToCandidate(this.value)" style="background:var(--card-bg);color:#fff;border:1px solid var(--border-color);padding:6px;border-radius:6px;font-size:0.82rem;">
    </select>
    <button id="next-btn" onclick="nextCandidate()">Next [D] →</button>
  </div>
</header>

<main>
  <div class="visual-area">
    <div class="tab-controls">
      <button class="tab-btn active" onclick="switchView('preview')">Preview Overlay [Q]</button>
      <button class="tab-btn" onclick="switchView('original')">Original Image [W]</button>
      <button class="tab-btn" onclick="switchView('mask')">Binary Mask [E]</button>
    </div>
    <div class="viewport-card">
      <div class="image-canvas-container" id="container">
        <img id="main-img" class="viewport-img" src="" alt="Candidate Visual">
        <svg id="svg-overlay" class="svg-overlay"></svg>
      </div>
    </div>
  </div>

  <aside class="sidebar">
    <div class="meta-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h3>Candidate Details</h3>
        <span id="candidate-status" class="status-pill status-pending">PENDING</span>
      </div>
      <div class="meta-grid">
        <div class="meta-item"><span>Candidate ID</span><span id="m-cid">#0000</span></div>
        <div class="meta-item"><span>Crop</span><span id="m-crop">--</span></div>
        <div class="meta-item"><span>Population</span><span id="m-pop">--</span></div>
        <div class="meta-item"><span>Source Split</span><span id="m-split">--</span></div>
        <div class="meta-item"><span>Confidence</span><span id="m-conf">0.00</span></div>
        <div class="meta-item"><span>Area Ratio</span><span id="m-area">0.00</span></div>
        <div class="meta-item"><span>Solidity</span><span id="m-sol">0.00</span></div>
        <div class="meta-item"><span>Source Type</span><span id="m-src">--</span></div>
      </div>
    </div>

    <div>
      <h3 style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;">Decision Labels</h3>
      <div class="decision-panel">
        <button class="decision-btn btn-approved" onclick="recordDecision('APPROVED')">APPROVED <span class="key">[1]</span></button>
        <button class="decision-btn btn-minor" onclick="recordDecision('MINOR_REVIEW')">MINOR_REVIEW <span class="key">[2]</span></button>
        <button class="decision-btn btn-reject-bg" onclick="recordDecision('REJECT_BACKGROUND')">REJECT_BACKGROUND <span class="key">[3]</span></button>
        <button class="decision-btn btn-reject-boundary" onclick="recordDecision('REJECT_WRONG_BOUNDARY')">REJECT_WRONG_BOUNDARY <span class="key">[4]</span></button>
        <button class="decision-btn btn-reject-frame" onclick="recordDecision('REJECT_WHOLE_FRAME')">REJECT_WHOLE_FRAME <span class="key">[5]</span></button>
        <button class="decision-btn btn-uncertain" onclick="recordDecision('UNCERTAIN')">UNCERTAIN <span class="key">[6]</span></button>
      </div>
    </div>

    <div>
      <h3 style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;">Reviewer Notes</h3>
      <textarea id="notes" class="notes-input" placeholder="Enter boundary, margin, or overlap observations..."></textarea>
    </div>
  </aside>
</main>

<script>
let candidates = [];
let currentIndex = 0;
let currentView = 'preview';

async function init() {
  const res = await fetch('/api/candidates');
  candidates = await res.json();
  populateJumpSelect();
  
  // Resume from first pending candidate
  const firstPending = candidates.findIndex(c => c.verification_status === 'PENDING');
  currentIndex = firstPending !== -1 ? firstPending : 0;
  
  loadCurrentCandidate();
  updateStats();
}

function populateJumpSelect() {
  const sel = document.getElementById('jump-select');
  sel.innerHTML = '';
  candidates.forEach((c, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    const mark = c.verification_status === 'REVIEWED' ? '✓' : '•';
    opt.textContent = `${mark} #${String(c.candidate_id).padStart(4,'0')} (${c.crop} - ${c.population})`;
    sel.appendChild(opt);
  });
}

async function loadCurrentCandidate() {
  if (candidates.length === 0) return;
  const c = candidates[currentIndex];
  document.getElementById('jump-select').value = currentIndex;
  
  // Populate metadata
  document.getElementById('m-cid').textContent = '#' + String(c.candidate_id).padStart(4, '0');
  document.getElementById('m-crop').textContent = c.crop;
  document.getElementById('m-pop').textContent = c.population;
  document.getElementById('m-split').textContent = c.source_split;
  document.getElementById('m-conf').textContent = parseFloat(c.confidence).toFixed(3);
  document.getElementById('m-area').textContent = parseFloat(c.area_ratio).toFixed(3);
  document.getElementById('m-sol').textContent = parseFloat(c.solidity).toFixed(3);
  document.getElementById('m-src').textContent = c.source;
  
  const statusEl = document.getElementById('candidate-status');
  if (c.verification_status === 'REVIEWED') {
    statusEl.textContent = c.reviewer_label;
    statusEl.className = 'status-pill status-reviewed';
  } else {
    statusEl.textContent = 'PENDING';
    statusEl.className = 'status-pill status-pending';
  }
  
  document.getElementById('notes').value = c.reviewer_notes || '';
  
  // Highlight selected button
  document.querySelectorAll('.decision-btn').forEach(btn => btn.classList.remove('selected'));
  if (c.reviewer_label && c.reviewer_label !== 'UNREVIEWED') {
    const activeBtn = Array.from(document.querySelectorAll('.decision-btn')).find(b => b.textContent.includes(c.reviewer_label));
    if (activeBtn) activeBtn.classList.add('selected');
  }
  
  updateImage();
}

function updateImage() {
  const c = candidates[currentIndex];
  let path = '';
  if (currentView === 'preview') path = c.preview_path;
  else if (currentView === 'original') path = c.original_relative_path;
  else if (currentView === 'mask') path = c.mask_path;
  
  const img = document.getElementById('main-img');
  img.src = '/api/media?path=' + encodeURIComponent(path);
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  updateImage();
}

async function recordDecision(label) {
  const c = candidates[currentIndex];
  const notes = document.getElementById('notes').value;
  
  const payload = {
    candidate_id: c.candidate_id,
    reviewer_label: label,
    reviewer_notes: notes
  };
  
  const res = await fetch('/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (res.ok) {
    c.verification_status = 'REVIEWED';
    c.reviewer_label = label;
    c.reviewer_notes = notes;
    populateJumpSelect();
    updateStats();
    nextCandidate();
  }
}

function prevCandidate() {
  if (currentIndex > 0) {
    currentIndex--;
    loadCurrentCandidate();
  }
}

function nextCandidate() {
  if (currentIndex < candidates.length - 1) {
    currentIndex++;
    loadCurrentCandidate();
  }
}

function jumpToCandidate(idx) {
  currentIndex = parseInt(idx, 10);
  loadCurrentCandidate();
}

async function updateStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();
  document.getElementById('progress-text').textContent = `${data.reviewed} / ${data.total} Reviewed`;
  document.getElementById('progress-pct').textContent = `${data.progress_pct}%`;
  document.getElementById('progress-bar-fill').style.width = `${data.progress_pct}%`;
}

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
  if (e.key === '1') recordDecision('APPROVED');
  else if (e.key === '2') recordDecision('MINOR_REVIEW');
  else if (e.key === '3') recordDecision('REJECT_BACKGROUND');
  else if (e.key === '4') recordDecision('REJECT_WRONG_BOUNDARY');
  else if (e.key === '5') recordDecision('REJECT_WHOLE_FRAME');
  else if (e.key === '6') recordDecision('UNCERTAIN');
  else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') prevCandidate();
  else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') nextCandidate();
  else if (e.key === 'q' || e.key === 'Q') { currentView = 'preview'; updateImage(); }
  else if (e.key === 'w' || e.key === 'W') { currentView = 'original'; updateImage(); }
  else if (e.key === 'e' || e.key === 'E') { currentView = 'mask'; updateImage(); }
});

window.onload = init;
</script>
</body>
</html>
"""

class ReviewServerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == "/" or path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_TEMPLATE.encode("utf-8"))
            return
            
        elif path == "/api/candidates":
            candidates = load_manifest()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(candidates).encode("utf-8"))
            return
            
        elif path == "/api/stats":
            stats = get_stats()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(stats).encode("utf-8"))
            return
            
        elif path == "/api/media":
            params = parse_qs(parsed.query)
            media_rel = params.get("path", [""])[0]
            if not media_rel:
                self.send_error(400, "Missing path parameter")
                return
            file_path = PROJECT_ROOT / media_rel
            if not file_path.exists() or not file_path.is_file():
                self.send_error(404, f"Media file not found: {media_rel}")
                return
            mime_type, _ = mimetypes.guess_type(str(file_path))
            if not mime_type:
                mime_type = "image/png"
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(file_path.stat().st_size))
            self.end_headers()
            with open(file_path, "rb") as f:
                self.wfile.write(f.read())
            return
            
        else:
            self.send_error(404, "Not Found")
            
    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/decision":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))
            
            cid = str(data.get("candidate_id"))
            label = str(data.get("reviewer_label"))
            notes = str(data.get("reviewer_notes", ""))
            timestamp = datetime.utcnow().isoformat() + "Z"
            
            # Save decision JSON
            decision_record = {
                "candidate_id": cid,
                "reviewer_label": label,
                "reviewer_notes": notes,
                "reviewed_at": timestamp
            }
            decision_file = DECISIONS_DIR / f"decision_{cid.zfill(4)}.json"
            with open(decision_file, "w", encoding="utf-8") as f:
                json.dump(decision_record, f, indent=2)
                
            # Update manifest safely
            candidates = load_manifest()
            for c in candidates:
                if str(c.get("candidate_id")) == cid:
                    c["verification_status"] = "REVIEWED"
                    c["reviewer_label"] = label
                    c["reviewer_notes"] = notes
                    c["reviewed_at"] = timestamp
                    break
            save_manifest(candidates)
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "candidate_id": cid}).encode("utf-8"))
            return
        else:
            self.send_error(404, "Not Found")

def run_server():
    server_address = (SERVER_HOST, SERVER_PORT)
    httpd = HTTPServer(server_address, ReviewServerHandler)
    print("=" * 65)
    print(" AgriMind-AI — Human Verification Review Server")
    print("=" * 65)
    print(f" Server URL: http://{SERVER_HOST}:{SERVER_PORT}")
    print(f" Manifest:   {MANIFEST_PATH}")
    print(f" Decisions:  {DECISIONS_DIR}")
    print(" Status:     STRICTLY READ-ONLY (Zero training / Zero dataset export)")
    print("=" * 65)
    print(" Press Ctrl+C to terminate the review server.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n Server shut down safely.")

if __name__ == "__main__":
    run_server()
