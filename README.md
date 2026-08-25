# AgriMind AI

AgriMind AI is a smart agriculture disease-detection project. It uses a React + Vite frontend, a FastAPI backend, PyTorch EfficientNet-B0 models, SQLite history storage, and JSON-based disease recommendations to help identify crop leaf diseases from uploaded images.

The current application supports cotton and soybean disease prediction.

## Key Features

- Upload or capture a crop leaf image from the web app
- Select the crop before prediction
- Predict disease using trained EfficientNet-B0 models
- Validate image quality before inference
- Return confidence score, confidence level, and per-class probabilities
- Show disease symptoms, treatment, prevention, spray guidance, and farmer actions
- Save prediction history in SQLite
- View dashboard, analytics, crop info, detection history, and settings pages
- Includes ML scripts for dataset cleaning, duplicate detection, splitting, training, inference, and evaluation

## Supported Crops And Classes

### Cotton

- Alternaria Leaf Spot
- Bacterial Blight
- Fusarium Wilt
- Healthy Leaf
- Verticillium Wilt

### Soybean

- Bacterial Blight
- Cercospora Leaf Blight
- Healthy
- Rust
- Sudden Death Syndrome

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, CSS |
| Backend | FastAPI, Python, SQLite, Pillow |
| Machine Learning | PyTorch, Torchvision, EfficientNet-B0 |
| Data Processing | NumPy, Pandas, scikit-learn, imagehash |
| Evaluation | Matplotlib, Seaborn |

## Project Structure

```text
AgriMind-AI/
|-- backend/
|   |-- app/
|   |   |-- main.py
|   |   `-- main_backup.py
|   `-- data/
|       |-- agrimind_history.db
|       |-- disease_recommendations.json
|       `-- disease_recommendations_backup.json
|-- datasets/
|   |-- crop/
|   |-- disease/
|   |-- inference/
|   |-- processed/
|   |-- raw/
|   |-- reports/
|   `-- tabular/
|-- docs/
|   `-- DATASET_SOURCES.md
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|-- ml/
|   |-- evaluation/
|   |-- inference/
|   |-- preprocessing/
|   `-- training/
|-- models/
|   |-- cotton_efficientnet_b0.pth
|   |-- soybean_efficientnet_b0.pth
|   `-- soybean_efficientnet_b0_baseline_98_18.pth
|-- tests/
|-- requirements.txt
`-- README.md
```

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- npm

## Backend Setup

Run these commands from the project root.

```bash
python -m venv .venv
```

Activate the virtual environment.

Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```bash
pip install -r requirements.txt
pip install fastapi uvicorn python-multipart
```

Start the FastAPI backend:

```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend URLs:

```text
API:  http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs
```

## Frontend Setup

Open a second terminal.

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run frontend lint:

```bash
npm run lint
```

If PowerShell blocks npm scripts, use `npm.cmd`:

```bash
npm.cmd run dev
npm.cmd run build
```

## Authentication

AgriMind AI includes user authentication to protect user-specific application data.

### Authentication Features

- User registration
- User login
- Authenticated dashboard access
- User-specific detection history
- Protected history APIs
- Logout functionality
- Automatic redirect to login for protected pages

The frontend uses authentication state to control access to protected application pages, while the backend validates authenticated users for protected history operations.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status, model name, supported crops, and classes |
| `GET` | `/health` | Backend health, model loading status, available models, and device |
| `POST` | `/predict` | Predict disease from an uploaded image |
| `GET` | `/history` | Return saved prediction history |
| `DELETE` | `/history` | Clear prediction history |
| `GET` | `/recommendation/{disease}` | Return disease recommendation details |

### Prediction Request

`POST /predict` expects multipart form data.

```text
file: JPG, PNG, or WEBP image
crop: cotton or soybean
```

If `crop` is not sent, the backend defaults to `cotton`.

Example with curl:

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -F "file=@leaf.jpg" \
  -F "crop=soybean"
```

Successful prediction responses include:

- `success`
- `crop`
- `filename`
- `prediction`
- `confidence`
- `confidence_level`
- `probabilities`
- `recommendation`

The backend checks file type, image size, brightness, contrast, and model confidence before returning a final result.

## Frontend Pages

| Route | Page |
|---|---|
| `/` | Dashboard |
| `/login` | Login |
| `/register` | Register |
| `/detection` | Disease Detection |
| `/crops` | Crops |
| `/analytics` | Analytics |
| `/history` | History |
| `/settings` | Settings |

