from pathlib import Path
from PIL import Image
import argparse


# ============================================================
# AGRIMIND AI
# DATASET VALIDATOR
# ============================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def is_image_file(file_path):
    return (
        file_path.is_file()
        and file_path.suffix.lower() in IMAGE_EXTENSIONS
    )


def validate_image(image_path):
    try:
        with Image.open(image_path) as image:
            image.verify()

        return True, None

    except Exception as error:
        return False, str(error)


def main():

    parser = argparse.ArgumentParser(
        description="AgriMind AI Dataset Validator"
    )

    parser.add_argument(
        "--crop",
        required=True,
        help="Crop name, example: soybean or cotton"
    )

    args = parser.parse_args()

    crop = args.crop.lower()

    dataset_dir = Path("datasets/raw") / crop

    print("=" * 70)
    print("🌱 AGRIMIND AI - DATASET VALIDATOR")
    print("=" * 70)

    print(f"\nCrop: {crop}")
    print(f"Dataset: {dataset_dir}")

    # --------------------------------------------------------
    # Check dataset folder
    # --------------------------------------------------------

    if not dataset_dir.exists():

        print("\n❌ Dataset folder not found.")
        print(f"Expected: {dataset_dir}")

        return

    # --------------------------------------------------------
    # Find class folders
    # --------------------------------------------------------

    class_folders = sorted(
        [
            folder
            for folder in dataset_dir.iterdir()
            if folder.is_dir()
        ]
    )

    if not class_folders:

        print("\n❌ No class folders found.")

        return

    print("\n📂 CLASS FOLDERS")
    print("-" * 70)

    for folder in class_folders:
        print(f"• {folder.name}")

    # --------------------------------------------------------
    # Statistics
    # --------------------------------------------------------

    total_images = 0
    valid_images = 0
    corrupt_images = 0
    unsupported_files = 0

    print("\n📊 CLASS-WISE VALIDATION")
    print("-" * 70)

    # --------------------------------------------------------
    # Validate every class
    # --------------------------------------------------------

    for class_folder in class_folders:

        all_files = [
            file
            for file in class_folder.iterdir()
            if file.is_file()
        ]

        image_files = [
            file
            for file in all_files
            if is_image_file(file)
        ]

        unsupported = [
            file
            for file in all_files
            if not is_image_file(file)
        ]

        class_valid = 0
        class_corrupt = 0

        for image_path in image_files:

            total_images += 1

            is_valid, error = validate_image(image_path)

            if is_valid:

                valid_images += 1
                class_valid += 1

            else:

                corrupt_images += 1
                class_corrupt += 1

                print(
                    f"❌ Corrupt: {image_path}"
                )

                print(
                    f"   Error: {error}"
                )

        unsupported_files += len(unsupported)

        print(
            f"{class_folder.name}: "
            f"Total={len(image_files)}, "
            f"Valid={class_valid}, "
            f"Corrupt={class_corrupt}"
        )

    # --------------------------------------------------------
    # Final report
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("📊 FINAL VALIDATION REPORT")
    print("=" * 70)

    print(f"Total images       : {total_images}")
    print(f"Valid images       : {valid_images}")
    print(f"Corrupt images     : {corrupt_images}")
    print(f"Unsupported files  : {unsupported_files}")

    print("\n" + "=" * 70)

    if corrupt_images == 0:
        print("✅ No corrupt images detected.")
    else:
        print("⚠️ Corrupt images detected.")

    if unsupported_files == 0:
        print("✅ No unsupported files detected.")
    else:
        print("⚠️ Unsupported files detected.")

    print("=" * 70)
    print("✅ DATASET VALIDATION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()