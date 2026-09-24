from pathlib import Path
from PIL import Image, ImageOps
import shutil
import random

SOURCE = Path("datasets/processed/pigeon_pea_split/train")
OUTPUT = Path("datasets/processed/pigeon_pea_targeted/train")

CLASSES = [
    "Healthy",
    "Leaf_Spot",
    "Leaf_webber",
    "Sterilic_mosaic",
]

random.seed(42)

# Create output directories
for class_name in CLASSES:
    (OUTPUT / class_name).mkdir(parents=True, exist_ok=True)

# Copy all original training images unchanged
for class_name in CLASSES:
    source_dir = SOURCE / class_name
    output_dir = OUTPUT / class_name

    for image_path in source_dir.glob("*.*"):
        shutil.copy2(image_path, output_dir / image_path.name)

# Targeted augmentation only for Sterilic_mosaic
source_dir = SOURCE / "Sterilic_mosaic"
output_dir = OUTPUT / "Sterilic_mosaic"

images = list(source_dir.glob("*.*"))

for index, image_path in enumerate(images):
    image = Image.open(image_path).convert("RGB")

    # Horizontal flip
    flipped = ImageOps.mirror(image)
    flipped.save(output_dir / f"sterilic_flip_{index:04d}.jpg")

    # Small rotation
    rotated = image.rotate(8, expand=False)
    rotated.save(output_dir / f"sterilic_rotate_{index:04d}.jpg")

print("Targeted dataset created successfully.")
print()

for class_name in CLASSES:
    count = len(list((OUTPUT / class_name).glob("*.*")))
    print(f"{class_name}: {count}")