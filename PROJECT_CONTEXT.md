# AgriMind AI - Comprehensive Project Context & Architecture Master Guide

> **Document Type:** AI Agent & Developer Reference Guide  
> **Project Name:** AgriMind AI  
> **Target Audience:** AI Models (LLMs), Autonomous Coding Agents, Full-Stack & ML Developers  
> **Location:** Root Directory (`/PROJECT_CONTEXT.md`)  
> **Last Updated:** September 2026  
> **Status:** Production-Ready Decision-Support Platform  

---

## 1. Executive Summary & Problem Statement

**AgriMind AI** is an end-to-end, full-stack smart agriculture decision-support platform designed to assist farmers, agricultural extension workers, and agronomists in diagnosing crop leaf diseases and receiving actionable, source-backed management recommendations.

### Core Problems Solved:
1. **Delayed & Inaccurate Diagnosis:** Farmers frequently misdiagnose leaf pathogens (fungal, bacterial, viral), leading to wasted chemical applications, financial losses, and crop failure.
2. **Hallucinated or Unsafe AI Advice:** Generic AI models often fabricate pesticide dosages, recommend banned chemicals, or propose treatments for unrelated crops. AgriMind AI solves this with strict domain-restricted web searches (TNAU, ICAR, CICR) and a verified local fallback database.
3. **Bandwidth & Latency Constraints:** Field connectivity can be slow. AgriMind AI separates rapid ML inference (sub-second) from AI recommendation streaming (Server-Sent Events in 3 concurrent stages) so farmers get instant feedback.
4. **Language Accessibility:** Multilingual support natively covers **English**, **Marathi (मराठी)**, and **Hindi (हिन्दी)**.

---

## 2. Complete System Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                                  USER / CLIENT                                    |
|                       (Mobile Browser, Desktop, Tablet)                           |
+-----------------------------------------------------------------------------------+
                                         │
                                         │ HTTPS / REST / SSE
                                         ▼
+-----------------------------------------------------------------------------------+
|                        FRONTEND (React 19 + Vite + CSS)                           |
|  - Multi-language UI (EN, HI, MR via LanguageContext)                             |
|  - Pages: Dashboard, Detection, Crops, Analytics, History, Settings, Auth         |
|  - State: JWT auth in localStorage, image canvas upload/camera stream            |
+-----------------------------------------------------------------------------------+
       │                                                          ▲
       │ POST /predict (Image + Crop + Bearer Token)              │ SSE /recommendation/stream
       ▼                                                          │ (3 concurrent sections)
+-----------------------------------------------------------------------------------+
|                        BACKEND (FastAPI + Uvicorn)                                |
|  - JWT Authentication & Bcrypt Hashing (OAuth2 Bearer)                            |
|  - Image Quality Pre-validation (Resolution, Brightness, Contrast)               |
|  - SQLite Database (User profiles, full detection history)                        |
+-----------------------------------------------------------------------------------+
       │                                                          │
       ├──────────────────────────────┐                           ├──────────────────────────────┐
       ▼                              ▼                           ▼                              ▼
