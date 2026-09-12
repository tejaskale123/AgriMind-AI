import cv2
import os
import glob
import numpy as np

src = r"datasets\cotton_extended\Anthracnose"

files = [
    f for f in glob.glob(os.path.join(src, "*"))
    if f.lower().endswith((".jpg",".jpeg",".png",".bmp",".webp"))
]

def phash(path):
    img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)

    if img is None:
        return None

    img = cv2.resize(img, (32, 32))
    dct = cv2.dct(np.float32(img))

    low = dct[:8, :8]
    med = np.median(low[1:, 1:])

    return (low > med).flatten()

hashes = {}

for f in files:
    h = phash(f)
    if h is not None:
        hashes[f] = h

names = list(hashes.keys())
pairs = []

for i in range(len(names)):
    for j in range(i + 1, len(names)):

        distance = int(
            np.sum(hashes[names[i]] != hashes[names[j]])
        )

        if distance <= 20:
            pairs.append((
                os.path.basename(names[i]),
                os.path.basename(names[j]),
                distance
            ))

print("")
print("========================================")
print("TOTAL IMAGES :", len(files))
print("VALID HASHES :", len(hashes))
print("SIMILAR PAIRS (THRESHOLD 20) :", len(pairs))
print("========================================")

if pairs:
    print("")
    print("POSSIBLE DUPLICATE / AUGMENTED PAIRS:")

    for a, b, d in sorted(pairs, key=lambda x: x[2]):
        print("")
        print("DISTANCE :", d)
        print("A :", a)
        print("B :", b)

else:
    print("NO SIMILAR PAIRS FOUND")
