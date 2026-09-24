from pathlib import Path
from PIL import Image

DATASET = Path("datasets/processed/pigeon_pea_split")
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

total = valid = corrupt = 0

print("=" * 70)
print("AGRIMIND AI - PIGEON PEA DATASET VALIDATION")
print("=" * 70)

for split in ["train", "val", "test"]:
    split_total = split_valid = split_corrupt = 0
    print(f"\n{split.upper()}")

    split_dir = DATASET / split

    for class_dir in sorted(split_dir.iterdir()):
        if not class_dir.is_dir():
            continue

        class_total = class_valid = class_corrupt = 0

        for file in class_dir.iterdir():
            if file.is_file() and file.suffix.lower() in EXTENSIONS:
                class_total += 1
                try:
                    with Image.open(file) as img:
                        img.verify()
                    class_valid += 1
                except Exception:
                    class_corrupt += 1

        print(f"{class_dir.name}: Total={class_total}, Valid={class_valid}, Corrupt={class_corrupt}")

        split_total += class_total
        split_valid += class_valid
        split_corrupt += class_corrupt

    print(f"{split} TOTAL: {split_total} | VALID: {split_valid} | CORRUPT: {split_corrupt}")

    total += split_total
    valid += split_valid
    corrupt += split_corrupt

print("\n" + "=" * 70)
print(f"FINAL TOTAL: {total}")
print(f"VALID      : {valid}")
print(f"CORRUPT    : {corrupt}")
print("=" * 70)