+-----------------------+   +--------------------+   +---------------------------+   +-------------------+
|  PyTorch ML Models    |   | SQLite Database    |   | Anthropic Claude Service  |   | Local Verified DB |
|  (EfficientNet-B0)    |   | (agrimind_         |   | (claude-haiku-4-5)        |   | (disease_recomm-  |
|  - Cotton (9 classes) |   |  history.db)       |   | + Live Web Search RAG     |   |  endations.json)  |
|  - Soybean (8 classes)|   | - users table      |   |   (TNAU, ICAR, CICR)      |   |                   |
|  - Maize (4 classes)  |   | - detection_       |   | - 3 Concurrent Tasks:     |   | Safe fallback if  |
|  - Wheat (3 classes)  |   |   history table    |   |   * Symptoms & Severity   |   | Claude / network  |
|                       |   |                    |   |   * Prevention & Spray    |   | fails or is slow  |
| Output: Class proba-  |   | Stores predictions |   |   * Action & Sources      |   |                   |
| bilities & confidence |   | & metadata         |   | Output: Streamed JSON SSE |   | Zero hallucination|
+-----------------------+   +--------------------+   +---------------------------+   +-------------------+
```

### End-to-End User Flow:
1. **Authentication:** User registers/logs in via `/auth/register` or `/auth/login`. Receives a signed JWT access token stored in browser `localStorage`.
2. **Crop & Image Upload:** User selects target crop (`cotton`, `soybean`, `maize`, or `wheat`) and uploads a leaf photograph (or captures via camera).
3. **Pre-Inference Validation:** FastAPI backend validates:
   - MIME type: JPEG, PNG, or WEBP only.
   - Minimum image resolution: $224 \times 224$ px.
   - Mean brightness: $25 \le \text{Brightness} \le 235$.
   - Contrast standard deviation: $\sigma \ge 15$.
4. **PyTorch Inference:**
   - Image normalized with ImageNet stats ($\mu=[0.485, 0.456, 0.406]$, $\sigma=[0.229, 0.224, 0.225]$).
   - Loaded into dedicated crop EfficientNet-B0 model on CPU/CUDA.
   - Returns predicted disease, confidence percentage, and class distribution.
   - If confidence $< 70\%$, user receives a low-confidence warning.
5. **Immediate Response:** `/predict` immediately returns classification output (time-to-first-diagnosis $< 500\text{ms}$).
6. **Concurrent Advisory Streaming:** Frontend opens Server-Sent Events (SSE) connection to `/recommendation/stream?crop={crop}&disease={disease}&confidence={confidence}&language={lang}`.
   - Claude concurrently queries 3 sub-prompts restricted to official domains (`agritech.tnau.ac.in`, `tnau.ac.in`, `icar.gov.in`, `cicr.gov.in`).
   - Three sections stream as they complete: `symptoms`, `management`, `follow_up`.
   - If Anthropic API or network is unavailable, system instantly streams verified entries from `backend/data/disease_recommendations.json`.
7. **Persistence:** Complete detection record is saved to SQLite `detection_history` table for personal analytics and historical reporting.

---

## 3. Technology Stack Breakdown

| Layer | Technology | Version | Purpose & Rationale |
|---|---|---|---|
| **Frontend Framework** | React | `^19.2.8` | Component-based, modern high-performance UI |
| **Frontend Bundler** | Vite | `^8.2.0` | Ultra-fast HMR and optimized production bundling |
| **Routing** | React Router DOM | `^7.18.2` | Client-side declarative routing and protected auth routes |
| **Styling** | Vanilla CSS (BEM / Custom Tokens) | Custom | High-fidelity glassmorphism, responsive CSS variables, zero heavy UI frameworks |
| **Backend Framework**| FastAPI | Modern | Async-native, high throughput, automatic OpenAPI documentation, Pydantic validation |
| **ASGI Server** | Uvicorn | Modern | Production ASGI web server running on `127.0.0.1:8000` |
| **Deep Learning** | PyTorch & Torchvision | Modern | EfficientNet-B0 neural network weights and transforms |
| **Computer Vision** | Pillow (PIL), ImageHash | Modern | Image quality checks, perceptual hashing for deduplication |
| **LLM / Advisory** | Anthropic Claude (`claude-haiku-4-5-20251001`) | Anthropic SDK | Low-latency, high-reasoning advisory with server-side web search |
| **Authentication** | JWT (`python-jose`) + `bcrypt` | Modern | Stateless secure auth, hashed salted passwords |
| **Database** | SQLite3 | Built-in | Zero-config, reliable relational persistence for users and detection logs |
| **Data Science / ML**| NumPy, Pandas, Scikit-learn, Seaborn, Matplotlib | Modern | Data audit, confusion matrices, performance evaluations |

---

## 4. Complete Project Directory Structure & Key Files

```
AgriMind-AI/
├── .env                                # API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY)
├── .gitignore                          # Git ignore definitions
├── requirements.txt                    # Python dependencies
├── PROJECT_CONTEXT.md                  # THIS FILE: Complete master guide for AI & developers
├── README.md                           # Human-facing overview & quickstart
├── export_project.py                   # Single-file codebase bundling script for audits
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application, routes, models, prediction & SSE stream
│   │   ├── auth.py                     # Bcrypt hashing, SQLite user auth, JWT creation/verification
│   │   ├── claude_service.py           # Anthropic Claude client, web search, SSE generator, fallbacks
│   │   └── test_claude.py              # CLI smoke test for Claude connection & API key
│   └── data/
│       ├── agrimind_history.db         # SQLite database storing users & detection records
│       └── disease_recommendations.json# Comprehensive local verified medical/agricultural fallback data
│
├── frontend/
│   ├── index.html                      # Single page app entry HTML
│   ├── package.json                    # Node dependencies and scripts
│   ├── vite.config.js                  # Vite configuration
│   ├── public/                         # Static assets
│   └── src/
│       ├── main.jsx                    # React DOM root render
│       ├── App.jsx                     # Route definitions, Protected Route Guards, Language Provider
│       ├── App.css                     # Global layout styles, responsive breakpoints
│       ├── index.css                   # Design tokens, typography, glassmorphism UI variables
│       ├── components/
│       │   └── Sidebar.jsx             # Navigation sidebar with language selector & user status
│       ├── context/
│       │   └── LanguageContext.jsx     # i18n Context supporting English, Marathi, and Hindi
│       ├── translations/
│       │   ├── en.js                   # English locale dictionary
│       │   ├── hi.js                   # Hindi (हिन्दी) locale dictionary
│       │   ├── mr.js                   # Marathi (मराठी) locale dictionary
│       │   └── index.js                # Translation bundle export
│       └── pages/
│           ├── Dashboard.jsx           # Overview stats, quick detection CTA, recent activities
│           ├── DiseaseDetection.jsx    # Core leaf upload, camera capture, real-time prediction & SSE
│           ├── Crops.jsx               # Supported crops catalog & detailed disease encyclopedia
│           ├── Analytics.jsx           # Disease trends, distribution charts, confidence analytics
│           ├── History.jsx             # Paginated detection logs, detail modals, delete history
│           ├── Settings.jsx            # Account settings, language toggles, theme preferences
│           ├── Login.jsx               # User login with JWT session issuance
│           └── Register.jsx            # New farmer/user account registration
│
├── ml/
│   ├── config.py                       # ML constants, image dimensions, dataset paths, crop lists
│   ├── preprocessing/                  # Data validation, image audits, split generation
│   ├── training/
│   │   ├── train.py                    # Transfer learning script for EfficientNet-B0
│   │   ├── config.py                   # Hyperparameters (batch size, learning rate, epochs)
│   │   └── evaluate.py                 # Validation loop during training
│   ├── evaluation/
│   │   ├── evaluate.py                 # Multi-class evaluation script
│   │   ├── evaluate_cotton.py          # Dedicated cotton 9-class evaluator
│   │   ├── generate_report.py          # Plots confusion matrices & classification reports
│   │   ├── evaluation_results.json     # Quantitative test results (Accuracy: 99.12%)
│   │   ├── MODEL_REPORT.md             # Soybean 5-class model report (Accuracy: 98.18%)
│   │   └── reports/                    # Confusion matrix images and graphs
│   └── inference/                      # Standalone CLI prediction scripts
│
├── models/                             # Pretrained PyTorch model checkpoints (.pth)
│   ├── cotton_9class_efficientnet_b0.pth # 9-Class Cotton Leaf Disease Model
│   ├── soybean_efficientnet_b0.pth       # 8-Class Soybean Leaf Disease Model
│   ├── soybean_efficientnet_b0_baseline_98_18.pth # 5-Class Baseline Soybean Model
│   ├── maize_efficientnet_b0.pth         # 4-Class Maize Leaf Disease Model
│   └── wheat_efficientnet_b0.pth         # 3-Class Wheat Rust/Disease Model
│
├── datasets/                           # Local dataset directories (raw & processed)
├── docs/
│   └── DATASET_SOURCES.md              # Research sources (PlantVillage, Mendeley Data, etc.)
└── tests/
    └── sample_soybean.jpg              # Verification test image
