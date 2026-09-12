import os
import glob
import hashlib
from collections import defaultdict

src = r"datasets\cotton_extended\Anthracnose"

def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

groups = defaultdict(list)

files = [
    f for f in glob.glob(os.path.join(src, "*"))
    if f.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".webp"))
]

for path in files:
    groups[sha256(path)].append(path)

duplicates = [v for v in groups.values() if len(v) > 1]

print("")
print("========================================")
print("ANTHRACNOSE ONLY DUPLICATE CHECK")
print("========================================")
print("Total images :", len(files))
print("Duplicate groups :", len(duplicates))

if duplicates:
    print("")
    print("DUPLICATES FOUND:")
    for i, group in enumerate(duplicates, 1):
        print("")
        print("GROUP", i)
        for f in group:
            print(" -", os.path.basename(f))
else:
    print("NO EXACT DUPLICATES FOUND")

print("")
print("========================================")
print("NO FILES WERE DELETED OR MOVED")
print("========================================")
