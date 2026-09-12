from PIL import Image, ImageDraw
import os
import glob
import math

src = r"datasets\cotton_extended\Anthracnose"
out = r"datasets\cotton_extended\Anthracnose_clean_contact_sheet.jpg"

files = [
    f for f in glob.glob(os.path.join(src, "*"))
    if f.lower().endswith((".jpg",".jpeg",".png",".bmp",".webp"))
]

files = sorted(files)

thumb_w = 260
thumb_h = 240
label_h = 45
cols = 4
rows = math.ceil(len(files) / cols)

sheet = Image.new(
    "RGB",
    (cols * thumb_w, rows * (thumb_h + label_h)),
    "white"
)

draw = ImageDraw.Draw(sheet)

for i, path in enumerate(files):
    try:
        img = Image.open(path).convert("RGB")
        img.thumbnail((thumb_w - 10, thumb_h - 10))

        x = (i % cols) * thumb_w
        y = (i // cols) * (thumb_h + label_h)

        px = x + (thumb_w - img.width) // 2
        py = y + (thumb_h - img.height) // 2

        sheet.paste(img, (px, py))

        name = os.path.basename(path)
        label = f"{i+1}. {name[:30]}"
        draw.text((x + 5, y + thumb_h), label, fill="black")

    except Exception as e:
        print("ERROR:", os.path.basename(path), e)

sheet.save(out, quality=95)

print("")
print("========================================")
print("CLEAN ANTHRACNOSE CONTACT SHEET")
print("========================================")
print("IMAGES :", len(files))
print("SAVED  :", out)
print("========================================")