```

---

## 5. Machine Learning Models & Class Mappings

Each crop uses a dedicated **EfficientNet-B0** convolutional neural network backbone with custom linear classifier head (`nn.Linear(1280, num_classes)`).

### Supported Crops & Target Classes:

#### 1. Cotton (`cotton`) - 9 Classes
*Model File:* `models/cotton_9class_efficientnet_b0.pth`  
- `Alternaria Leaf Spot`
- `Anthracnose`
- `Bacterial Blight`
- `Boll Rot`
- `Cercospora Leaf Spot`
- `Fusarium Wilt`
- `Grey Areolate Mildew`
- `Healthy Leaf`
- `Verticillium Wilt`

#### 2. Soybean (`soybean`) - 8 Classes
*Model File:* `models/soybean_efficientnet_b0.pth`  
- `Bacterial_Blight`
- `Cercospora_Leaf_Blight`
- `Downy_Mildew`
- `Frogeye_Leaf_Spot`
- `Healthy`
- `Rust`
- `Sudden_Death_Syndrome`
- `Target_Spot`

#### 3. Maize (`maize`) - 4 Classes
*Model File:* `models/maize_efficientnet_b0.pth`  
- `Blight` (Northern Corn Leaf Blight)
- `Common_Rust`
- `Gray_Leaf_Spot`
- `Healthy`

#### 4. Wheat (`wheat`) - 3 Classes
*Model File:* `models/wheat_efficientnet_b0.pth`  
- `Brown_Rust`
- `Healthy`
- `Yellow_Rust`

### Image Preprocessing & Input Tensor Pipeline:
- **Input Dimensions:** $224 \times 224 \times 3$ (RGB)
- **Transform Steps:**
  1. `transforms.Resize((224, 224))`
  2. `transforms.ToTensor()`
  3. `transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])`
- **Output:** Softmax distribution over class indices. The highest probability gives the predicted label and percentage confidence.

---

## 6. Backend API Reference & Endpoints

Base URL: `http://127.0.0.1:8000`  
Interactive Swagger Docs: `http://127.0.0.1:8000/docs`  

