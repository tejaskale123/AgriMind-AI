from pathlib import Path
from PIL import Image

ROOT = Path("datasets/raw/wheat_hf")

files = []

for folder in [
    "Wheat___Brown_Rust",
    "Wheat___Healthy",
    "Wheat___Yellow_Rust"
]:
    files.extend((ROOT / folder).glob("*.jpg"))

good = 0
bad = 0
badfiles = []

print(f"Checking {len(files)} Wheat images...\n")

for f in files:
    try:
        with Image.open(f) as img:
            img.verify()

        good += 1

    except Exception:
        bad += 1
        badfiles.append(str(f))

print("================================")
print("WHEAT DATASET CHECK")
print("================================")

print("Total:", len(files))
print("Good:", good)
print("Bad:", bad)

if badfiles:
    print("\nBAD FILES:")

    for f in badfiles:
        print(f)

else:
    print("\nNo corrupted images found.")