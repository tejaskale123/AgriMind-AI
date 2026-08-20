from pathlib import Path

from PIL import Image
import imagehash


# ============================================================
# AGRIMIND AI
# CREATE CLEAN SOYBEAN DATASET
# ============================================================

RAW_PATH = Path("datasets/raw/soybean_extracted")

CLEAN_PATH = Path("datasets/processed/soybean_clean")

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

CLASS_MAPPING = {
    "Bacterial Blight": "Bacterial_Blight",
    "Cercospora Leaf Blight": "Cercospora_Leaf_Blight",
    "Healthy": "Healthy",
    "Rust": "Rust",
    "Sudden Death Syndrome": "Sudden_Death_Syndrome",
}


def calculate_hash(image_path):

    try:
        with Image.open(image_path) as image:
            return str(imagehash.phash(image))

    except Exception:
        return None


def find_class_folder(class_name):

    for folder in RAW_PATH.rglob("*"):

        if folder.is_dir() and folder.name == class_name:
            return folder

    return None


def main():

    print("=" * 70)
    print("AGRIMIND AI - CLEAN SOYBEAN DATASET")
    print("=" * 70)

    if not RAW_PATH.exists():

        print("\nERROR: Raw dataset not found:")
        print(RAW_PATH)

        return

    CLEAN_PATH.mkdir(
        parents=True,
        exist_ok=True
    )

    total_images = 0
    unique_images = 0
    duplicate_images = 0
    failed_images = 0

    class_counts = {}

    for source_class, target_class in CLASS_MAPPING.items():

        print("\n" + "-" * 70)
        print(f"CLASS: {source_class}")
        print("-" * 70)

        source_folder = find_class_folder(source_class)

        if source_folder is None:

            print("ERROR: Source class not found.")
            continue

        target_folder = CLEAN_PATH / target_class

        target_folder.mkdir(
            parents=True,
            exist_ok=True
        )

        image_files = sorted(
            [
                file
                for file in source_folder.rglob("*")
                if file.is_file()
                and file.suffix.lower() in IMAGE_EXTENSIONS
            ]
        )

        print(f"Original images: {len(image_files)}")

        hash_to_file = {}

        class_unique = 0
        class_duplicate = 0

        for image_path in image_files:

            total_images += 1

            image_hash = calculate_hash(image_path)

            if image_hash is None:

                failed_images += 1

                print(f"FAILED: {image_path}")

                continue

            if image_hash in hash_to_file:

                duplicate_images += 1
                class_duplicate += 1

                continue

            hash_to_file[image_hash] = image_path

            destination_name = (
                f"{target_class}_{class_unique + 1:04d}.jpg"
            )

            destination = target_folder / destination_name

            try:

                with Image.open(image_path) as image:

                    image.convert("RGB").save(
                        destination,
                        "JPEG",
                        quality=95
                    )

                unique_images += 1
                class_unique += 1

            except Exception:

                failed_images += 1

        class_counts[target_class] = class_unique

        print(f"Unique images   : {class_unique}")
        print(f"Duplicates      : {class_duplicate}")

    print("\n" + "=" * 70)
    print("CLEAN DATASET SUMMARY")
    print("=" * 70)

    print(f"Original images    : {total_images}")
    print(f"Unique images      : {unique_images}")
    print(f"Duplicates removed: {duplicate_images}")
    print(f"Failed images      : {failed_images}")

    print("\nClass distribution:")

    for class_name, count in class_counts.items():

        print(f"{class_name:30} : {count}")

    print("\nClean dataset path:")
    print(CLEAN_PATH)

    print("\n" + "=" * 70)

    if failed_images == 0:
        print("CLEAN DATASET CREATED SUCCESSFULLY")
    else:
        print("WARNING: SOME IMAGES FAILED")

    print("=" * 70)


if __name__ == "__main__":
    main()