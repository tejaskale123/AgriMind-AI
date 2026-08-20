from pathlib import Path
from PIL import Image

ROOT = Path("datasets/raw/soybean_extracted")

classes = [
    "Bacterial Blight",
    "Cercospora Leaf Blight",
    "Healthy",
    "Rust",
    "Sudden Death Syndrome",
]

files = []

for class_name in classes:
    matches = list(ROOT.rglob(class_name))

    for folder in matches:
        files.extend(
            f for f in folder.rglob("*")
            if f.is_file()
            and f.suffix.lower() in {".jpg", ".jpeg", ".png"}
        )

print("=" * 60)
print("          SOYBEAN DATASET CHECK")
print("=" * 60)

print(f"Checking {len(files)} images...")

good = 0
bad = 0
bad_files = []

for file in files:
    try:
        with Image.open(file) as img:
            img.verify()
        good += 1

    except Exception:
        bad += 1
        bad_files.append(str(file))

print()
print("=" * 60)
print(f"Total : {len(files)}")
print(f"Good  : {good}")
print(f"Bad   : {bad}")
print("=" * 60)

if bad_files:
    print()
    print("BAD FILES:")

    for file in bad_files:
        print(file)
else:
    print()
    print("No corrupted images found.")