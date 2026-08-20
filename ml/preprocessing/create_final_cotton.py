from pathlib import Path
from collections import defaultdict
import csv
import shutil


# ============================================================
# AGRIMIND AI
# FINAL COTTON DATASET CREATOR
# ============================================================

SOURCE_DIR = Path("datasets/raw/cotton")

REPORT_PATH = Path(
    "datasets/reports/cotton_duplicate_report.csv"
)

OUTPUT_DIR = Path(
    "datasets/processed/cotton_final_clean"
)

QUARANTINE_DIR = Path(
    "datasets/processed/cotton_duplicate_quarantine"
)

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def get_class(file_path):
    return Path(file_path).parent.name


def main():

    print("=" * 70)
    print("🌱 AGRIMIND AI - FINAL COTTON DATASET")
    print("=" * 70)

    if not SOURCE_DIR.exists():
        print("\nERROR: Raw Cotton dataset not found.")
        return

    if not REPORT_PATH.exists():
        print("\nERROR: Duplicate report not found.")
        return

    # --------------------------------------------------------
    # Read duplicate report
    # --------------------------------------------------------

    with open(
        REPORT_PATH,
        encoding="utf-8"
    ) as file:

        rows = list(
            csv.DictReader(file)
        )

    groups = defaultdict(list)

    for row in rows:

        groups[row["Group"]].append(
            row["File"]
        )

    # --------------------------------------------------------
    # Identify files to quarantine
    # --------------------------------------------------------

    files_to_quarantine = set()

    same_class_groups = 0
    cross_class_groups = 0

    for group_id, files in groups.items():

        classes = {
            get_class(file)
            for file in files
        }

        # Cross-class conflict:
        # remove ALL images from this group
        if len(classes) > 1:

            cross_class_groups += 1

            for file in files:
                files_to_quarantine.add(file)

        # Same-class duplicate:
        # keep first, quarantine remaining
        else:

            same_class_groups += 1

            for file in files[1:]:
                files_to_quarantine.add(file)

    print(
        f"\nDuplicate groups       : {len(groups)}"
    )

    print(
        f"Same-class groups      : {same_class_groups}"
    )

    print(
        f"Cross-class groups     : {cross_class_groups}"
    )

    print(
        f"Images to quarantine   : {len(files_to_quarantine)}"
    )

    # --------------------------------------------------------
    # Recreate output folders
    # --------------------------------------------------------

    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)

    if QUARANTINE_DIR.exists():
        shutil.rmtree(QUARANTINE_DIR)

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    QUARANTINE_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # Process dataset
    # --------------------------------------------------------

    total_original = 0
    total_clean = 0
    total_quarantined = 0

    class_folders = sorted(
        [
            folder
            for folder in SOURCE_DIR.iterdir()
            if folder.is_dir()
        ],
        key=lambda x: x.name
    )

    print(
        "\n" + "=" * 70
    )

    print(
        "CREATING FINAL CLEAN DATASET"
    )

    print(
        "=" * 70
    )

    for class_folder in class_folders:

        output_class = (
            OUTPUT_DIR /
            class_folder.name
        )

        quarantine_class = (
            QUARANTINE_DIR /
            class_folder.name
        )

        output_class.mkdir(
            parents=True,
            exist_ok=True
        )

        quarantine_class.mkdir(
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

        class_clean = 0
        class_quarantine = 0

        for image in images:

            total_original += 1

            if str(image) in files_to_quarantine:

                shutil.copy2(
                    image,
                    quarantine_class / image.name
                )

                class_quarantine += 1
                total_quarantined += 1

            else:

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
            f"  Original    : {len(images)}"
        )

        print(
            f"  Clean       : {class_clean}"
        )

        print(
            f"  Quarantined : {class_quarantine}"
        )

    # --------------------------------------------------------
    # Final report
    # --------------------------------------------------------

    print(
        "\n" + "=" * 70
    )

    print(
        "FINAL COTTON DATASET COMPLETE"
    )

    print(
        "=" * 70
    )

    print(
        f"\nOriginal images    : {total_original}"
    )

    print(
        f"Clean images       : {total_clean}"
    )

    print(
        f"Quarantined images : {total_quarantined}"
    )

    print(
        "\nFinal dataset:"
    )

    print(
        OUTPUT_DIR
    )

    print(
        "\nRaw dataset was NOT modified."
    )

    if total_original == 1373:
        print(
            "\n✅ Original count verified: 1373"
        )

    if total_clean == 1101:
        print(
            "✅ Expected final clean count: 1101"
        )
    else:
        print(
            f"⚠️ Final clean count is {total_clean}, not 1101."
        )

    print("=" * 70)


if __name__ == "__main__":
    main()