### Authentication Endpoints

#### `POST /auth/register`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "full_name": "Farmer John",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Account created successfully.",
    "user": {
      "id": 1,
      "full_name": "Farmer John",
      "email": "john@example.com"
    }
  }
  ```

#### `POST /auth/login`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": { "id": 1, "full_name": "Farmer John", "email": "john@example.com" }
  }
  ```

#### `GET /auth/me`
- **Auth Required:** Yes (`Authorization: Bearer <token>`)
- **Response:** Current user's profile details.

---

### Core Disease Detection & Recommendation Endpoints

#### `POST /predict`
- **Auth Required:** Yes (`Authorization: Bearer <token>`)
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Image binary (JPEG, PNG, WEBP, up to 10MB)
  - `crop`: Form field string (`cotton`, `soybean`, `maize`, or `wheat`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "crop": "cotton",
    "filename": "leaf_sample.jpg",
    "prediction": "Bacterial Blight",
    "confidence": 98.45,
    "confidence_level": "Very High",
    "probabilities": {
      "Alternaria Leaf Spot": 0.42,
      "Anthracnose": 0.15,
      "Bacterial Blight": 98.45,
      "Boll Rot": 0.05,
      "Cercospora Leaf Spot": 0.12,
      "Fusarium Wilt": 0.08,
      "Grey Areolate Mildew": 0.10,
      "Healthy Leaf": 0.51,
      "Verticillium Wilt": 0.12
    },
    "recommendation": null
  }
  ```
- **Low Confidence Case (Confidence < 70%):** Returns `"success": false` with a warning message instructing the user to retake the photo with better lighting/focus.

#### `GET /recommendation/stream`
- **Auth Required:** Yes (`Authorization: Bearer <token>`)
- **Query Parameters:**
  - `crop` (str): e.g. `cotton`
  - `disease` (str): e.g. `Bacterial Blight`
  - `confidence` (float): e.g. `98.45`
  - `language` (str): `en`, `hi`, or `mr` (defaults to `en`)
- **Response Protocol:** Server-Sent Events (`text/event-stream`)
- **Event Flow:**
  - Event 1 (`symptoms`):
    ```json
    {
      "section": "symptoms",
      "data": {
        "severity": "Moderate",
        "symptoms": "Angular water-soaked leaf lesions turning brown...",
        "immediate_action": "Isolate affected section and avoid wet leaf handling."
      }
    }
    ```
  - Event 2 (`management`):
    ```json
    {
      "section": "management",
      "data": {
        "prevention": "Use certified seed, ensure adequate crop spacing...",
        "spray_guidance": "Copper oxychloride or streptocycline spray only if locally approved...",
        "treatment": "Field sanitation, drainage improvement, removal of debris."
      }
    }
    ```
  - Event 3 (`follow_up`):
    ```json
    {
      "section": "follow_up",
      "data": {
        "farmer_action": "Check weekly and verify with local Krishi Vigyan Kendra.",
        "source": "TNAU Agritech Portal (https://agritech.tnau.ac.in), ICAR-CICR"
      }
    }
    ```
  - Event 4 (`done`):
    ```json
    { "done": true }
    ```

#### `GET /recommendation/{disease}`
- **Auth Required:** No
- **Response:** Direct static lookup from `backend/data/disease_recommendations.json`.

---

### History Endpoints

#### `GET /history`
- **Auth Required:** Yes
- **Response:** Array of user's past detections ordered by date DESC.

#### `DELETE /history`
- **Auth Required:** Yes
- **Response:** Clears all detection records for the authenticated user.

---

## 7. Recommendation Engine & RAG Architecture

AgriMind AI implements a hybrid **Real-Time Web Search + Local Knowledge Base Fallback** strategy.

### 1. Claude Haiku with Server-Side Web Search:
- Model: `claude-haiku-4-5-20251001`
- Restriction: Search allowed domains are hard-locked to trusted agricultural institutes:
  - `agritech.tnau.ac.in` (Tamil Nadu Agricultural University)
  - `tnau.ac.in`
  - `icar.gov.in` (Indian Council of Agricultural Research)
  - `cicr.gov.in` (Central Institute for Cotton Research)
- Prompt Directives:
  - Strict output schema enforcement via JSON schema.
  - Zero hallucination rules for chemicals: Never invent pesticide dosages, never recommend unauthorized agrochemicals.
  - Crop boundary enforcement: Prevents confusing mango anthracnose with cotton anthracnose.
  - Preserves biological and cultural IPM (Integrated Pest Management) practices.

### 2. Multi-Stage Concurrent SSE Streaming:
To eliminate long waiting times, the backend executes 3 concurrent tasks using `asyncio.create_task` for:
1. `symptoms` (Severity, visual indicators, immediate field actions)
2. `management` (Preventive measures, spray guidance, agronomic treatments)
3. `follow_up` (Farmer action items, official citations & URLs)

As soon as any task completes, it yields an SSE event to the frontend.

### 3. Local JSON Safe Fallback:
If Anthropic API quota is exceeded, network drops, or API key is absent, `_section_fallback` immediately retrieves verified entries from `backend/data/disease_recommendations.json`.

---

## 8. Database Architecture (SQLite)

Database Path: `backend/data/agrimind_history.db`

### Table: `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user ID |
| `full_name` | TEXT | | Full name of the user/farmer |
| `email` | TEXT | UNIQUE NOT NULL | User login email |
| `password_hash` | TEXT | | Salted bcrypt password hash |
| `created_at` | TEXT | NOT NULL | ISO-8601 creation timestamp |

