import os
import json
import shutil
import hashlib
import pandas as pd
from PIL import Image, ImageOps

WORKSPACE = r"c:\Users\admin\OneDrive\Documents\Desktop\AgriMind-AI"
HV_DIR = os.path.join(WORKSPACE, "ml", "leaf_detection", "annotation", "human_verification")
DECISIONS_DIR = os.path.join(HV_DIR, "decisions")
FINAL_DATASET_DIR = os.path.join(WORKSPACE, "ml", "leaf_detection", "dataset", "final")
REPORT_PATH = os.path.join(FINAL_DATASET_DIR, "phase2_dataset_audit.md")

def sha256_file(filepath):
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def main():
    print("=== STARTING PHASE 2 FINAL DATASET CURATION & AUDIT ===")
    
    # 1. Audit all 231 decisions
    expected_ids = [f"{i:04d}" for i in range(4, 235)]
    assert len(expected_ids) == 231, f"Expected 231 candidates, got {len(expected_ids)}"
    
    decisions = {}
    missing_decisions = []
    invalid_decisions = []
    decision_counts = {}
    
    for cid in expected_ids:
        dec_file = os.path.join(DECISIONS_DIR, f"decision_{cid}.json")
        if not os.path.exists(dec_file):
            missing_decisions.append(cid)
            continue
        with open(dec_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Verify candidate ID matches
        raw_cid = data.get("candidate_id")
        if raw_cid is None or int(raw_cid) != int(cid):
            invalid_decisions.append((cid, f"Candidate ID mismatch: {raw_cid} vs {cid}"))
            continue
            
        dec = data.get("human_decision") or data.get("reviewer_label")
        if not dec:
            invalid_decisions.append((cid, "Missing decision field"))
            continue
            
        decision_counts[dec] = decision_counts.get(dec, 0) + 1
        data["verified_decision"] = dec
        decisions[cid] = data
        
    print(f"Audited {len(decisions)} decision files.")
    print(f"Decision breakdown: {decision_counts}")
    if missing_decisions:
        raise RuntimeError(f"Missing decisions: {missing_decisions}")
    if invalid_decisions:
        raise RuntimeError(f"Invalid decisions: {invalid_decisions}")

    # 2. Create clean final dataset directory structure
    for split in ["train", "val", "test"]:
        os.makedirs(os.path.join(FINAL_DATASET_DIR, split, "images"), exist_ok=True)
        os.makedirs(os.path.join(FINAL_DATASET_DIR, split, "masks"), exist_ok=True)
        
    # 3. Filter eligible samples: APPROVED and MINOR_REVIEW
    eligible_cids = [cid for cid, d in decisions.items() if d["verified_decision"] in ["APPROVED", "MINOR_REVIEW"]]
    rejected_cids = [cid for cid, d in decisions.items() if d["verified_decision"].startswith("REJECT")]
    uncertain_cids = [cid for cid, d in decisions.items() if d["verified_decision"] == "UNCERTAIN"]
    
    print(f"Eligible samples: {len(eligible_cids)}")
    print(f"Rejected samples: {len(rejected_cids)}")
    print(f"Uncertain samples: {len(uncertain_cids)}")
    
    curated_records = []
    split_counts = {"train": 0, "val": 0, "test": 0}
    crop_counts = {}
    split_hashes = {"train": set(), "val": set(), "test": set()}
    
    for cid in eligible_cids:
        d = decisions[cid]
        split = d.get("source_split", "train")
        crop = d.get("crop", "Cotton")
        
        # Source image path
        rel_img_path = d.get("original_relative_path")
        src_img_path = os.path.join(WORKSPACE, rel_img_path)
        if not os.path.exists(src_img_path):
            raise FileNotFoundError(f"Source image not found for {cid}: {src_img_path}")
            
        # Source mask path
        rel_mask_path = d.get("mask_path")
        src_mask_path = os.path.join(WORKSPACE, rel_mask_path)
        if not os.path.exists(src_mask_path):
            raise FileNotFoundError(f"Source mask not found for {cid}: {src_mask_path}")
            
        # Open image and apply EXIF transpose to ensure pixel-to-pixel match with mask
        with Image.open(src_img_path) as im:
            im = ImageOps.exif_transpose(im)
            im = im.convert("RGB")
            im_size = im.size
            
        with Image.open(src_mask_path) as mk:
            mk = mk.convert("L")
            mk_size = mk.size
            
        if im_size != mk_size:
            raise ValueError(f"Size mismatch for {cid}: img {im_size} vs mask {mk_size}")
            
        img_base = os.path.splitext(os.path.basename(rel_img_path))[0] + ".png"
        mask_base = os.path.splitext(os.path.basename(rel_mask_path))[0] + ".png"
        target_img_name = f"{cid}_{img_base}"
        target_mask_name = f"{cid}_{mask_base}"
        target_img_path = os.path.join(FINAL_DATASET_DIR, split, "images", target_img_name)
        target_mask_path = os.path.join(FINAL_DATASET_DIR, split, "masks", target_mask_name)
        
        im.save(target_img_path, format="PNG")
        mk.save(target_mask_path, format="PNG")
        
        img_hash = sha256_file(target_img_path)
        split_hashes[split].add(img_hash)
        split_counts[split] += 1
        crop_counts[crop] = crop_counts.get(crop, 0) + 1
        
        curated_records.append({
            "candidate_id": cid,
            "split": split,
            "crop": crop,
            "image_file": target_img_name,
            "mask_file": target_mask_name,
            "image_sha256": img_hash,
            "decision": d["verified_decision"],
            "resolution": f"{im_size[0]}x{im_size[1]}"
        })
        
    # Check data leakage across splits
    leakage_train_val = split_hashes["train"].intersection(split_hashes["val"])
    leakage_train_test = split_hashes["train"].intersection(split_hashes["test"])
    leakage_val_test = split_hashes["val"].intersection(split_hashes["test"])
    
    has_leakage = bool(leakage_train_val or leakage_train_test or leakage_val_test)
    if has_leakage:
        raise RuntimeError(f"SPLIT LEAKAGE DETECTED! train-val: {len(leakage_train_val)}, train-test: {len(leakage_train_test)}, val-test: {len(leakage_val_test)}")
        
    print(f"Split distribution: {split_counts}")
    print(f"Crop distribution: {crop_counts}")
    print(f"Data leakage check: PASSED (0 shared SHA-256 hashes between splits)")
    
    # Save curated catalog
    df_curated = pd.DataFrame(curated_records)
    df_curated.to_csv(os.path.join(FINAL_DATASET_DIR, "curated_samples.csv"), index=False)
    
    # Write Phase 2 Audit Report
    report = f"""# AgriMind-AI — Phase 2 Final Dataset Curation & Leakage Audit Report

**Date & Time**: 2026-09-27  
**Status**: PASSED (Integrity Verified, Zero Leakage)  
**Total Candidates Audited**: 231 (Candidates #0004 to #0234)

## 1. Decision Audit Summary
- **Total Audited**: 231
- **Missing Decisions**: 0
- **Candidate-ID Mismatches**: 0
- **Decisions Breakdown**:
  - `MINOR_REVIEW`: {decision_counts.get('MINOR_REVIEW', 0)} (Eligible)
  - `APPROVED`: {decision_counts.get('APPROVED', 0)} (Eligible)
  - `REJECT_WHOLE_FRAME`: {decision_counts.get('REJECT_WHOLE_FRAME', 0)} (Excluded - Area ratio >98% full-frame background failure)
  - `UNCERTAIN`: {decision_counts.get('UNCERTAIN', 0)}
- **Eligible Curated Samples**: {len(curated_records)}
- **Excluded Samples**: {len(rejected_cids) + len(uncertain_cids)}

## 2. Dataset Split Distribution
- **Train Set**: {split_counts['train']} samples
- **Validation Set**: {split_counts['val']} samples
- **Test Set**: {split_counts['test']} samples
- **Total Final Dataset**: {sum(split_counts.values())} samples

## 3. Crop Distribution
"""
    for crop, cnt in crop_counts.items():
        report += f"- **{crop}**: {cnt} samples\n"
        
    report += f"""
## 4. Integrity and Leakage Verification
- **Image & Mask Resolution Check**: 100% matched pair dimensions.
- **SHA-256 Leakage Analysis**:
  - Train ∩ Val: {len(leakage_train_val)} (Expected: 0)
  - Train ∩ Test: {len(leakage_train_test)} (Expected: 0)
  - Val ∩ Test: {len(leakage_val_test)} (Expected: 0)
- **Leakage Result**: **NO DATA LEAKAGE DETECTED**.
- **Dataset Path**: `ml/leaf_detection/dataset/final/`

## 5. Phase 2 Gate Approval
Phase 2 Curation and Verification criteria are completely satisfied. The dataset is fully isolated, human-verified, clean, and certified for Phase 3 Model Training.
"""

    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write(report)
        
    print(f"Phase 2 report generated at: {REPORT_PATH}")
    print("=== PHASE 2 COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
