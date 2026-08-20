from pathlib import Path
from collections import defaultdict
import csv
import shutil


# ============================================================
# AGRIMIND AI
# CROSS-CLASS DUPLICATE QUARANTINE
# ============================================================

REPORT_PATH = Path(
    "datasets/reports/cotton_duplicate_report.csv"
)

SOURCE_DIR = Path(
    "datasets/raw/cotton"
)

QUARANTINE_DIR = Path(
    "datasets/processed/cotton_quarantine"
)


def get_class(file_path):
    """
    Get disease class from:
    datasets/raw/cotton/<CLASS>/<FILE>
    """

    return Path(file_path).parent.name


def main():

    print("=" * 70)
    print("AGRIMIND AI - COTTON CROSS-CLASS DUPLICATE QUARANTINE")
    print("=" * 70)

    if not REPORT_PATH.exists():

        print("\nERROR: Duplicate report not found.")
        print(REPORT_PATH)
        return

    rows = list(
        csv.DictReader(
            open(
                REPORT_PATH,
                encoding="utf-8"
            )
        )
    )

    groups = defaultdict(list)

    for row in rows:

        groups[row["Group"]].append(
            row["File"]
        )

    cross_class_groups = {}

    for group, files in groups.items():

        classes = {
            get_class(file)
            for file in files
        }

        if len(classes) > 1:

            cross_class_groups[group] = files

    print()
    print(
        "Cross-class duplicate groups:",
        len(cross_class_groups)
    )

    if not cross_class_groups:

        print("\nNo cross-class groups found.")
        return

    # --------------------------------------------------------
    # Create quarantine folder
    # --------------------------------------------------------

    if QUARANTINE_DIR.exists():

        shutil.rmtree(
            QUARANTINE_DIR
        )

    QUARANTINE_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # Copy conflicting images
    # --------------------------------------------------------

    copied = 0

    for group, files in cross_class_groups.items():

        group_dir = (
            QUARANTINE_DIR
            / f"group_{group}"
        )

        group_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        for file in files:

            source = Path(file)

            if not source.exists():

                print(
                    f"WARNING: Missing file: {source}"
                )

                continue

            class_name = source.parent.name

            destination = (
                group_dir
                / f"{class_name}__{source.name}"
            )

            shutil.copy2(
                source,
                destination
            )

            copied += 1

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("QUARANTINE COMPLETE")
    print("=" * 70)

    print(
        "Cross-class groups :",
        len(cross_class_groups)
    )

    print(
        "Images copied      :",
        copied
    )

    print()
    print("Quarantine folder:")
    print(QUARANTINE_DIR)

    print()
    print("IMPORTANT:")
    print("Original raw images were NOT deleted.")
    print("Original raw dataset remains untouched.")

    print("=" * 70)


if __name__ == "__main__":

    main()