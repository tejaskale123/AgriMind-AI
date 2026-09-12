# AgriMind AI

AgriMind AI is a full-stack smart agriculture decision-support system. It uses crop leaf images, PyTorch EfficientNet-B0 models, FastAPI, React, and source-backed agricultural guidance to help users identify diseases in cotton, soybean, maize, and wheat.

The system is an aid for field inspection, not a replacement for local agricultural expertise. AI predictions and recommendations should be verified before treatment or spraying.

## What The Project Does

- Registers and authenticates users with JWT tokens.
- Accepts JPG, PNG, and WEBP leaf images or camera captures.
- Validates image resolution, brightness, contrast, file type, and model confidence.
- Runs crop-specific EfficientNet-B0 disease classification.
- Shows prediction, confidence, and class probabilities.
- Generates crop-specific management guidance with Claude Haiku and trusted agricultural web search.
- Streams recommendation sections progressively through Server-Sent Events (SSE).
- Falls back to the local source-backed recommendation database when live Claude or web search is unavailable.
- Stores user-specific detection history in SQLite.
- Provides dashboard, crop, detection, analytics, history, and settings pages.

## Supported Crops And Classes

### Cotton

- Alternaria Leaf Spot
- Anthracnose
- Bacterial Blight
- Boll Rot
- Cercospora Leaf Spot
- Fusarium Wilt
- Grey Areolate Mildew
- Healthy Leaf
- Verticillium Wilt

### Soybean

- Bacterial Blight
- Cercospora Leaf Blight
- Healthy
- Rust
- Sudden Death Syndrome

### Maize

- Blight
- Common Rust
- Gray Leaf Spot
- Healthy

### Wheat

- Brown Rust
- Healthy
- Yellow Rust

## Architecture

```text
React + Vite frontend
        |
        | JWT-authenticated HTTP requests
        v
FastAPI backend
        |
        +-- EfficientNet-B0 crop-specific models
        +-- SQLite user and detection history
        +-- Local disease_recommendations.json fallback
        +-- Claude Haiku + official agricultural web search
        +-- SSE recommendation stream
```

## Recommendation Streaming Flow

Prediction and recommendation generation are intentionally separated:

```text
Upload image
    -> POST /predict
    -> EfficientNet-B0 returns prediction immediately
    -> Frontend opens /recommendation/stream
    -> Three Claude Haiku section calls run concurrently
    -> Each completed section is sent as an SSE event
    -> Frontend merges and displays sections progressively
```

The three streamed sections are:

1. Symptoms, severity, and immediate action
2. Prevention, spray guidance, and treatment
3. Farmer action and source information

This improves time-to-first-content. It uses more API calls than one bulk request and can produce sections at different times, so the UI merges the results as they arrive. If a section fails, the backend uses the local verified recommendation as a safe fallback.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, React Router, CSS |
| Backend | FastAPI, Python, Uvicorn, Pillow |
| Authentication | JWT, bcrypt, python-jose |
| Machine learning | PyTorch, Torchvision, EfficientNet-B0 |
| AI recommendations | Anthropic Claude Haiku, server-side web search |
| Storage | SQLite |
| Data and evaluation | NumPy, Pandas, scikit-learn, Matplotlib, Seaborn, imagehash |

## Project Structure

```text
AgriMind-AI/
|-- backend/
|   |-- app/
|   |   |-- auth.py
|   |   |-- claude_service.py
|   |   |-- main.py
|   |   `-- test_claude.py
|   `-- data/
|       |-- agrimind_history.db
|       `-- disease_recommendations.json
|-- datasets/
|-- docs/
|   `-- DATASET_SOURCES.md
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   `-- package.json
|-- ml/
|   |-- evaluation/
|   |-- inference/
|   |-- preprocessing/
|   `-- training/
|-- models/
|   |-- cotton_9class_efficientnet_b0.pth
|   |-- maize_efficientnet_b0.pth
|   |-- soybean_efficientnet_b0.pth
|   |-- soybean_efficientnet_b0_baseline_98_18.pth
|   `-- wheat_efficientnet_b0.pth
|-- requirements.txt
|-- export_project.py
`-- README.md
```

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- Model checkpoint files in `models/`
- An Anthropic API key for live recommendation generation

## Environment Configuration

Create a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Never commit `.env` or expose the API key in frontend code. The backend loads the key from the environment and uses the verified model ID `claude-haiku-4-5-20251001`.

## Backend Setup

Run these commands from the project root.

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend URLs:

```text
API:  http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs
Health: http://127.0.0.1:8000/health
```

## Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Production build and preview:

```powershell
npm run build
npm run preview
```

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| `GET` | `/` | No | API status, supported crops, and model classes |
| `GET` | `/health` | No | Model and device health |
| `POST` | `/auth/register` | No | Create a user account |
| `POST` | `/auth/login` | No | Login and receive a JWT |
| `POST` | `/auth/token` | No | OAuth2-compatible Swagger login |
| `GET` | `/auth/me` | Yes | Return the current user |
| `POST` | `/predict` | Yes | Run image classification and return immediately |
| `GET` | `/recommendation/stream` | Yes | Stream three recommendation sections as SSE |
| `GET` | `/recommendation/{disease}` | No | Read local recommendation data |
| `GET` | `/history` | Yes | Read the current user's detection history |
| `DELETE` | `/history` | Yes | Clear the current user's history |

