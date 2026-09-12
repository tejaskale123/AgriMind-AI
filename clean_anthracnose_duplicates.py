import os
import re
import shutil
import glob
from collections import defaultdict

src = r"datasets\cotton_extended\Anthracnose"
review = r"datasets\cotton_extended\Anthracnose_REVIEW_DUPLICATES"

os.makedirs(review, exist_ok=True)

files = [
    f for f in glob.glob(os.path.join(src, "*"))
    if f.lower().endswith((".jpg",".jpeg",".png",".bmp",".webp"))
]

groups = defaultdict(list)

for f in files:
    name = os.path.basename(f)
    m = re.search(r'Image_(\d+)', name, re.IGNORECASE)

    if m:
        key = "Image_" + m.group(1)
        groups[key].append(f)

kept = 0
moved = 0

for key in sorted(groups.keys(), key=lambda x: int(re.search(r'\d+', x).group())):

    versions = sorted(groups[key])

    # ???????? original image ???? ???? 1 version ?????
    keep = versions[0]
    kept += 1

    print("KEEP:", os.path.basename(keep))

    # ???? versions review folder ????? move
    for f in versions[1:]:
        destination = os.path.join(review, os.path.basename(f))

        shutil.move(f, destination)

        moved += 1
        print("MOVE:", os.path.basename(f))

print("")
print("========================================")
print("ANTHRACNOSE DUPLICATE CLEANUP")
print("========================================")
print("BEFORE IMAGES :", len(files))
print("ORIGINAL GROUPS :", len(groups))
print("KEPT IMAGES :", kept)
print("MOVED DUPLICATE VERSIONS :", moved)
print("REMAINING ANTHRACNOSE :", len([
    f for f in glob.glob(os.path.join(src, "*"))
    if f.lower().endswith((".jpg",".jpeg",".png",".bmp",".webp"))
]))
print("REVIEW DUPLICATES :", len([
    f for f in glob.glob(os.path.join(review, "*"))
    if f.lower().endswith((".jpg",".jpeg",".png",".bmp",".webp"))
]))
print("========================================")
print("NOTHING PERMANENTLY DELETED")
print("========================================")
