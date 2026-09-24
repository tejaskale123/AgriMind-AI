from pathlib import Path
import hashlib

folders = [
    Path(r"datasets\processed\soybean"),
    Path(r"datasets\processed\soybean_10class"),
]

extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}

for root in folders:
    hashes = {}

    for file in root.rglob("*"):
        if file.is_file() and file.suffix.lower() in extensions:
            file_hash = hashlib.sha256(file.read_bytes()).hexdigest()
            hashes.setdefault(file_hash, []).append(file)

    duplicates = [files for files in hashes.values() if len(files) > 1]

    print(f"\n===== {root.name} =====")
    print("Duplicate groups:", len(duplicates))
    print("Duplicate copies:", sum(len(files) - 1 for files in duplicates))

    for files in duplicates[:10]:
        print("\nDuplicate group:")
        for file in files:
            print(" ", file)

