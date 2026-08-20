# AgriMind AI - Dataset Sources

## Project Crop Scope

AgriMind AI currently focuses on five agriculture crops:

1. Soybean
2. Cotton
3. Maize
4. Tomato
5. Wheat

---

# 1. Soybean

## Dataset

Multi-Class Soybean Leaf Disease Dataset

## Source

Mendeley Data

## Version

Version 2

## Disease Classes

- Healthy
- Bacterial Blight
- Cercospora Leaf Blight
- Sudden Death Syndrome
- Rust

## Usage

Soybean disease classification.

## License

CC BY 4.0

## Status

Downloaded / Pending local extraction.

---

# 2. Cotton

## Dataset

Cotton Leaf Disease Dataset

## Usage

Cotton disease classification.

## Status

Dataset selection and verification pending.

---

# 3. Maize

## Primary Dataset

PlantVillage

## Classes

- Healthy
- Cercospora Leaf Spot / Gray Leaf Spot
- Common Rust
- Northern Leaf Blight

## Usage

Maize disease classification.

## Status

PlantVillage metadata analyzed.

---

# 4. Tomato

## Primary Dataset

PlantVillage

## Classes

- Healthy
- Bacterial Spot
- Early Blight
- Late Blight
- Leaf Mold
- Septoria Leaf Spot
- Spider Mites
- Target Spot
- Tomato Yellow Leaf Curl Virus
- Tomato Mosaic Virus

## Usage

Tomato disease classification.

## Status

PlantVillage metadata analyzed.

---

# 5. Wheat

## Dataset

Wheat disease dataset

## Usage

Wheat disease classification.

## Status

Dataset selection and verification pending.

---

# Dataset Preparation Pipeline

The datasets will follow this pipeline:

Raw Dataset
↓
Dataset Validation
↓
Corrupt Image Check
↓
Duplicate Check
↓
Cleaning
↓
Train / Validation / Test Split
↓
Preprocessing
↓
Model Training
↓
Evaluation
↓
Final Model


# Important Rule

Raw datasets will be preserved separately.

Processed datasets will be stored separately from raw datasets.

No raw dataset files should be deleted during preprocessing without verification.