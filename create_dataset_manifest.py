from pathlib import Path
import csv


# ============================================================
# AGRIMIND AI
# DATASET MANIFEST GENERATOR
# ============================================================

DATASET_DIR = Path("datasets/raw/soybean")

OUTPUT_DIR = Path("datasets/manifests")

OUTPUT_FILE = OUTPUT_DIR / "soybean_manifest.csv"

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def get_image_files(folder):
    """Return supported image files."""

    return sorted(
        [
            file
            for file in folder.iterdir()
            if file.is_file()
            and file.suffix.lower() in IMAGE_EXTENSIONS
        ]
    )


def main():

    print("=" * 70)
    print("🌱 AGRIMIND AI - DATASET MANIFEST GENERATOR")
    print("=" * 70)

    # --------------------------------------------------------
    # Check dataset
    # --------------------------------------------------------

    if not DATASET_DIR.exists():

        print("\n❌ Dataset not found.")

        print(
            f"Expected location: {DATASET_DIR}"
        )

        print(
            "\nExtract the Soybean dataset first."
        )

        return

    # --------------------------------------------------------
    # Find class folders
    # --------------------------------------------------------

    class_folders = sorted(
        [
            folder
            for folder in DATASET_DIR.iterdir()
            if folder.is_dir()
        ]
    )

    if not class_folders:

        print("\n❌ No class folders found.")

        return

    # --------------------------------------------------------
    # Create output folder
    # --------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # Create CSV
    # --------------------------------------------------------

    with open(
        OUTPUT_FILE,
        "w",
        newline="",
        encoding="utf-8"
    ) as csv_file:

        writer = csv.writer(csv_file)

        # Header
        writer.writerow(
            [
                "crop",
                "class",
                "filename",
                "relative_path"
            ]
        )

        total_images = 0

        # ----------------------------------------------------
        # Process classes
        # ----------------------------------------------------

        for class_folder in class_folders:

            images = get_image_files(
                class_folder
            )

            print(
                f"\n📁 {class_folder.name}"
            )

            print(
                f"   Images: {len(images)}"
            )

            for image in images:

                relative_path = image.relative_to(
                    DATASET_DIR
                )

                writer.writerow(
                    [
                        "soybean",
                        class_folder.name,
                        image.name,
                        str(relative_path)
                    ]
                )

                total_images += 1

    # --------------------------------------------------------
    # Final report
    # --------------------------------------------------------

    print("\n" + "=" * 70)

    print(
        "✅ MANIFEST CREATED"
    )

    print("=" * 70)

    print(
        f"\nTotal images: {total_images}"
    )

    print(
        f"Manifest: {OUTPUT_FILE}"
    )

    print("=" * 70)


if __name__ == "__main__":

    main()