### Prediction Request

`POST /predict` expects multipart form data and a Bearer token:

```text
file: JPG, PNG, or WEBP image
crop: cotton, soybean, maize, or wheat
```

Example:

```powershell
curl.exe -X POST "http://127.0.0.1:8000/predict" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -F "file=@leaf.jpg" `
  -F "crop=cotton"
```

The response includes `prediction`, `confidence`, `confidence_level`, `probabilities`, and a `recommendation` field. Recommendation content is loaded progressively from the separate stream endpoint after prediction.

### Recommendation Stream

The frontend sends an authenticated request like:

```text
GET /recommendation/stream?crop=cotton&disease=Boll%20Rot&confidence=99.83
```

Each SSE event has this shape:

```json
{
  "section": "management",
  "data": {
    "prevention": "...",
    "spray_guidance": "...",
    "treatment": "..."
  }
}
```

The stream ends with a `done` event. The frontend normalizes string fields into arrays before rendering list sections.

## Frontend Routes

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Dashboard | Protected |
| `/detection` | Disease Detection | Protected |
| `/crops` | Crop information | Protected |
| `/analytics` | Detection analytics | Protected |
| `/history` | User detection history | Protected |
| `/settings` | Application settings | Protected |

## Image Validation

The backend currently validates:

- Minimum resolution: `224x224` pixels
- Accepted types: JPEG, PNG, and WEBP
- Frontend upload limit: `10 MB`
- Brightness range and minimum contrast
- Minimum model confidence: `70%`

Low-quality or low-confidence results return a warning instead of a normal recommendation.

## Machine Learning Pipeline

```text
Raw datasets
    -> audit and validation
    -> duplicate checking and cleaning
    -> train/validation/test split
    -> EfficientNet-B0 training
    -> evaluation and reports
    -> inference
    -> FastAPI deployment
```

Relevant areas include:

- `ml/preprocessing/` for validation, duplicate checks, cleaning, and splitting
- `ml/training/` for model training
- `ml/inference/` for local inference
- `ml/evaluation/` for metrics and reports
- Root scripts for dataset audits, manifests, crop checks, and duplicate analysis

## Model Files

| File | Backend use |
|---|---|
| `models/cotton_9class_efficientnet_b0.pth` | Cotton, 9 classes |
| `models/soybean_efficientnet_b0.pth` | Soybean, 5 classes |
| `models/maize_efficientnet_b0.pth` | Maize, 4 classes |
| `models/wheat_efficientnet_b0.pth` | Wheat, 3 classes |
| `models/soybean_efficientnet_b0_baseline_98_18.pth` | Soybean baseline checkpoint |

## Data And Recommendations

- Dataset source notes: `docs/DATASET_SOURCES.md`
- Local recommendation data: `backend/data/disease_recommendations.json`
- User and detection storage: `backend/data/agrimind_history.db`
- Dataset folders: `datasets/`
- Project export utility: `export_project.py`

The local recommendation file contains source references and is used as the safe fallback when Claude or live web search is unavailable. Claude prompts restrict searches to official agricultural domains such as TNAU, ICAR, and CICR, and prohibit invented pesticide doses or schedules.

## Testing And Validation

Backend syntax check:

```powershell
python -m py_compile backend/app/main.py backend/app/claude_service.py
```

Claude configuration/API smoke test:

```powershell
cd backend
python app/test_claude.py
```

Frontend production build:

```powershell
cd frontend
npm run build
```

The Claude smoke test requires `ANTHROPIC_API_KEY`. Do not print or commit the key.

## Troubleshooting

### Backend does not start

Install the Python dependencies and verify that all model files exist under `models/`. Import-time model loading can take time and requires PyTorch and Torchvision to be installed correctly.

### Frontend cannot reach the backend

Start FastAPI on `http://127.0.0.1:8000` and Vite on `http://localhost:5173`. The backend CORS configuration allows the local Vite origins.

### Recommendation stream fails

Check that:

- The backend is running.
- The Bearer token is valid.
- `ANTHROPIC_API_KEY` is present in the root `.env` file.
- The Anthropic account can access `claude-haiku-4-5-20251001`.
- The local recommendation JSON is available for fallback.

### Prediction is rejected

Upload a clear, well-lit image with at least `224x224` resolution and enough contrast. Confirm that the selected crop matches the uploaded leaf.

### Protected pages redirect to login

Log in again so the frontend can refresh the `access_token` stored in browser storage.

## Safety Note

AgriMind AI provides decision-support information. It does not guarantee a diagnosis. Always compare the prediction with visible field symptoms and consult a qualified local agriculture expert before applying chemical, biological, or botanical products.
