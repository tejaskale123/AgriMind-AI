from pathlib import Path
from PIL import Image

ROOT = Path("datasets/crop")

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

total_images = 0
total_good = 0
total_bad = 0

print("=" * 70)
print("                 AGRIMIND-AI DATASET AUDIT")
print("=" * 70)

for crop_dir in sorted(ROOT.iterdir()):

    if not crop_dir.is_dir():
        continue

    print(f"\n🌱 CROP: {crop_dir.name}")
    print("-" * 70)

    crop_total = 0
    crop_good = 0
    crop_bad = 0

    for class_dir in sorted(crop_dir.iterdir()):

        if not class_dir.is_dir():
            continue

        files = [
            f for f in class_dir.rglob("*")
            if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
        ]

        good = 0
        bad = 0

        for file in files:
            try:
                with Image.open(file) as img:
                    img.verify()
                good += 1
            except Exception:
                bad += 1

        crop_total += len(files)
        crop_good += good
        crop_bad += bad

        print(
            f"{class_dir.name:35} "
            f"Total: {len(files):5} | "
            f"Good: {good:5} | "
            f"Bad: {bad:3}"
        )

    print("-" * 70)
    print(
        f"{'CROP TOTAL':35} "
        f"Total: {crop_total:5} | "
        f"Good: {crop_good:5} | "
        f"Bad: {crop_bad:3}"
    )

    total_images += crop_total
    total_good += crop_good
    total_bad += crop_bad

print("\n" + "=" * 70)
print("                         FINAL SUMMARY")
print("=" * 70)

print("Total Images :", total_images)
print("Good Images  :", total_good)
print("Bad Images   :", total_bad)

if total_bad == 0:
    print("\n✅ DATASET AUDIT PASSED")
    print("No corrupted images found.")
else:
    print("\n⚠️ DATASET AUDIT NEEDS ATTENTION")
    print("Some corrupted images were found.")