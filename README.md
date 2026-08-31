# AgriMind AI

AgriMind AI is a full-stack smart agriculture project for crop leaf disease detection. It combines a React + Vite frontend, a FastAPI backend, JWT authentication, SQLite storage, and PyTorch EfficientNet-B0 models to help farmers identify crop leaf diseases from uploaded or captured images.

The application supports authenticated users, protected dashboard access, image quality validation, model inference, disease recommendations, detection history, and analytics.

## Key Features

- User registration and login
- Protected frontend pages with automatic login redirect
- Upload or capture crop leaf images from the web app
- Select crop before prediction
- Cotton, soybean, and maize disease prediction using EfficientNet-B0
- Image quality checks for file type, size, brightness, contrast, and confidence
- Confidence score, confidence level, and class probability output
- Disease guidance with symptoms, treatment, prevention, spray guidance, and farmer actions where available
- User-specific detection history stored in SQLite
- Dashboard, disease detection, crops, analytics, history, and settings pages
- ML utilities for dataset validation, duplicate detection, cleaning, splitting, training, inference, and evaluation

## Backend Supported Crops And Classes

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

### Maize

- Blight
- Common Rust
- Gray Leaf Spot
- Healthy

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, CSS |
| Backend | FastAPI, Python, SQLite, Pillow |
| Authentication | JWT, bcrypt, python-jose |
| Machine Learning | PyTorch, Torchvision, EfficientNet-B0 |
| Data Processing | NumPy, Pandas, scikit-learn, imagehash |
| Evaluation | Matplotlib, Seaborn |

## Project Structure

```text
AgriMind-AI/
|-- backend/
|   |-- app/
|   |   |-- auth.py
|   |   `-- main.py
|   `-- data/
|       |-- agrimind_history.db
|       `-- disease_recommendations.json
|-- docs/
|   `-- DATASET_SOURCES.md
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   `-- Sidebar.jsx
|   |   |-- pages/
|   |   |   |-- Analytics.jsx
|   |   |   |-- Crops.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- DiseaseDetection.jsx
|   |   |   |-- History.jsx
|   |   |   |-- Login.jsx
|   |   |   |-- Register.jsx
|   |   |   `-- Settings.jsx
|   |   |-- App.jsx
|   |   |-- App.css
|   |   |-- index.css
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
|   |-- maize_efficientnet_b0.pth
|   |-- soybean_efficientnet_b0.pth
|   |-- soybean_efficientnet_b0_baseline_98_18.pth
|   `-- wheat_efficientnet_b0.pth
|-- tests/
|   `-- sample_soybean.jpg
|-- requirements.txt
|-- project_extraction.txt
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
- JWT access token storage in the frontend
- Authenticated dashboard access
- User-specific detection history
- Protected prediction and history APIs
- Logout functionality
- Automatic redirect to login for protected pages

The frontend stores the logged-in user's token in `localStorage` as `access_token` and stores user details as `user`. Protected API requests use a Bearer token.

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---:|---|
| `GET` | `/` | No | API status, model name, supported crops, and classes |
| `GET` | `/health` | No | Backend health, model loading status, available models, and device |
| `POST` | `/auth/register` | No | Create a user account |
| `POST` | `/auth/login` | No | Login and return an access token |
| `POST` | `/auth/token` | No | OAuth2-compatible token endpoint for Swagger UI authorization |
| `GET` | `/auth/me` | Yes | Return the current authenticated user payload |
| `POST` | `/predict` | Yes | Predict disease from an uploaded image |
| `GET` | `/history` | Yes | Return the logged-in user's prediction history |
| `DELETE` | `/history` | Yes | Clear the logged-in user's prediction history |
| `GET` | `/recommendation/{disease}` | No | Return disease recommendation details |

### Register Request

`POST /auth/register`

```json
{
  "full_name": "Test Farmer",
  "email": "farmer@example.com",
  "password": "secret123"
}
```

### Login Request

`POST /auth/login`

```json
{
  "email": "farmer@example.com",
  "password": "secret123"
}
```

Successful login responses include:

- `success`
- `message`
- `access_token`
- `token_type`
- `user`

### Prediction Request

`POST /predict` expects multipart form data and a Bearer token.

```text
file: JPG, PNG, or WEBP image
crop: cotton, soybean, or maize
```

Example with curl:

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@leaf.jpg" \
  -F "crop=maize"
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

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Dashboard | Protected |
| `/detection` | Disease Detection | Protected |
| `/crops` | Crops | Protected |
| `/analytics` | Analytics | Protected |
| `/history` | History | Protected |
| `/settings` | Settings | Protected |

## Crop Availability

| Crop | Frontend Status | Backend Prediction Status |
|---|---|---|
| Cotton | AI Detection Available | Active |
| Soybean | AI Detection Available | Active |
| Maize | AI Detection Available | Active |
| Wheat | AI Detection Available in UI | Model checkpoint present, backend integration pending |
| Tomato | Coming Soon | Not active |
| Bell Pepper | Coming Soon | Not active |

## Application Workflow

The AgriMind AI application follows this workflow:

```text
User Registration / Login
-> Dashboard
-> Select Disease Detection
-> Select Crop
-> Upload or Capture Leaf Image
-> Image Quality Validation
-> EfficientNet-B0 Model Inference
-> Disease Prediction
-> Confidence & Class Probabilities
-> Disease Recommendation
-> Save Detection History
-> Analytics & History
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
ml/preprocessing/create_clean_maize.py
ml/preprocessing/check_maize.py
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
| `backend/app/main.py` | FastAPI app for auth, prediction, history, health checks, and recommendations |
| `backend/app/auth.py` | Password hashing, user lookup, and JWT helpers |
| `backend/data/disease_recommendations.json` | Disease guidance returned by the recommendation API |
| `backend/data/agrimind_history.db` | SQLite database for users and detection history |
| `frontend/src/App.jsx` | Frontend route configuration and protected route handling |
| `frontend/src/components/Sidebar.jsx` | Main app navigation and logout UI |
| `frontend/src/pages/Login.jsx` | User login page |
| `frontend/src/pages/Register.jsx` | User registration page |
| `frontend/src/pages/Dashboard.jsx` | Dashboard and overview UI |
| `frontend/src/pages/DiseaseDetection.jsx` | Main image upload, capture, crop selection, and prediction UI |
| `frontend/src/pages/Crops.jsx` | Supported crop information |
| `frontend/src/pages/Analytics.jsx` | Analytics UI based on prediction history |
| `frontend/src/pages/History.jsx` | User detection history UI |
| `frontend/src/pages/Settings.jsx` | Application settings UI |
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

### Analytics

The analytics page summarizes detection activity and crop disease trends from saved history.

### History

The history page shows saved prediction records for the logged-in user.

## Troubleshooting

### Backend cannot import a package

Install dependencies again:

```bash
pip install -r requirements.txt
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

### Protected pages redirect to login

Login again so the frontend can store a valid `access_token` in `localStorage`.

### Prediction returns unauthorized

Make sure the request includes:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Low confidence or image quality warning

Upload a clear leaf image with enough light, contrast, and resolution. The backend requires at least `224x224` pixels and rejects very dark, very bright, blurry-looking, or low-confidence inputs.

## Notes

AgriMind AI is a decision-support tool. Disease predictions and treatment suggestions should be verified with local agricultural experts before applying chemical treatment or making field-level decisions.
