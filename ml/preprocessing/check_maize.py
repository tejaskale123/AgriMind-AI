from pathlib import Path

from PIL import Image


# ============================================================
# AGRIMIND AI
# MAIZE DATASET VALIDATION
# ============================================================

DATASET_DIR = Path(
    "datasets/crop/Maize"
)

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


# ============================================================
# GET IMAGES
# ============================================================

def get_images(folder):

    return [
        file
        for file in folder.rglob("*")
        if file.is_file()
        and file.suffix.lower()
        in IMAGE_EXTENSIONS
    ]


# ============================================================
# CHECK IMAGE
# ============================================================

def check_image(image_path):

    try:

        with Image.open(
            image_path
        ) as image:

            image.verify()

        return True

    except Exception:

        return False


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "🌽 AGRIMIND AI - MAIZE DATASET AUDIT"
    )

    print("=" * 70)


    # --------------------------------------------------------
    # DATASET EXISTS
    # --------------------------------------------------------

    if not DATASET_DIR.exists():

        print(
            "\n❌ Maize dataset not found:"
        )

        print(
            DATASET_DIR
        )

        return


    print(
        "\nDataset:"
    )

    print(
        DATASET_DIR
    )


    total = 0

    good = 0

    bad = 0


    # --------------------------------------------------------
    # CLASS CHECK
    # --------------------------------------------------------

    class_dirs = [
        directory
        for directory
        in sorted(
            DATASET_DIR.iterdir()
        )
        if directory.is_dir()
    ]


    print(
        "\nClasses found:"
    )

    for directory in class_dirs:

        print(
            f"  ✓ {directory.name}"
        )


    # --------------------------------------------------------
    # IMAGE CHECK
    # --------------------------------------------------------

    print(
        "\nChecking images..."
    )

    print(
        "-" * 70
    )


    bad_images = []


    for class_dir in class_dirs:

        images = get_images(
            class_dir
        )

        class_good = 0

        class_bad = 0


        for image in images:

            if check_image(image):

                good += 1

                class_good += 1

            else:

                bad += 1

                class_bad += 1

                bad_images.append(
                    str(image)
                )


            total += 1


        print(
            f"{class_dir.name:20} "
            f"Total: {len(images):5} | "
            f"Good: {class_good:5} | "
            f"Bad: {class_bad:4}"
        )


    # --------------------------------------------------------
    # FINAL SUMMARY
    # --------------------------------------------------------

    print(
        "\n" + "=" * 70
    )

    print(
        "MAIZE DATASET AUDIT RESULT"
    )

    print(
        "=" * 70
    )


    print(
        f"Total Images : {total}"
    )

    print(
        f"Good Images  : {good}"
    )

    print(
        f"Bad Images   : {bad}"
    )


    # --------------------------------------------------------
    # BAD IMAGES
    # --------------------------------------------------------

    if bad_images:

        print(
            "\n❌ CORRUPTED / INVALID IMAGES:"
        )

        for image in bad_images:

            print(
                f"  → {image}"
            )

    else:

        print(
            "\n✅ DATASET AUDIT PASSED"
        )

        print(
            "No corrupted images found."
        )


    print(
        "\n" + "=" * 70
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()