from datasets import load_dataset


print("======================================")
print("🌱 Loading PlantVillage Dataset")
print("======================================")


dataset = load_dataset(
    "mohanty/PlantVillage",
    "default"
)


print("\n✅ Dataset loaded successfully!")


print("\nDataset information:")
print(dataset)


print("\nTrain examples:")
print(len(dataset["train"]))


print("\nTest examples:")
print(len(dataset["test"]))


print("\nColumn names:")
print(dataset["train"].column_names)


print("\nFirst sample:")
print(dataset["train"][0])