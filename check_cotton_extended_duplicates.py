import os
import glob
import hashlib
from collections import defaultdict

base = r"datasets\cotton_extended"

def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

groups = defaultdict(list)

for folder in glob.glob(os.path.join(base, "*")):
    if not os.path.isdir(folder):
        continue

    for path in glob.glob(os.path.join(folder, "*")):
        if path.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".webp")):
            groups[sha256(path)].append(path)

duplicates = []

for files in groups.values():
    if len(files) > 1:
        duplicates.append(files)

print("")
print("========================================")
print("COTTON EXTENDED DUPLICATE CHECK")
print("========================================")
print("Duplicate groups :", len(duplicates))

if duplicates:
    print("")
    print("DUPLICATES FOUND:")
    for i, files in enumerate(duplicates, 1):
        print("")
        print("GROUP", i)
        for f in files:
            print(" -", f)
else:
    print("NO EXACT DUPLICATES FOUND")

print("")
print("========================================")
print("NO FILES WERE DELETED OR MOVED")
print("========================================")
