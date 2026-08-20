from pathlib import Path
from collections import defaultdict
import argparse
import csv

from PIL import Image
import imagehash


# ============================================================
# AGRIMIND AI
# DUPLICATE REPORT GENERATOR
# ============================================================

BASE_DATASET_DIR = Path("datasets/raw")
BASE_REPORT_DIR = Path("datasets/reports")

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def get_image_files(dataset_path):

    return [
        file
        for file in dataset_path.rglob("*")
        if file.is_file()
        and file.suffix.lower() in IMAGE_EXTENSIONS
    ]


def calculate_hash(image_path):

    try:

        with Image.open(image_path) as image:

            image = image.convert("RGB")

            return str(
                imagehash.phash(image)
            )

    except Exception:

        return None


def create_duplicate_report(crop):

    dataset_path = BASE_DATASET_DIR / crop

    report_path = (
        BASE_REPORT_DIR
        / f"{crop}_duplicate_report.csv"
    )

    print("=" * 70)
    print("🌱 AGRIMIND AI - DUPLICATE REPORT")
    print("=" * 70)

    # --------------------------------------------------------
    # 1. Check dataset
    # --------------------------------------------------------

    if not dataset_path.exists():

        print()
        print("ERROR: Dataset folder not found.")
        print(dataset_path)

        return

    # --------------------------------------------------------
    # 2. Find images
    # --------------------------------------------------------

    image_files = get_image_files(
        dataset_path
    )

    print()
    print("Crop:")
    print(crop)

    print()
    print("Dataset:")
    print(dataset_path)

    print()
    print("Total images:", len(image_files))

    if not image_files:

        print()
        print("ERROR: No images found.")

        return

    # --------------------------------------------------------
    # 3. Generate hashes
    # --------------------------------------------------------

    print()
    print("Generating image hashes...")
    print("-" * 70)

    hash_to_files = defaultdict(list)

    failed_images = []

    for index, image_path in enumerate(
        image_files,
        start=1
    ):

        image_hash = calculate_hash(
            image_path
        )

        if image_hash is None:

            failed_images.append(
                str(image_path)
            )

        else:

            hash_to_files[
                image_hash
            ].append(
                str(image_path)
            )

        if (
            index % 100 == 0
            or index == len(image_files)
        ):

            print(
                f"Processed: {index}/{len(image_files)}"
            )

    # --------------------------------------------------------
    # 4. Find duplicate groups
    # --------------------------------------------------------

    duplicate_groups = {
        image_hash: files
        for image_hash, files
        in hash_to_files.items()
        if len(files) > 1
    }

    duplicate_count = sum(
        len(files) - 1
        for files in duplicate_groups.values()
    )

    # --------------------------------------------------------
    # 5. Create report directory
    # --------------------------------------------------------

    report_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # 6. Write CSV report
    # --------------------------------------------------------

    with open(
        report_path,
        "w",
        newline="",
        encoding="utf-8"
    ) as csv_file:

        writer = csv.writer(
            csv_file
        )

        writer.writerow([
            "Group",
            "Hash",
            "File"
        ])

        group_number = 1

        for image_hash, files in duplicate_groups.items():

            for file in files:

                writer.writerow([
                    group_number,
                    image_hash,
                    file
                ])

            group_number += 1

    # --------------------------------------------------------
    # 7. Final summary
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("DUPLICATE REPORT COMPLETE")
    print("=" * 70)

    print(
        "Crop              :",
        crop
    )

    print(
        "Total images      :",
        len(image_files)
    )

    print(
        "Unique hashes     :",
        len(hash_to_files)
    )

    print(
        "Duplicate groups  :",
        len(duplicate_groups)
    )

    print(
        "Duplicate images  :",
        duplicate_count
    )

    print(
        "Failed images     :",
        len(failed_images)
    )

    print()
    print("Report saved to:")
    print(report_path)

    print()
    print("IMPORTANT:")
    print("No images were deleted.")

    print("=" * 70)


def main():

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--crop",
        required=True,
        help="Crop name"
    )

    args = parser.parse_args()

    create_duplicate_report(
        args.crop
    )


if __name__ == "__main__":

    main()