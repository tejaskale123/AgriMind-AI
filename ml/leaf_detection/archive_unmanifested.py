import os
import shutil
import pandas as pd

WORKSPACE = r"c:\Users\admin\OneDrive\Documents\Desktop\AgriMind-AI"
BASE_DIR = os.path.join(WORKSPACE, "ml", "leaf_detection", "dataset", "final")
ARCHIVE_DIR = os.path.join(BASE_DIR, "legacy_unmanifested_archive")
MANIFEST_PATH = os.path.join(BASE_DIR, "metadata", "final_manifest.csv")

def main():
    print("=== ARCHIVING UNMANIFESTED DUPLICATE/LEGACY FILES IN FINAL DATASET ===")
    df = pd.read_csv(MANIFEST_PATH)
    valid_images = set(df["image_file"])
    valid_masks = set(df["mask_file"])
    print(f"Manifest expects {len(valid_images)} images and {len(valid_masks)} masks.")
    
    os.makedirs(ARCHIVE_DIR, exist_ok=True)
    
    moved_images = 0
    moved_masks = 0
    
    for split in ["train", "val", "test"]:
        img_dir = os.path.join(BASE_DIR, split, "images")
        msk_dir = os.path.join(BASE_DIR, split, "masks")
        
        arch_img_dir = os.path.join(ARCHIVE_DIR, split, "images")
        arch_msk_dir = os.path.join(ARCHIVE_DIR, split, "masks")
        os.makedirs(arch_img_dir, exist_ok=True)
        os.makedirs(arch_msk_dir, exist_ok=True)
        
        for f in list(os.listdir(img_dir)):
            if f not in valid_images:
                src = os.path.join(img_dir, f)
                dst = os.path.join(arch_img_dir, f)
                shutil.move(src, dst)
                moved_images += 1
                
        for f in list(os.listdir(msk_dir)):
            if f not in valid_masks:
                src = os.path.join(msk_dir, f)
                dst = os.path.join(arch_msk_dir, f)
                shutil.move(src, dst)
                moved_masks += 1
                
    print(f"Archived {moved_images} legacy unmanifested images and {moved_masks} legacy unmanifested masks to {ARCHIVE_DIR}.")
    
    # Verify final counts on disk
    for split in ["train", "val", "test"]:
        imgs = len(os.listdir(os.path.join(BASE_DIR, split, "images")))
        msks = len(os.listdir(os.path.join(BASE_DIR, split, "masks")))
        print(f"Split {split}: {imgs} images, {msks} masks (Matched: {imgs == msks})")

if __name__ == "__main__":
    main()
