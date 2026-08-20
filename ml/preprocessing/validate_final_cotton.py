from pathlib import Path
from PIL import Image


# ============================================================
# AGRIMIND AI
# FINAL COTTON DATASET VALIDATOR
# ============================================================

DATASET_DIR = Path(
    "datasets/processed/cotton_final_clean"
)

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def get_images(folder):

    return [
        file
        for file in folder.rglob("*")
        if file.is_file()
        and file.suffix.lower() in IMAGE_EXTENSIONS
    ]


def validate_image(image_path):

    try:

        with Image.open(image_path) as image:

            image.verify()

        return True

    except Exception:

        return False


def main():

    print("=" * 70)
    print("🌱 AGRIMIND AI - FINAL COTTON VALIDATION")
    print("=" * 70)

    if not DATASET_DIR.exists():

        print("\nERROR: Final dataset not found.")
        print(DATASET_DIR)
        return

    class_folders = sorted(
        [
            folder
            for folder in DATASET_DIR.iterdir()
            if folder.is_dir()
        ],
        key=lambda x: x.name
    )

    total = 0
    valid = 0
    corrupt = 0

    print("\nCLASS-WISE VALIDATION")
    print("-" * 70)

    for class_folder in class_folders:

        images = get_images(
            class_folder
        )

        class_valid = 0
        class_corrupt = 0

        for image in images:

            total += 1

            if validate_image(image):

                valid += 1
                class_valid += 1

            else:

                corrupt += 1
                class_corrupt += 1

                print(
                    f"CORRUPT: {image}"
                )

        print(
            f"{class_folder.name}: "
            f"Total={len(images)}, "
            f"Valid={class_valid}, "
            f"Corrupt={class_corrupt}"
        )

    print("\n" + "=" * 70)
    print("FINAL VALIDATION REPORT")
    print("=" * 70)

    print(
        f"Total images   : {total}"
    )

    print(
        f"Valid images   : {valid}"
    )

    print(
        f"Corrupt images : {corrupt}"
    )

    if total == 1101 and valid == 1101 and corrupt == 0:

        print(
            "\n✅ FINAL COTTON DATASET VALIDATION PASSED"
        )

    else:

        print(
            "\n⚠️ DATASET NEEDS REVIEW"
        )

    print("=" * 70)


if __name__ == "__main__":

    main()