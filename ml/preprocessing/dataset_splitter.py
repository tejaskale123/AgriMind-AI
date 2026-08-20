from pathlib import Path
import random
import shutil
import argparse


# ============================================================
# AGRIMIND AI
# MULTI-CROP DATASET SPLITTER
# ============================================================

TRAIN_RATIO = 0.80
VAL_RATIO = 0.10
TEST_RATIO = 0.10

RANDOM_SEED = 42

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def get_images(folder):

    return [
        file
        for file in folder.iterdir()
        if file.is_file()
        and file.suffix.lower()
        in IMAGE_EXTENSIONS
    ]


def split_images(images):

    images = list(images)

    random.shuffle(images)

    total = len(images)

    train_end = int(
        total * TRAIN_RATIO
    )

    val_end = (
        train_end
        + int(total * VAL_RATIO)
    )

    train_images = images[:train_end]

    val_images = images[
        train_end:val_end
    ]

    test_images = images[
        val_end:
    ]

    return (
        train_images,
        val_images,
        test_images
    )


def copy_images(images, destination):

    destination.mkdir(
        parents=True,
        exist_ok=True
    )

    for image in images:

        shutil.copy2(
            image,
            destination / image.name
        )


def main():

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--crop",
        required=True
    )

    args = parser.parse_args()

    crop = args.crop.lower()

    # --------------------------------------------------------
    # Final clean dataset
    # --------------------------------------------------------

    source_dir = (
        Path("datasets/processed")
        / f"{crop}_final_clean"
    )

    output_dir = (
        Path("datasets/disease")
        / crop
    )

    print("=" * 65)
    print("🌱 AGRIMIND AI - DATASET SPLITTER")
    print("=" * 65)

    print(
        f"\nCrop: {crop}"
    )

    print(
        "\nSource dataset:"
    )

    print(
        source_dir
    )

    print(
        "\nOutput dataset:"
    )

    print(
        output_dir
    )

    # --------------------------------------------------------
    # Check source
    # --------------------------------------------------------

    if not source_dir.exists():

        print(
            "\nERROR: Final clean dataset not found."
        )

        print(
            "Expected:"
        )

        print(
            source_dir
        )

        return

    # --------------------------------------------------------
    # Validate ratios
    # --------------------------------------------------------

    if abs(
        TRAIN_RATIO
        + VAL_RATIO
        + TEST_RATIO
        - 1.0
    ) > 0.001:

        print(
            "\nERROR: Split ratios invalid."
        )

        return

    # --------------------------------------------------------
    # Random seed
    # --------------------------------------------------------

    random.seed(
        RANDOM_SEED
    )

    print(
        f"\nRandom seed: {RANDOM_SEED}"
    )

    # --------------------------------------------------------
    # Find classes
    # --------------------------------------------------------

    class_folders = sorted(
        [
            folder
            for folder in source_dir.iterdir()
            if folder.is_dir()
        ],
        key=lambda x: x.name
    )

    if not class_folders:

        print(
            "\nERROR: No class folders found."
        )

        return

    print(
        "\nClasses:"
    )

    for folder in class_folders:

        print(
            f"  - {folder.name}"
        )

    # --------------------------------------------------------
    # Remove old split
    # --------------------------------------------------------

    if output_dir.exists():

        print(
            "\nRemoving previous split dataset..."
        )

        shutil.rmtree(
            output_dir
        )

    # --------------------------------------------------------
    # Split dataset
    # --------------------------------------------------------

    print(
        "\n" + "=" * 65
    )

    print(
        "SPLITTING DATASET"
    )

    print(
        "=" * 65
    )

    total_train = 0
    total_val = 0
    total_test = 0

    for class_folder in class_folders:

        images = get_images(
            class_folder
        )

        if not images:

            print(
                f"\nWARNING: No images found in "
                f"{class_folder.name}"
            )

            continue

        (
            train_images,
            val_images,
            test_images
        ) = split_images(
            images
        )

        # ----------------------------------------------------
        # Destination folders
        # ----------------------------------------------------

        train_dir = (
            output_dir
            / "train"
            / class_folder.name
        )

        val_dir = (
            output_dir
            / "val"
            / class_folder.name
        )

        test_dir = (
            output_dir
            / "test"
            / class_folder.name
        )

        # ----------------------------------------------------
        # Copy images
        # ----------------------------------------------------

        copy_images(
            train_images,
            train_dir
        )

        copy_images(
            val_images,
            val_dir
        )

        copy_images(
            test_images,
            test_dir
        )

        # ----------------------------------------------------
        # Update totals
        # ----------------------------------------------------

        total_train += len(
            train_images
        )

        total_val += len(
            val_images
        )

        total_test += len(
            test_images
        )

        # ----------------------------------------------------
        # Class result
        # ----------------------------------------------------

        print(
            f"\n{class_folder.name}"
        )

        print(
            f"  Total      : {len(images)}"
        )

        print(
            f"  Train      : {len(train_images)}"
        )

        print(
            f"  Validation : {len(val_images)}"
        )

        print(
            f"  Test       : {len(test_images)}"
        )

    # --------------------------------------------------------
    # Final totals
    # --------------------------------------------------------

    total = (
        total_train
        + total_val
        + total_test
    )

    print(
        "\n" + "=" * 65
    )

    print(
        "DATASET SPLIT COMPLETE"
    )

    print(
        "=" * 65
    )

    print(
        f"\nTrain      : {total_train}"
    )

    print(
        f"Validation : {total_val}"
    )

    print(
        f"Test       : {total_test}"
    )

    print(
        f"Total      : {total}"
    )

    print(
        "\nOutput:"
    )

    print(
        output_dir
    )

    print(
        "\nExpected final clean images:"
    )

    print(
        "1101"
    )

    if total == 1101:

        print(
            "\n✅ SUCCESS: All 1101 final clean images were split."
        )

    else:

        print(
            "\n⚠️ WARNING: Total does not equal 1101."
        )

    print(
        "=" * 65
    )


if __name__ == "__main__":

    main()