from pathlib import Path
from collections import defaultdict
import argparse

from PIL import Image
import imagehash


# ============================================================
# AGRIMIND AI
# MULTI-CROP TRAIN / VAL / TEST LEAKAGE CHECKER
# ============================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def get_images(folder):

    if not folder.exists():
        return []

    return [
        file
        for file in folder.rglob("*")
        if file.is_file()
        and file.suffix.lower()
        in IMAGE_EXTENSIONS
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


def main():

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--crop",
        required=True
    )

    args = parser.parse_args()

    crop = args.crop.lower()

    dataset_path = (
        Path("datasets/disease")
        / crop
    )

    print("=" * 65)
    print("🌱 AGRIMIND AI - DATASET LEAKAGE CHECK")
    print("=" * 65)

    print(
        f"\nCrop: {crop}"
    )

    print(
        "\nDataset:"
    )

    print(
        dataset_path
    )

    # --------------------------------------------------------
    # Check dataset
    # --------------------------------------------------------

    if not dataset_path.exists():

        print(
            "\nERROR: Dataset not found."
        )

        return

    splits = [
        "train",
        "val",
        "test"
    ]

    hash_to_locations = defaultdict(list)

    failed = []

    total = 0

    # --------------------------------------------------------
    # Process splits
    # --------------------------------------------------------

    for split in splits:

        split_path = (
            dataset_path
            / split
        )

        print(
            f"\nChecking: {split.upper()}"
        )

        images = get_images(
            split_path
        )

        print(
            f"Images: {len(images)}"
        )

        total += len(images)

        for image in images:

            image_hash = calculate_hash(
                image
            )

            if image_hash is None:

                failed.append(
                    str(image)
                )

            else:

                hash_to_locations[
                    image_hash
                ].append(
                    (
                        split,
                        str(image)
                    )
                )

    # --------------------------------------------------------
    # Find cross-split duplicates
    # --------------------------------------------------------

    leakage_groups = {}

    for image_hash, locations in (
        hash_to_locations.items()
    ):

        split_names = {
            location[0]
            for location in locations
        }

        if len(split_names) > 1:

            leakage_groups[
                image_hash
            ] = locations

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    print(
        "\n" + "=" * 65
    )

    print(
        "LEAKAGE ANALYSIS"
    )

    print(
        "=" * 65
    )

    print(
        f"Total images checked : {total}"
    )

    print(
        f"Unique hashes        : "
        f"{len(hash_to_locations)}"
    )

    print(
        f"Cross-split groups   : "
        f"{len(leakage_groups)}"
    )

    print(
        f"Failed images        : "
        f"{len(failed)}"
    )

    # --------------------------------------------------------
    # Leakage result
    # --------------------------------------------------------

    if leakage_groups:

        print(
            "\n⚠️ WARNING: "
            "CROSS-SPLIT DUPLICATES FOUND"
        )

        print(
            "-" * 65
        )

        for group_number, locations in enumerate(
            leakage_groups.values(),
            start=1
        ):

            print(
                f"\nGroup {group_number}"
            )

            for split, file in locations:

                print(
                    f"  [{split}] {file}"
                )

    else:

        print(
            "\n✅ SUCCESS: "
            "No cross-split duplicates found."
        )

    # --------------------------------------------------------
    # Failed images
    # --------------------------------------------------------

    if failed:

        print(
            "\n⚠️ Images that could not be hashed:"
        )

        for file in failed:

            print(
                f"  -> {file}"
            )

    # --------------------------------------------------------
    # Final status
    # --------------------------------------------------------

    print(
        "\n" + "=" * 65
    )

    if (
        not leakage_groups
        and not failed
    ):

        print(
            "✅ DATASET LEAKAGE CHECK PASSED"
        )

    else:

        print(
            "⚠️ DATASET LEAKAGE CHECK "
            "NEEDS REVIEW"
        )

    print(
        "=" * 65
    )


if __name__ == "__main__":

    main()