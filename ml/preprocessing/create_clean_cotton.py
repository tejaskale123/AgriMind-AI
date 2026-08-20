from pathlib import Path
import shutil


# ============================================================
# AGRIMIND AI
# CLEAN COTTON DATASET CREATOR
# ============================================================

SOURCE_DIR = Path("datasets/raw/cotton")

QUARANTINE_DIR = Path(
    "datasets/processed/cotton_quarantine"
)

OUTPUT_DIR = Path(
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
        and file.suffix.lower() in IMAGE_EXTENSIONS
    ]


def main():

    print("=" * 70)
    print("🌱 AGRIMIND AI - CLEAN COTTON DATASET")
    print("=" * 70)

    # --------------------------------------------------------
    # 1. Check source
    # --------------------------------------------------------

    if not SOURCE_DIR.exists():

        print("\nERROR: Cotton raw dataset not found.")
        print(SOURCE_DIR)
        return

    if not QUARANTINE_DIR.exists():

        print("\nERROR: Quarantine folder not found.")
        print(QUARANTINE_DIR)
        return

    # --------------------------------------------------------
    # 2. Find quarantine filenames
    # --------------------------------------------------------

    quarantine_files = set()

    for file in QUARANTINE_DIR.rglob("*"):

        if (
            file.is_file()
            and file.suffix.lower()
            in IMAGE_EXTENSIONS
        ):

            original_name = file.name.split(
                "__",
                1
            )[-1]

            quarantine_files.add(
                original_name
            )

    print("\nRaw dataset:")
    print(SOURCE_DIR)

    print("\nQuarantine images:")
    print(len(quarantine_files))

    # --------------------------------------------------------
    # 3. Remove previous clean dataset
    # --------------------------------------------------------

    if OUTPUT_DIR.exists():

        print("\nRemoving previous clean dataset...")

        shutil.rmtree(
            OUTPUT_DIR
        )

    # --------------------------------------------------------
    # 4. Process classes
    # --------------------------------------------------------

    class_folders = sorted(
        [
            folder
            for folder in SOURCE_DIR.iterdir()
            if folder.is_dir()
        ],
        key=lambda x: x.name
    )

    total_original = 0
    total_clean = 0
    total_removed = 0

    print("\n" + "=" * 70)
    print("CREATING CLEAN DATASET")
    print("=" * 70)

    for class_folder in class_folders:

        output_class = (
            OUTPUT_DIR
            / class_folder.name
        )

        output_class.mkdir(
            parents=True,
            exist_ok=True
        )

        images = [
            file
            for file in class_folder.iterdir()
            if (
                file.is_file()
                and file.suffix.lower()
                in IMAGE_EXTENSIONS
            )
        ]

        class_original = len(images)
        class_removed = 0
        class_clean = 0

        for image in images:

            total_original += 1

            if image.name in quarantine_files:

                class_removed += 1
                total_removed += 1

                continue

            shutil.copy2(
                image,
                output_class / image.name
            )

            class_clean += 1
            total_clean += 1

        print(
            f"\n{class_folder.name}"
        )

        print(
            f"  Original : {class_original}"
        )

        print(
            f"  Removed  : {class_removed}"
        )

        print(
            f"  Clean    : {class_clean}"
        )

    # --------------------------------------------------------
    # 5. Final summary
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("CLEAN DATASET COMPLETE")
    print("=" * 70)

    print(
        f"\nOriginal images : {total_original}"
    )

    print(
        f"Removed images  : {total_removed}"
    )

    print(
        f"Clean images    : {total_clean}"
    )

    print("\nClean dataset:")
    print(OUTPUT_DIR)

    print("\nRaw dataset was NOT modified.")

    print("=" * 70)


if __name__ == "__main__":

    main()