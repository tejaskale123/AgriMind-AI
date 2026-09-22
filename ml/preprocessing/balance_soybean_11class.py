from pathlib import Path
import shutil
import random

from PIL import Image, ImageEnhance


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

SOURCE_DIR = PROJECT_ROOT / "datasets" / "processed" / "soybean_11class"

OUTPUT_DIR = (
    PROJECT_ROOT
    / "datasets"
    / "processed"
    / "soybean_11class_balanced"
)

TARGET_IMAGES = 300

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

RANDOM_SEED = 42
random.seed(RANDOM_SEED)


# ============================================================
# AUGMENTATION
# ============================================================

def augment_image(image, operation):
    """
    Apply a controlled augmentation.
    """

    if operation == "rotate90":
        return image.rotate(90, expand=True)

    if operation == "rotate180":
        return image.rotate(180, expand=True)

    if operation == "rotate270":
        return image.rotate(270, expand=True)

    if operation == "flip":
        return image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    if operation == "brightness":
        factor = random.uniform(0.85, 1.15)
        return ImageEnhance.Brightness(image).enhance(factor)

    if operation == "contrast":
        factor = random.uniform(0.85, 1.15)
        return ImageEnhance.Contrast(image).enhance(factor)

    if operation == "rotate_small":
        angle = random.uniform(-15, 15)
        return image.rotate(angle, expand=True)

    return image.copy()


AUGMENTATIONS = [
    "rotate90",
    "rotate180",
    "rotate270",
    "flip",
    "brightness",
    "contrast",
    "rotate_small",
]


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("Soybean 11-Class Dataset Balancing")
    print("=" * 70)

    print(f"\nSource : {SOURCE_DIR}")
    print(f"Output : {OUTPUT_DIR}")
    print(f"Target : {TARGET_IMAGES} images per TRAIN class")

    if not SOURCE_DIR.exists():
        raise FileNotFoundError(
            f"Source dataset not found:\n{SOURCE_DIR}"
        )

    # --------------------------------------------------------
    # Create output directories
    # --------------------------------------------------------

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    train_source = SOURCE_DIR / "train"
    val_source = SOURCE_DIR / "val"
    test_source = SOURCE_DIR / "test"

    train_output = OUTPUT_DIR / "train"
    val_output = OUTPUT_DIR / "val"
    test_output = OUTPUT_DIR / "test"

    train_output.mkdir(parents=True, exist_ok=True)
    val_output.mkdir(parents=True, exist_ok=True)
    test_output.mkdir(parents=True, exist_ok=True)

    # --------------------------------------------------------
    # Get classes
    # --------------------------------------------------------

    classes = sorted(
        [
            folder
            for folder in train_source.iterdir()
            if folder.is_dir()
        ],
        key=lambda x: x.name
    )

    print(f"\nFound classes: {len(classes)}")

    # --------------------------------------------------------
    # Process TRAIN
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("TRAIN DATASET")
    print("=" * 70)

    for class_dir in classes:

        class_name = class_dir.name
        output_class_dir = train_output / class_name

        output_class_dir.mkdir(parents=True, exist_ok=True)

        source_images = [
            f
            for f in class_dir.iterdir()
            if f.is_file()
            and f.suffix.lower() in IMAGE_EXTENSIONS
        ]

        source_images = sorted(source_images)

        original_count = len(source_images)

        print(
            f"\n{class_name}: "
            f"{original_count} original -> {TARGET_IMAGES} target"
        )

        if original_count == 0:
            print("  WARNING: No images found.")
            continue

        # ----------------------------------------------------
        # Copy ORIGINAL images
        # ----------------------------------------------------

        for index, source_file in enumerate(source_images):

            destination = (
                output_class_dir
                / f"original_{index:04d}{source_file.suffix.lower()}"
            )

            shutil.copy2(source_file, destination)

        current_count = original_count

        # ----------------------------------------------------
        # Generate AUGMENTED images
        # ----------------------------------------------------

        augmented_index = 0

        while current_count < TARGET_IMAGES:

            source_file = random.choice(source_images)

            operation = random.choice(AUGMENTATIONS)

            try:
                with Image.open(source_file) as image:

                    image = image.convert("RGB")

                    augmented = augment_image(
                        image,
                        operation
                    )

                    augmented = augmented.convert("RGB")

                    output_file = (
                        output_class_dir
                        / f"aug_{augmented_index:04d}_{operation}.jpg"
                    )

                    augmented.save(
                        output_file,
                        format="JPEG",
                        quality=95
                    )

                current_count += 1
                augmented_index += 1

            except Exception as error:

                print(
                    f"  WARNING: Could not process "
                    f"{source_file.name}: {error}"
                )

        print(
            f"  Completed: {current_count} images"
        )

    # --------------------------------------------------------
    # Copy VALIDATION
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("COPYING VALIDATION DATA")
    print("=" * 70)

    for class_dir in val_source.iterdir():

        if not class_dir.is_dir():
            continue

        destination_dir = val_output / class_dir.name

        destination_dir.mkdir(parents=True, exist_ok=True)

        for source_file in class_dir.iterdir():

            if (
                source_file.is_file()
                and source_file.suffix.lower() in IMAGE_EXTENSIONS
            ):
                shutil.copy2(
                    source_file,
                    destination_dir / source_file.name
                )

    # --------------------------------------------------------
    # Copy TEST
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("COPYING TEST DATA")
    print("=" * 70)

    for class_dir in test_source.iterdir():

        if not class_dir.is_dir():
            continue

        destination_dir = test_output / class_dir.name

        destination_dir.mkdir(parents=True, exist_ok=True)

        for source_file in class_dir.iterdir():

            if (
                source_file.is_file()
                and source_file.suffix.lower() in IMAGE_EXTENSIONS
            ):
                shutil.copy2(
                    source_file,
                    destination_dir / source_file.name
                )

    # --------------------------------------------------------
    # Final summary
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("BALANCING COMPLETE")
    print("=" * 70)

    print(f"\nBalanced dataset created at:")
    print(OUTPUT_DIR)

    print("\nOriginal dataset was NOT modified.")

    print("\nTRAIN:")
    for class_dir in sorted(train_output.iterdir()):

        if class_dir.is_dir():

            count = len(
                [
                    f
                    for f in class_dir.iterdir()
                    if f.is_file()
                    and f.suffix.lower() in IMAGE_EXTENSIONS
                ]
            )

            print(
                f"  {class_dir.name}: {count}"
            )

    print("\nVAL and TEST were copied without augmentation.")

    print("\nDone.")


if __name__ == "__main__":
    main()