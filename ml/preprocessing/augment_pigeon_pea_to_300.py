from pathlib import Path
import random
from PIL import Image, ImageEnhance, ImageOps

SOURCE_DIR = Path("datasets/processed/pigeon_pea_final/train")
OUTPUT_DIR = Path("datasets/processed/pigeon_pea_final_augmented/train")

TARGET_COUNT = 300
SEED = 42

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

random.seed(SEED)


def get_images(folder):
    return sorted(
        [
            file
            for file in folder.iterdir()
            if file.is_file()
            and file.suffix.lower() in IMAGE_EXTENSIONS
        ]
    )


def augment_image(image, variant):

    if variant == 0:
        return image.copy()

    if variant == 1:
        return image.rotate(90, expand=True)

    if variant == 2:
        return image.rotate(180, expand=True)

    if variant == 3:
        return image.rotate(270, expand=True)

    if variant == 4:
        return ImageOps.mirror(image)

    if variant == 5:
        return ImageOps.mirror(
            image.rotate(90, expand=True)
        )

    if variant == 6:
        return ImageEnhance.Brightness(
            image
        ).enhance(1.15)

    if variant == 7:
        return ImageEnhance.Brightness(
            image
        ).enhance(0.85)

    if variant == 8:
        return ImageEnhance.Contrast(
            image
        ).enhance(1.15)

    if variant == 9:
        return ImageEnhance.Contrast(
            image
        ).enhance(0.85)

    return image.rotate(
        random.choice([90, 180, 270]),
        expand=True
    )


def save_image(image, destination):

    image = image.convert("RGB")

    image.save(
        destination,
        "JPEG",
        quality=92
    )


def main():

    print("=" * 70)
    print("AGRIMIND AI - PIGEON PEA TARGETED AUGMENTATION")
    print("=" * 70)

    print(f"Source : {SOURCE_DIR}")
    print(f"Output : {OUTPUT_DIR}")
    print(f"Target : {TARGET_COUNT} images/class")
    print()

    if not SOURCE_DIR.exists():

        print("ERROR: Source dataset not found.")
        return

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    class_folders = sorted(
        [
            folder
            for folder in SOURCE_DIR.iterdir()
            if folder.is_dir()
        ]
    )

    for class_folder in class_folders:

        class_name = class_folder.name

        source_images = get_images(
            class_folder
        )

        if not source_images:

            print(
                f"SKIP: {class_name} - no images"
            )

            continue

        output_class = (
            OUTPUT_DIR / class_name
        )

        output_class.mkdir(
            parents=True,
            exist_ok=True
        )

        print(
            f"{class_name}: "
            f"{len(source_images)} -> ",
            end=""
        )

        saved = 0

        # ------------------------------------------------
        # COPY ORIGINAL IMAGES
        # ------------------------------------------------

        for index, source in enumerate(
            source_images,
            start=1
        ):

            destination = (
                output_class
                / f"original_{index:04d}.jpg"
            )

            with Image.open(source) as image:

                save_image(
                    image,
                    destination
                )

            saved += 1

        # ------------------------------------------------
        # AUGMENT UNTIL 300
        # ------------------------------------------------

        variant = 1

        source_index = 0

        while saved < TARGET_COUNT:

            source = source_images[
                source_index % len(source_images)
            ]

            with Image.open(source) as image:

                image = image.convert("RGB")

                augmented = augment_image(
                    image,
                    variant % 10
                )

                destination = (
                    output_class
                    / f"aug_{saved + 1:04d}.jpg"
                )

                save_image(
                    augmented,
                    destination
                )

            saved += 1

            variant += 1

            source_index += 1

        print(saved)

    print()
    print("=" * 70)
    print("AUGMENTATION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()
