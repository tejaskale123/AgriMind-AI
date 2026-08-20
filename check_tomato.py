from PIL import Image
from pathlib import Path

p = Path("datasets/crop/Tomato")

files = list(p.rglob("*.jpg"))

good = 0
bad = 0
badfiles = []

print(f"Checking {len(files)} images...")

for f in files:
    try:
        with Image.open(f) as img:
            img.verify()
        good += 1
    except Exception:
        bad += 1
        badfiles.append(str(f))

print()
print("Total:", len(files))
print("Good:", good)
print("Bad:", bad)

if badfiles:
    print("\nBAD FILES:")
    for f in badfiles:
        print(f)