### Table: `detection_history`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique record ID |
| `user_id` | INTEGER | FOREIGN KEY -> users(id) | Associated user |
| `filename` | TEXT | NOT NULL | Stored image filename |
| `crop` | TEXT | NOT NULL | Selected crop (`cotton`, `soybean`, etc.) |
| `prediction` | TEXT | NOT NULL | Classified disease condition |
| `confidence` | REAL | NOT NULL | Model confidence percentage (e.g. 98.45) |
| `probabilities`| TEXT | NOT NULL | JSON string of all class probabilities |
| `severity` | TEXT | | Disease severity (`Low`, `Moderate`, `High`) |
| `symptoms` | TEXT | | JSON string or text of symptoms |
| `treatment` | TEXT | | Management / treatment details |
| `prevention` | TEXT | | Preventative agronomic practices |
| `farmer_action`| TEXT | | Follow-up instructions |
| `created_at` | TEXT | NOT NULL | ISO-8601 timestamp |

---

## 9. Frontend Architecture & Multilingual Support

### Routing Structure (`frontend/src/App.jsx`):
- **Public Routes:** `/login`, `/register`
- **Protected Routes (Redirect to `/login` if no JWT token):**
  - `/`: **Dashboard** - Overview statistics, quick-start detection, disease threat distribution.
  - `/detection`: **Disease Detection** - Upload leaf image, drag & drop, live webcam capture, crop selector, prediction display, live SSE streaming recommendation tabs.
  - `/crops`: **Crop Encyclopedia** - Information on Cotton, Soybean, Maize, Wheat, common diseases, symptoms, and seasonal care.
  - `/analytics`: **Analytics & Insights** - Visual breakdown of detections, confidence metrics, disease frequencies over time.
  - `/history`: **User History** - Interactive table/cards of past scans with search, filter, and detail view.
  - `/settings`: **Settings** - Language selection, account profile, security controls.

