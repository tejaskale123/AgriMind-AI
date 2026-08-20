from pathlib import Path
from collections import defaultdict
import argparse

from PIL import Image
import imagehash


# ============================================================
# AGRIMIND AI
# MULTI-CROP DUPLICATE IMAGE CHECKER
# ============================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def get_image_files(dataset_path):
    """Find all image files inside the dataset."""

    return [
        file
        for file in dataset_path.rglob("*")
        if file.is_file()
        and file.suffix.lower() in IMAGE_EXTENSIONS
    ]


def calculate_hash(image_path):
    """Generate perceptual hash for an image."""

    try:

        with Image.open(image_path) as image:

            return str(
                imagehash.phash(image)
            )

    except Exception:

        return None


def check_duplicates(dataset_path, crop):

    print("=" * 65)
    print("🌱 AGRIMIND AI - DUPLICATE IMAGE CHECKER")
    print("=" * 65)

    print(f"\nCrop:")
    print(crop)

    print("\nDataset:")
    print(dataset_path)

    # --------------------------------------------------------
    # 1. Check dataset folder
    # --------------------------------------------------------

    if not dataset_path.exists():

        print("\n❌ ERROR: Dataset folder not found.")

        print(
            f"Expected: {dataset_path}"
        )

        return

    # --------------------------------------------------------
    # 2. Find images
    # --------------------------------------------------------

    image_files = get_image_files(
        dataset_path
    )

    print("\nTotal images found:")
    print(len(image_files))

    if not image_files:

        print("\n❌ No images found.")

        return

    # --------------------------------------------------------
    # 3. Generate hashes
    # --------------------------------------------------------

    print("\nGenerating perceptual hashes...")
    print("-" * 65)

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

        if index % 500 == 0:

            print(
                f"Processed: "
                f"{index}/{len(image_files)}"
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

    duplicate_image_count = sum(
        len(files) - 1
        for files
        in duplicate_groups.values()
    )

    # --------------------------------------------------------
    # 5. Print results
    # --------------------------------------------------------

    print("\n" + "=" * 65)
    print("📊 DUPLICATE ANALYSIS")
    print("=" * 65)

    print(
        f"Total images       : "
        f"{len(image_files)}"
    )

    print(
        f"Unique hashes      : "
        f"{len(hash_to_files)}"
    )

    print(
        f"Duplicate groups   : "
        f"{len(duplicate_groups)}"
    )

    print(
        f"Duplicate images   : "
        f"{duplicate_image_count}"
    )

    print(
        f"Failed images      : "
        f"{len(failed_images)}"
    )

    # --------------------------------------------------------
    # 6. Display duplicate groups
    # --------------------------------------------------------

    if duplicate_groups:

        print("\n⚠️ DUPLICATE GROUPS")
        print("-" * 65)

        group_number = 1

        for image_hash, files in duplicate_groups.items():

            print(
                f"\nGroup {group_number}"
            )

            print(
                f"Hash: {image_hash}"
            )

            for file in files:

                print(
                    f"  → {file}"
                )

            group_number += 1

    else:

        print(
            "\n✅ No duplicate image groups found."
        )

    # --------------------------------------------------------
    # 7. Failed images
    # --------------------------------------------------------

    if failed_images:

        print(
            "\n❌ IMAGES THAT COULD NOT BE HASHED"
        )

        print("-" * 65)

        for file in failed_images[:20]:

            print(
                f"  → {file}"
            )

        if len(failed_images) > 20:

            print(
                f"\n... and "
                f"{len(failed_images) - 20} more"
            )

    # --------------------------------------------------------
    # 8. Final result
    # --------------------------------------------------------

    print("\n" + "=" * 65)
    print("DUPLICATE CHECK COMPLETE")
    print("=" * 65)

    if duplicate_groups:

        print(
            "\n⚠️ Duplicates were detected."
        )

        print(
            "Do NOT delete them automatically."
        )

        print(
            "We will review them before cleaning."
        )

    else:

        print(
            "\n🎉 Dataset has no detected duplicates."
        )


def main():

    parser = argparse.ArgumentParser(
        description="AgriMind AI Duplicate Checker"
    )

    parser.add_argument(
        "--crop",
        required=True,
        help="Crop name, example: cotton"
    )

    args = parser.parse_args()

    crop = args.crop.lower()

    dataset_path = (
        Path("datasets/raw") / crop
    )

    check_duplicates(
        dataset_path,
        crop
    )


if __name__ == "__main__":

    main()