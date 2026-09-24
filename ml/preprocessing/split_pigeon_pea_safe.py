from pathlib import Path
import random, shutil

SOURCE = Path("datasets/processed/pigeon_pea_300/train")
OUTPUT = Path("datasets/processed/pigeon_pea_split")

random.seed(42)

for class_dir in sorted(SOURCE.iterdir()):
    if not class_dir.is_dir():
        continue

    files = sorted(class_dir.glob("*.jpg"))

    originals = [f for f in files if f.name.startswith("original_")]
    augmented = [f for f in files if f.name.startswith("aug_")]

    groups = {i: [originals[i-1]] for i in range(1, len(originals)+1)}

    # Augmented files are generated sequentially from source images.
    for f in augmented:
        n = int(f.stem.split("_")[1])
        source_index = ((n - len(originals) - 1) % len(originals)) + 1
        groups[source_index].append(f)

    group_list = list(groups.values())
    random.shuffle(group_list)

    total = len(files)
    targets = {
        "train": int(total * 0.70),
        "val": int(total * 0.15),
        "test": total - int(total * 0.70) - int(total * 0.15)
    }

    selected = {"train": [], "val": [], "test": []}
    counts = {"train": 0, "val": 0, "test": 0}

    for group in group_list:
        split = min(counts, key=lambda x: counts[x])
        if counts[split] + len(group) <= targets[split] or all(counts[x] >= targets[x] for x in counts):
            selected[split].extend(group)
            counts[split] += len(group)
        else:
            other = min(
                [x for x in counts if counts[x] + len(group) <= targets[x]],
                key=lambda x: counts[x],
                default=split
            )
            selected[other].extend(group)
            counts[other] += len(group)

    for split, split_files in selected.items():
        dest = OUTPUT / split / class_dir.name
        dest.mkdir(parents=True, exist_ok=True)

        for f in split_files:
            shutil.copy2(f, dest / f.name)

    print(f"{class_dir.name}: Train={counts['train']} Val={counts['val']} Test={counts['test']} Total={sum(counts.values())}")

print("\nSAFE PIGEON PEA SPLIT COMPLETE")
