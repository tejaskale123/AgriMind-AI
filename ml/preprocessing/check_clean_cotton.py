from pathlib import Path

from PIL import Image


# ============================================================
# AGRIMIND AI
# CLEAN COTTON DATASET CHECKER
# ============================================================

DATASET_DIR = Path(
    "datasets/processed/cotton_clean"
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
        and file.suffix.lower()
        in IMAGE_EXTENSIONS
    ]


def check_image(image_path):

    try:

        with Image.open(image_path) as image:

            image.verify()

        return True

    except Exception:

        return False


def main():

    print("=" * 70)
    print("🌱 AGRIMIND AI - CLEAN COTTON DATASET CHECK")
    print("=" * 70)

    if not DATASET_DIR.exists():

        print("\nERROR: Clean Cotton dataset not found.")

        print(DATASET_DIR)

        return

    images = get_images(
        DATASET_DIR
    )

    print("\nDataset:")
    print(DATASET_DIR)

    print("\nChecking images...")
    print("-" * 70)

    good = 0
    bad = 0

    bad_images = []

    for index, image in enumerate(
        images,
        start=1
    ):

        if check_image(image):

            good += 1

        else:

            bad += 1

            bad_images.append(
                str(image)
            )

        if index % 200 == 0:

            print(
                f"Checked: {index}/{len(images)}"
            )

    print("\n" + "=" * 70)
    print("CLEAN COTTON DATASET VALIDATION")
    print("=" * 70)

    print(
        f"Total : {len(images)}"
    )

    print(
        f"Good  : {good}"
    )

    print(
        f"Bad   : {bad}"
    )

    if bad_images:

        print("\n❌ BAD IMAGES")

        for image in bad_images:

            print(
                f"  → {image}"
            )

    else:

        print("\n✅ No corrupted images found.")

    print("=" * 70)


if __name__ == "__main__":

    main()