### Internationalization (i18n):
- Managed by `frontend/src/context/LanguageContext.jsx`.
- Supports 3 languages:
  - `en` (English) - Default
  - `mr` (मराठी - Marathi)
  - `hi` (हिन्दी - Hindi)
- Translations are fully synchronized across UI labels, buttons, navigation, and backend Claude advisory outputs.

---

## 10. Development & Execution Instructions

### Prerequisites:
- Python 3.10+
- Node.js 18+ and npm
- Valid `.env` file in root with `ANTHROPIC_API_KEY`

### Backend Setup:
```powershell
# From project root:
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Run FastAPI Development Server:
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### Frontend Setup:
```powershell
# In a second terminal:
cd frontend
npm install
npm run dev
```
- Frontend application URL: `http://localhost:5173`
- Production build validation: `npm run build`

---

## 11. Code Quality, Safety & Testing

### Syntax and Import Check:
```powershell
python -m py_compile backend/app/main.py backend/app/claude_service.py backend/app/auth.py
```

### Claude API Smoke Test:
```powershell
cd backend
python app/test_claude.py
```

### Image Validation Constraints:
- Resolution: Minimum $224 \times 224$ pixels.
- Format: JPEG, PNG, WEBP only.
- Brightness: Checks grayscale luminance mean; rejects images darker than 25 or brighter than 235.
- Contrast: Rejects low-contrast blurry images ($\sigma < 15$).

---

## 12. Guidelines for Future AI Models Modifying This Codebase

When working on AgriMind AI, always follow these principles:
1. **Never override PyTorch model prediction from LLMs:** The ML classifier is the primary diagnostic instrument. The LLM's role is strictly advisory based on the ML prediction.
2. **Preserve Fallbacks:** Any changes to `claude_service.py` must maintain the local `disease_recommendations.json` fallback path.
3. **Preserve Backward Compatibility:** The `/recommendation/stream` and `/predict` endpoints must remain compatible with the React frontend payload structures.
4. **No Tailwind in Frontend:** The frontend uses pure, structured Vanilla CSS with CSS variables in `index.css` and `App.css`. Do not inject Tailwind or arbitrary CSS utilities unless explicitly instructed.
5. **Keep Credentials in `.env`:** Never hardcode API keys or secret tokens into source files or logs.