## Application Workflow

The AgriMind AI application follows this workflow:

```text
User Registration / Login
        ↓
Dashboard
        ↓
Select Disease Detection
        ↓
Select Crop
        ↓
Upload or Capture Leaf Image
        ↓
Image Quality Validation
        ↓
EfficientNet-B0 Model Inference
        ↓
Disease Prediction
        ↓
Confidence & Class Probabilities
        ↓
Disease Recommendation
        ↓
Save Detection History
        ↓
Analytics & History
```

The system provides disease information including symptoms, immediate actions, prevention, treatment guidance, spray guidance, and farmer actions where available.

## ML Workflow

The ML pipeline is organized under `ml/`.

```text
Raw datasets
-> Dataset validation
-> Duplicate checking
-> Clean dataset creation
-> Train / validation / test split
-> EfficientNet-B0 training
-> Evaluation
-> Inference testing
-> Backend model deployment
```

Important scripts:

```text
ml/preprocessing/dataset_validator.py
ml/preprocessing/duplicate_checker.py
ml/preprocessing/duplicate_report.py
ml/preprocessing/create_clean_soybean.py
ml/preprocessing/create_clean_cotton.py
ml/preprocessing/create_final_cotton.py
ml/preprocessing/dataset_splitter.py
ml/preprocessing/split_leakage_checker.py
ml/training/train.py
ml/training/evaluate.py
ml/inference/predict.py
ml/evaluation/evaluate.py
ml/evaluation/generate_report.py
```

## Model Files

| File | Purpose |
|---|---|
| `models/cotton_efficientnet_b0.pth` | Cotton disease classification model |
| `models/soybean_efficientnet_b0.pth` | Soybean disease classification model used by the backend |
| `models/soybean_efficientnet_b0_baseline_98_18.pth` | Soybean baseline model checkpoint |

## Model Performance

Soybean evaluation report:

| Metric | Score |
|---|---:|
| Accuracy | 98.18% |
| Precision | 98.33% |
| Recall | 98.18% |
| F1 Score | 98.18% |

Evaluation files:

```text
ml/evaluation/evaluation_results.json
ml/evaluation/MODEL_REPORT.md
ml/evaluation/reports/confusion_matrix.png
ml/evaluation/reports/model_performance.png
```

## Important Files

| File | Purpose |
|---|---|
| `backend/app/main.py` | FastAPI app for prediction, history, health checks, and recommendations |
| `backend/data/disease_recommendations.json` | Disease guidance returned by the recommendation API |
| `backend/data/agrimind_history.db` | SQLite database for detection history |
| `frontend/src/App.jsx` | Frontend route configuration |
| `frontend/src/pages/DiseaseDetection.jsx` | Main image upload and prediction UI |
| `frontend/src/pages/Dashboard.jsx` | Dashboard and overview UI |
| `frontend/src/pages/Analytics.jsx` | Analytics UI based on prediction history |
| `ml/training/train.py` | Model training script |
| `ml/inference/predict.py` | Local model inference script |

## Dataset Notes

- Dataset source notes are documented in `docs/DATASET_SOURCES.md`.
- Raw, processed, cleaned, split, and inference datasets are stored under `datasets/`.
- Duplicate reports are stored under `datasets/reports/`.
- Large dataset folders and model checkpoints can make the repository heavy.

## Application Screenshots

### Dashboard

The dashboard provides an overview of supported crops, AI model status, total detections, and quick access to disease detection.

### Disease Detection

Users can upload or capture a crop leaf image and analyze it using the trained EfficientNet-B0 model.

## Troubleshooting

### Backend cannot import FastAPI or multipart support

Install the missing packages:

```bash
pip install fastapi uvicorn python-multipart
```

### Model not loaded

Check that these files exist:

```text
models/cotton_efficientnet_b0.pth
models/soybean_efficientnet_b0.pth
```

Then restart the backend.

### Frontend cannot connect to backend

Make sure the backend is running on:

```text
http://127.0.0.1:8000
```

The frontend pages currently call the FastAPI API at this local address.

### Low confidence or image quality warning

Upload a clear leaf image with enough light, contrast, and resolution. The backend requires at least `224x224` pixels and rejects very dark, very bright, blurry-looking, or low-confidence inputs.

## Notes

AgriMind AI is a decision-support tool. Disease predictions and treatment suggestions should be verified with local agricultural experts before applying chemical treatment or making field-level decisions.
