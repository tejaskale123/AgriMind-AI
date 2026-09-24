from pathlib import Path
import random
from PIL import Image, ImageEnhance, ImageOps

SOURCE = Path("datasets/processed/maize_extended/train")
OUTPUT = Path("datasets/processed/maize_extended_final300/train")
TARGET = 300
random.seed(42)

EXT = {".jpg", ".jpeg", ".png", ".webp"}

def images(folder):
    return sorted([p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in EXT])

def aug(img, v):
    if v == 0: return img.copy()
    if v == 1: return img.rotate(90, expand=True)
    if v == 2: return img.rotate(180, expand=True)
    if v == 3: return img.rotate(270, expand=True)
    if v == 4: return ImageOps.mirror(img)
    if v == 5: return ImageOps.mirror(img.rotate(90, expand=True))
    if v == 6: return ImageEnhance.Brightness(img).enhance(1.15)
    if v == 7: return ImageEnhance.Brightness(img).enhance(0.85)
    if v == 8: return ImageEnhance.Contrast(img).enhance(1.15)
    return ImageEnhance.Contrast(img).enhance(0.85)

OUTPUT.mkdir(parents=True, exist_ok=True)

for folder in sorted(SOURCE.iterdir()):
    if not folder.is_dir():
        continue

    src = images(folder)
    out = OUTPUT / folder.name
    out.mkdir(parents=True, exist_ok=True)

    if len(src) >= TARGET:
        selected = src[:TARGET]
        for i, p in enumerate(selected, 1):
            with Image.open(p) as im:
                im.convert("RGB").save(out / f"original_{i:04d}.jpg", "JPEG", quality=92)
    else:
        saved = 0
        for i, p in enumerate(src, 1):
            with Image.open(p) as im:
                im.convert("RGB").save(out / f"original_{i:04d}.jpg", "JPEG", quality=92)
            saved += 1

        idx = 0
        variant = 1
        while saved < TARGET:
            p = src[idx % len(src)]
            with Image.open(p) as im:
                result = aug(im.convert("RGB"), variant % 9)
                result.save(out / f"aug_{saved+1:04d}.jpg", "JPEG", quality=92)
            saved += 1
            idx += 1
            variant += 1

    print(f"{folder.name}: {len(src)} -> {len(images(out))}")

print("\nFINAL300 DATASET CREATED")
