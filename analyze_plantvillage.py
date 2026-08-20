from collections import Counter

from datasets import load_dataset


print("=" * 60)
print("🌱 AGRIMIND AI - PLANTVILLAGE DATASET ANALYSIS")
print("=" * 60)


# ---------------------------------------------------------
# 1. Load PlantVillage metadata
# ---------------------------------------------------------

print("\n📦 Loading PlantVillage metadata...")

dataset = load_dataset(
    "mohanty/PlantVillage",
    "default"
)

print("✅ Dataset loaded")


# ---------------------------------------------------------
# 2. Collect train + test paths
# ---------------------------------------------------------

train_paths = dataset["train"]["text"]
test_paths = dataset["test"]["text"]

print(f"\nTotal raw train records: {len(train_paths)}")
print(f"Total raw test records : {len(test_paths)}")


# ---------------------------------------------------------
# 3. Keep ONLY color images
# ---------------------------------------------------------

color_train = [
    path for path in train_paths
    if path.startswith("raw/color/")
]

color_test = [
    path for path in test_paths
    if path.startswith("raw/color/")
]


print("\n🎨 COLOR DATASET")
print("-" * 60)

print(f"Color train images: {len(color_train)}")
print(f"Color test images : {len(color_test)}")
print(f"Total color images: {len(color_train) + len(color_test)}")


# ---------------------------------------------------------
# 4. Extract class names
# ---------------------------------------------------------

def get_class_name(path):
    parts = path.split("/")

    # raw / color / CLASS / IMAGE
    if len(parts) >= 4:
        return parts[2]

    return "UNKNOWN"


train_classes = [
    get_class_name(path)
    for path in color_train
]

test_classes = [
    get_class_name(path)
    for path in color_test
]


all_classes = train_classes + test_classes


# ---------------------------------------------------------
# 5. Class statistics
# ---------------------------------------------------------

class_counts = Counter(all_classes)

print("\n📊 TOTAL CLASSES")
print("-" * 60)

print(f"Number of classes: {len(class_counts)}")


print("\n📋 CLASS-WISE IMAGE COUNT")
print("-" * 60)


for class_name, count in sorted(class_counts.items()):
    print(f"{class_name:<55} {count}")


# ---------------------------------------------------------
# 6. Crop extraction
# ---------------------------------------------------------

def get_crop_name(class_name):
    if "___" in class_name:
        return class_name.split("___")[0]

    return class_name


crop_counts = Counter(
    get_crop_name(class_name)
    for class_name in all_classes
)


print("\n🌱 CROP-WISE IMAGE COUNT")
print("-" * 60)

for crop, count in sorted(crop_counts.items()):
    print(f"{crop:<30} {count}")


# ---------------------------------------------------------
# 7. Disease extraction
# ---------------------------------------------------------

def get_disease_name(class_name):
    if "___" in class_name:
        return class_name.split("___", 1)[1]

    return "unknown"


disease_counts = Counter(
    get_disease_name(class_name)
    for class_name in all_classes
)


print("\n🦠 DISEASE-WISE IMAGE COUNT")
print("-" * 60)

for disease, count in sorted(disease_counts.items()):
    print(f"{disease:<50} {count}")


# ---------------------------------------------------------
# 8. Healthy vs Diseased
# ---------------------------------------------------------

healthy_count = 0
diseased_count = 0


for class_name, count in class_counts.items():

    disease = get_disease_name(class_name)

    if disease.lower() == "healthy":
        healthy_count += count
    else:
        diseased_count += count


print("\n❤️ HEALTH STATUS")
print("-" * 60)

print(f"Healthy images : {healthy_count}")
print(f"Diseased images: {diseased_count}")


# ---------------------------------------------------------
# 9. Final summary
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("✅ DATASET ANALYSIS COMPLETE")
print("=" * 60)

print(f"Color train images : {len(color_train)}")
print(f"Color test images  : {len(color_test)}")
print(f"Total color images : {len(color_train) + len(color_test)}")
print(f"Total classes      : {len(class_counts)}")
print(f"Total crops        : {len(crop_counts)}")
print(f"Healthy images     : {healthy_count}")
print(f"Diseased images    : {diseased_count}")

print("=" * 60)