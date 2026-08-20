from pathlib import Path
from PIL import Image


# ============================================================
# AGRIMIND AI
# CLEAN SOYBEAN DATASET VALIDATION
# ============================================================

DATASET_PATH = Path("datasets/processed/soybean_clean")

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def get_images():
    return [
        file
        for file in DATASET_PATH.rglob("*")
        if file.is_file()
        and file.suffix.lower() in IMAGE_EXTENSIONS
    ]


def check_images():

    print("=" * 65)
    print("AGRIMIND AI - CLEAN SOYBEAN DATASET CHECK")
    print("=" * 65)

    if not DATASET_PATH.exists():

        print("\nERROR: Clean dataset not found.")
        print(DATASET_PATH)

        return

    image_files = get_images()

    print("\nDataset:")
    print(DATASET_PATH)

    print("\nChecking images...")
    print("-" * 65)

    good = 0
    bad = 0
    bad_files = []

    for index, image_path in enumerate(image_files, start=1):

        try:

            with Image.open(image_path) as image:

                image.verify()

            good += 1

        except Exception:

            bad += 1
            bad_files.append(str(image_path))

        if index % 100 == 0:

            print(
                f"Checked: {index}/{len(image_files)}"
            )

    print("\n" + "=" * 65)
    print("CLEAN DATASET VALIDATION")
    print("=" * 65)

    print(f"Total : {len(image_files)}")
    print(f"Good  : {good}")
    print(f"Bad   : {bad}")

    if bad_files:

        print("\nBAD IMAGES:")

        for file in bad_files:

            print(" ->", file)

    else:

        print("\nNo corrupted images found.")

    print("=" * 65)


if __name__ == "__main__":

    check_images()