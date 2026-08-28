from pathlib import Path
from PIL import Image
import imagehash


# ============================================================
# AGRIMIND AI
# MAIZE CLEAN DATASET CREATOR
# ============================================================

SOURCE_DIR = Path(
    "datasets/crop/Maize"
)

OUTPUT_DIR = Path(
    "datasets/processed/maize_final_clean"
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

    return sorted(
        [
            file
            for file in folder.rglob("*")
            if file.is_file()
            and file.suffix.lower()
            in IMAGE_EXTENSIONS
        ]
    )


# ============================================================
# IMAGE HASH
# ============================================================

def calculate_hash(image_path):

    try:

        with Image.open(
            image_path
        ) as image:

            image = image.convert(
                "RGB"
            )

            return str(
                imagehash.phash(image)
            )

    except Exception:

        return None


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "🌽 AGRIMIND AI - MAIZE CLEAN DATASET CREATOR"
    )

    print("=" * 70)


    # --------------------------------------------------------
    # SOURCE CHECK
    # --------------------------------------------------------

    if not SOURCE_DIR.exists():

        print(
            "\n❌ SOURCE DATASET NOT FOUND:"
        )

        print(
            SOURCE_DIR
        )

        return


    print(
        "\nSource:"
    )

    print(
        SOURCE_DIR
    )


    print(
        "\nOutput:"
    )

    print(
        OUTPUT_DIR
    )


    # --------------------------------------------------------
    # CLASS FOLDERS
    # --------------------------------------------------------

    class_folders = sorted(
        [
            folder
            for folder in SOURCE_DIR.iterdir()
            if folder.is_dir()
        ],
        key=lambda folder:
            folder.name
    )


    if not class_folders:

        print(
            "\n❌ No class folders found."
        )

        return


    print(
        "\nClasses:"
    )

    for folder in class_folders:

        print(
            f"  ✓ {folder.name}"
        )


    # --------------------------------------------------------
    # OUTPUT FOLDER
    # --------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )


    # --------------------------------------------------------
    # GLOBAL HASH TRACKING
    #
    # This prevents the same image from appearing
    # multiple times in the clean dataset.
    # --------------------------------------------------------

    global_hashes = set()


    total_original = 0

    total_unique = 0

    total_duplicates = 0

    total_failed = 0


    class_counts = {}


    # --------------------------------------------------------
    # PROCESS EACH CLASS
    # --------------------------------------------------------

    for class_folder in class_folders:

        class_name = (
            class_folder.name
        )

        print(
            "\n" + "-" * 70
        )

        print(
            f"CLASS: {class_name}"
        )

        print(
            "-" * 70
        )


        output_class = (
            OUTPUT_DIR
            / class_name
        )

        output_class.mkdir(
            parents=True,
            exist_ok=True
        )


        images = get_images(
            class_folder
        )


        print(
            f"Original images: {len(images)}"
        )


        class_unique = 0

        class_duplicates = 0

        class_failed = 0


        # ----------------------------------------------------
        # PROCESS IMAGES
        # ----------------------------------------------------

        for image_path in images:

            total_original += 1


            image_hash = calculate_hash(
                image_path
            )


            # ----------------------------------------------
            # INVALID IMAGE
            # ----------------------------------------------

            if image_hash is None:

                total_failed += 1

                class_failed += 1

                print(
                    f"FAILED: {image_path}"
                )

                continue


            # ----------------------------------------------
            # DUPLICATE IMAGE
            # ----------------------------------------------

            if image_hash in global_hashes:

                total_duplicates += 1

                class_duplicates += 1

                continue


            global_hashes.add(
                image_hash
            )


            # ----------------------------------------------
            # SAVE CLEAN IMAGE
            # ----------------------------------------------

            destination_name = (
                f"{class_name}_{class_unique + 1:04d}.jpg"
            )


            destination = (
                output_class
                / destination_name
            )


            try:

                with Image.open(
                    image_path
                ) as image:

                    image = image.convert(
                        "RGB"
                    )

                    image.save(
                        destination,
                        "JPEG",
                        quality=95
                    )


                total_unique += 1

                class_unique += 1


            except Exception as error:

                total_failed += 1

                class_failed += 1

                print(
                    f"FAILED: {image_path}"
                )

                print(
                    f"Reason: {error}"
                )


        class_counts[
            class_name
        ] = class_unique


        print(
            f"Unique images : {class_unique}"
        )

        print(
            f"Duplicates    : {class_duplicates}"
        )

        print(
            f"Failed        : {class_failed}"
        )


    # --------------------------------------------------------
    # FINAL SUMMARY
    # --------------------------------------------------------

    print(
        "\n" + "=" * 70
    )

    print(
        "🌽 MAIZE CLEAN DATASET SUMMARY"
    )

    print(
        "=" * 70
    )


    print(
        f"\nOriginal images     : {total_original}"
    )

    print(
        f"Unique images       : {total_unique}"
    )

    print(
        f"Duplicates removed  : {total_duplicates}"
    )

    print(
        f"Failed images       : {total_failed}"
    )


    print(
        "\nClass distribution:"
    )


    for class_name, count in (
        class_counts.items()
    ):

        print(
            f"{class_name:25} : {count}"
        )


    print(
        "\nClean dataset:"
    )

    print(
        OUTPUT_DIR
    )


    print(
        "\n" + "=" * 70
    )


    if total_failed == 0:

        print(
            "✅ MAIZE CLEAN DATASET CREATED SUCCESSFULLY"
        )

    else:

        print(
            "⚠️ DATASET CREATED WITH SOME FAILURES"
        )


    print(
        "=" * 70
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()