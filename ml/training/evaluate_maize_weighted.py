from pathlib import Path
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

ROOT = Path(".")
TEST_DIR = ROOT / "datasets" / "processed" / "maize_extended" / "test"
MODEL_PATH = ROOT / "models" / "maize_extended_weighted_efficientnet_b0.pth"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

classes = checkpoint["classes"]

dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=transform
)

print("=" * 70)
print("AGRIMIND AI - MAIZE MODEL INDEPENDENT EVALUATION")
print("=" * 70)

print(f"\nDevice       : {DEVICE}")
print(f"Model        : {MODEL_PATH}")
print(f"Test dataset : {TEST_DIR}")
print(f"Test images  : {len(dataset)}")

print("\nModel classes:")
for i, name in enumerate(classes):
    print(f"  {i}: {name}")

print("\nDataset classes:")
for i, name in enumerate(dataset.classes):
    print(f"  {i}: {name}")

if classes != dataset.classes:
    raise RuntimeError(
        f"Class mismatch!\nModel: {classes}\nDataset: {dataset.classes}"
    )

model = models.efficientnet_b0(weights=None)

features = model.classifier[1].in_features

model.classifier[1] = nn.Linear(
    features,
    len(classes)
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(DEVICE)
model.eval()

loader = DataLoader(
    dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0
)

predictions = []
labels = []

with torch.no_grad():
    for images, batch_labels in loader:
        images = images.to(DEVICE)

        outputs = model(images)

        batch_predictions = outputs.argmax(dim=1)

        predictions.extend(
            batch_predictions.cpu().tolist()
        )

        labels.extend(
            batch_labels.tolist()
        )

accuracy = accuracy_score(
    labels,
    predictions
)

print("\n" + "=" * 70)
print("FINAL TEST RESULT")
print("=" * 70)

print(f"\nTest Images : {len(labels)}")
print(f"Accuracy    : {accuracy * 100:.2f}%")

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        labels,
        predictions,
        target_names=classes,
        digits=4,
        zero_division=0
    )
)

print("=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

matrix = confusion_matrix(
    labels,
    predictions
)

print("\nRows = Actual")
print("Columns = Predicted\n")
print(matrix)

print("\n" + "=" * 70)
print("PER-CLASS ACCURACY")
print("=" * 70)

for i, class_name in enumerate(classes):
    total = matrix[i].sum()
    correct = matrix[i, i]
    acc = (correct / total * 100) if total else 0

    print(
        f"{class_name}: "
        f"{acc:.2f}% ({correct}/{total})"
    )

print("\n" + "=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)
