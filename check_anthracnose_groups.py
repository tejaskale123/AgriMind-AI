import os
import re
import glob
from collections import defaultdict

src = r"datasets\cotton_extended\Anthracnose"

files = [
    f for f in glob.glob(os.path.join(src, "*"))
    if f.lower().endswith((".jpg",".jpeg",".png",".bmp",".webp"))
]

groups = defaultdict(list)

for f in files:
    name = os.path.basename(f)

    # Image number ????
    m = re.search(r'Image_(\d+)', name, re.IGNORECASE)

    if m:
        key = "Image_" + m.group(1)
    else:
        key = os.path.splitext(name)[0]

    groups[key].append(name)

multi = {k:v for k,v in groups.items() if len(v) > 1}

print("")
print("========================================")
print("TOTAL IMAGES :", len(files))
print("ORIGINAL IMAGE GROUPS :", len(groups))
print("GROUPS WITH MULTIPLE VERSIONS :", len(multi))
print("========================================")

print("")

for key in sorted(multi.keys(), key=lambda x: int(re.search(r'\d+', x).group())):
    print("----------------------------------------")
    print(key, "=>", len(multi[key]), "versions")
    for name in multi[key]:
        print(" ", name)

print("")
print("========================================")
print("IMPORTANT: NOTHING DELETED")
print("========================================")
