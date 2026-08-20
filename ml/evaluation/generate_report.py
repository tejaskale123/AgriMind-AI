from pathlib import Path
import json

import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import ConfusionMatrixDisplay


# ============================================================
# AGRIMIND AI
# MODEL EVALUATION VISUALIZATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

RESULT_FILE = (
    PROJECT_ROOT
    / "ml"
    / "evaluation"
    / "evaluation_results.json"
)

REPORT_DIR = (
    PROJECT_ROOT
    / "ml"
    / "evaluation"
    / "reports"
)

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# LOAD RESULTS
# ============================================================

with open(
    RESULT_FILE,
    "r",
    encoding="utf-8",
) as file:

    results = json.load(file)


# ============================================================
# MODEL INFORMATION
# ============================================================

classes = results["classes"]

confusion_matrix = np.array(
    results["confusion_matrix"]
)

metrics = {
    "Accuracy": results["accuracy"],
    "Precision": results["precision"],
    "Recall": results["recall"],
    "F1 Score": results["f1_score"],
}


# ============================================================
# CONFUSION MATRIX
# ============================================================

plt.figure(
    figsize=(10, 8)
)

display = ConfusionMatrixDisplay(
    confusion_matrix=confusion_matrix,
    display_labels=classes,
)

display.plot(
    values_format="d",
    xticks_rotation=45,
)

plt.title(
    "AgriMind AI - Soybean Disease Confusion Matrix"
)

plt.tight_layout()

confusion_path = (
    REPORT_DIR
    / "confusion_matrix.png"
)

plt.savefig(
    confusion_path,
    dpi=300,
    bbox_inches="tight",
)

plt.close()


# ============================================================
# MODEL PERFORMANCE
# ============================================================

plt.figure(
    figsize=(9, 6)
)

names = list(metrics.keys())
values = list(metrics.values())

bars = plt.bar(
    names,
    values,
)

plt.ylim(
    0,
    105,
)

plt.ylabel(
    "Score (%)"
)

plt.title(
    "AgriMind AI - Model Performance"
)

for bar, value in zip(
    bars,
    values,
):

    plt.text(
        bar.get_x()
        + bar.get_width() / 2,
        value + 1,
        f"{value:.2f}%",
        ha="center",
        fontweight="bold",
    )

plt.tight_layout()

performance_path = (
    REPORT_DIR
    / "model_performance.png"
)

plt.savefig(
    performance_path,
    dpi=300,
    bbox_inches="tight",
)

plt.close()


# ============================================================
# FINAL MESSAGE
# ============================================================

print("=" * 60)

print(
    "AGRIMIND AI - REPORT GENERATION COMPLETE"
)

print("=" * 60)

print()

print(
    f"Confusion Matrix: {confusion_path}"
)

print(
    f"Model Performance: {performance_path}"
)

print()

print(
    "Accuracy  :", f"{results['accuracy']:.2f}%"
)

print(
    "Precision :", f"{results['precision']:.2f}%"
)

print(
    "Recall    :", f"{results['recall']:.2f}%"
)

print(
    "F1 Score  :", f"{results['f1_score']:.2f}%"
)

print()

print(
    "✅ Evaluation graphs generated successfully."
)