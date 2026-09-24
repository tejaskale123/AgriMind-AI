from pathlib import Path
from collections import Counter
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms, models

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_ROOT = PROJECT_ROOT / "datasets" / "processed" / "maize_extended_final300" / "train"
MODEL_PATH = PROJECT_ROOT / "models" / "maize_extended_final300_efficientnet_b0.pth"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    ),
])

dataset = datasets.ImageFolder(DATASET_ROOT, transform=transform)

target_class = "Asphalt_Stain"
target_index = dataset.class_to_idx[target_class]

indices = [
    i for i, (_, label) in enumerate(dataset.samples)
    if label == target_index
]

subset = Subset(dataset, indices)

loader = DataLoader(
    subset,
    batch_size=32,
    shuffle=False,
    num_workers=0
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

classes = checkpoint["classes"]

model = models.efficientnet_b0(weights=None)
model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    len(classes)
)

model.load_state_dict(checkpoint["model_state_dict"])
model.to(DEVICE)
model.eval()

prediction_counts = Counter()
correct = 0
total = 0

with torch.no_grad():
    for images, labels in loader:
        images = images.to(DEVICE)
        outputs = model(images)
        predictions = outputs.argmax(dim=1).cpu()

        for pred, label in zip(predictions, labels):
            prediction_counts[classes[pred.item()]] += 1

            if pred.item() == label.item():
                correct += 1

            total += 1

print("=" * 70)
print("MAIZE FINAL300 - ASPHALT_STAIN TRAIN CHECK")
print("=" * 70)
print(f"Device: {DEVICE}")
print(f"Total Asphalt_Stain training images: {total}")
print(f"Correct predictions: {correct}")
print(f"Training accuracy: {correct / total * 100:.2f}%")
print()
print("Predicted classes:")
for name, count in prediction_counts.most_common():
    print(f"  {name}: {count}")
print("=" * 70)
