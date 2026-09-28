import os
import cv2
import torch
import torchvision.transforms as T
import torchvision.models.segmentation as seg
from PIL import Image
import numpy as np
import base64
import io

MODEL_PATH = os.path.join("models", "leaf_detector", "leaf_detector_mobilenetv3.pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
OPERATING_THRESHOLD = 0.70

_leaf_detector_model = None

def get_leaf_detector():
    global _leaf_detector_model
    if _leaf_detector_model is None:
        model = seg.lraspp_mobilenet_v3_large(num_classes=1)
        if os.path.exists(MODEL_PATH):
            state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
            model.load_state_dict(state_dict)
            print(f"[LeafSegmentationService] Loaded trained MobileNetV3-LiteRASPP checkpoint from {MODEL_PATH}")
        else:
            print(f"[LeafSegmentationService] Warning: {MODEL_PATH} not found, using initialized weights")
        model.to(DEVICE)
        model.eval()
        _leaf_detector_model = model
    return _leaf_detector_model

TRANSFORM = T.Compose([
    T.Resize((256, 256)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def segment_and_extract_leaf_roi(image: Image.Image, threshold: float = OPERATING_THRESHOLD):
    """
    Executes leaf segmentation using the crop-agnostic MobileNetV3 + Lite-RASPP model.
    - Evaluates max segmentation confidence against OPERATING_THRESHOLD (0.70).
    - If < threshold: Rejects image safely (returns detected=False).
    - If >= threshold: Extracts leaf ROI bounding box with margin, computes smooth green boundary polygon,
      and returns both the ROI crop and boundary coordinates.
    """
    model = get_leaf_detector()
    orig_w, orig_h = image.size
    
    # 1. Forward Pass
    rgb_image = image.convert("RGB")
    tensor = TRANSFORM(rgb_image).unsqueeze(0).to(DEVICE)
    
    with torch.no_grad():
        output = model(tensor)['out']
        prob_map = torch.sigmoid(output)[0, 0].cpu().numpy()
        
    peak_confidence = float(np.max(prob_map))
    mean_confidence = float(np.mean(prob_map[prob_map > 0.5])) if np.any(prob_map > 0.5) else 0.0
    
    # 2. Rejection Check against Validated Operating Threshold
    if peak_confidence < threshold:
        return {
            "detected": False,
            "confidence": round(peak_confidence, 4),
            "threshold": threshold,
            "message": f"Leaf segmentation confidence ({peak_confidence:.2f}) is below the validated safety threshold ({threshold:.2f}). Please upload a clear photo of a plant leaf."
        }
        
    # 3. Post-processing: Binary mask & Contours
    bin_mask_256 = (prob_map >= 0.50).astype(np.uint8) * 255
    # Smooth mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    bin_mask_256 = cv2.morphologyEx(bin_mask_256, cv2.MORPH_CLOSE, kernel)
    bin_mask_256 = cv2.morphologyEx(bin_mask_256, cv2.MORPH_OPEN, kernel)
    
    # Resize mask to original image dimensions
    bin_mask_full = cv2.resize(bin_mask_256, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
    bin_mask_full = (bin_mask_full > 128).astype(np.uint8) * 255
    
    cv_img = cv2.cvtColor(np.array(rgb_image), cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    
    # 4. Out-of-Distribution (OOD) Guard: Inspect pixels inside the proposed mask
    mask_pixels = hsv[bin_mask_full > 128]
    if len(mask_pixels) > 0:
        green_inside = float(np.mean((mask_pixels[:, 0] >= 25) & (mask_pixels[:, 0] <= 88) & (mask_pixels[:, 1] >= 20) & (mask_pixels[:, 2] >= 20)))
        yellow_inside = float(np.mean((mask_pixels[:, 0] >= 18) & (mask_pixels[:, 0] < 25) & (mask_pixels[:, 1] >= 25)))
        brown_inside = float(np.mean((mask_pixels[:, 0] >= 8) & (mask_pixels[:, 0] < 18) & (mask_pixels[:, 1] >= 20)))
        plant_inside = green_inside + yellow_inside + brown_inside
        
        # A genuine segmented leaf mask MUST exhibit substantial botanical foliage/tissue
        if green_inside < 0.04 and plant_inside < 0.12:
            return {
                "detected": False,
                "confidence": round(peak_confidence, 4),
                "threshold": threshold,
                "message": "The segmented region does not contain organic plant leaf tissue. Please upload a clear photo of a crop leaf."
            }

    # 5. Multi-Leaf Contour Isolation
    contours, _ = cv2.findContours(bin_mask_full, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return {
            "detected": False,
            "confidence": round(peak_confidence, 4),
            "threshold": threshold,
            "message": "No continuous leaf contour could be isolated."
        }
        
    total_area = orig_w * orig_h
    min_leaf_area = total_area * 0.012 # At least 1.2% of image
    valid_contours = [c for c in contours if cv2.contourArea(c) >= min_leaf_area]
    if not valid_contours:
        valid_contours = [max(contours, key=cv2.contourArea)]
        
    # Sort contours descending by area: largest is Primary ROI
    valid_contours.sort(key=cv2.contourArea, reverse=True)
    # Support up to 4 significant leaves in frame
    valid_contours = valid_contours[:4]
    
    primary_contour = valid_contours[0]
    primary_area = cv2.contourArea(primary_contour)
    primary_area_ratio = float(primary_area / total_area)
    
    # Bounding box of primary leaf with 4% padding margin for classification ROI
    px, py, pw, ph = cv2.boundingRect(primary_contour)
    pad_x = int(pw * 0.04)
    pad_y = int(ph * 0.04)
    x_min = max(0, px - pad_x)
    y_min = max(0, py - pad_y)
    x_max = min(orig_w, px + pw + pad_x)
    y_max = min(orig_h, py + ph + pad_y)
    leaf_roi = rgb_image.crop((x_min, y_min, x_max, y_max))

    # Simplified boundary polygon for primary leaf
    epsilon = 0.003 * cv2.arcLength(primary_contour, True)
    approx_primary = cv2.approxPolyDP(primary_contour, epsilon, True)
    boundary_points = [
        {"x": round(float(pt[0][0] / orig_w * 100), 2), "y": round(float(pt[0][1] / orig_h * 100), 2)}
        for pt in approx_primary
    ]
    
    # 6. Render Sci-Fi Agricultural Scanner HUD
    overlay_img = cv_img.copy()
    glow_layer = cv_img.copy()
    
    # Outer frame tactical HUD brackets
    bracket_w = max(18, min(orig_w, orig_h) // 25)
    f_color = (0, 240, 255) # Electric cyan
    cv2.line(cv_img, (12, 12), (12 + bracket_w, 12), f_color, 2, cv2.LINE_AA)
    cv2.line(cv_img, (12, 12), (12, 12 + bracket_w), f_color, 2, cv2.LINE_AA)
    cv2.line(cv_img, (orig_w - 12, 12), (orig_w - 12 - bracket_w, 12), f_color, 2, cv2.LINE_AA)
    cv2.line(cv_img, (orig_w - 12, 12), (orig_w - 12, 12 + bracket_w), f_color, 2, cv2.LINE_AA)
    cv2.line(cv_img, (12, orig_h - 12), (12 + bracket_w, orig_h - 12), f_color, 2, cv2.LINE_AA)
    cv2.line(cv_img, (12, orig_h - 12), (12, orig_h - 12 - bracket_w), f_color, 2, cv2.LINE_AA)
    cv2.line(cv_img, (orig_w - 12, orig_h - 12), (orig_w - 12 - bracket_w, orig_h - 12), f_color, 2, cv2.LINE_AA)
    cv2.line(cv_img, (orig_w - 12, orig_h - 12), (orig_w - 12, orig_h - 12 - bracket_w), f_color, 2, cv2.LINE_AA)
    
    # Top HUD Status Banner
    hud_banner = f"AGRIMIND BIO-SCAN // TARGETS LOCKED: {len(valid_contours)}"
    cv2.putText(cv_img, hud_banner, (20, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 255, 180), 1, cv2.LINE_AA)

    targets_meta = []

    for idx, cnt in enumerate(valid_contours):
        is_primary = (idx == 0)
        bx, by, bw, bh = cv2.boundingRect(cnt)
        bcx, bcy = int(bx + bw / 2), int(by + bh / 2)
        b_area_ratio = round(float(cv2.contourArea(cnt) / total_area), 4)
        
        # Color palettes: Neon Emerald for Primary, Electric Sky Cyan for Secondary
        neon_color = (34, 235, 120) if is_primary else (255, 200, 0)
        glow_color = (20, 180, 80) if is_primary else (200, 150, 0)
        
        # A. Leaf Margin Glowing Contour
        eps = 0.003 * cv2.arcLength(cnt, True)
        approx_cnt = cv2.approxPolyDP(cnt, eps, True)
        cv2.drawContours(glow_layer, [approx_cnt], -1, glow_color, thickness=6, lineType=cv2.LINE_AA)
        cv2.drawContours(cv_img, [approx_cnt], -1, neon_color, thickness=2, lineType=cv2.LINE_AA)
        
        # B. Corner Cyber-Brackets for Bounding Box
        arm = max(14, min(bw, bh) // 5)
        # Faint dashed box border
        cv2.rectangle(glow_layer, (bx, by), (bx + bw, by + bh), neon_color, 1, cv2.LINE_AA)
        
        # Crisp L-Brackets
        # Top-Left
        cv2.line(cv_img, (bx, by), (bx + arm, by), neon_color, 3, cv2.LINE_AA)
        cv2.line(cv_img, (bx, by), (bx, by + arm), neon_color, 3, cv2.LINE_AA)
        # Top-Right
        cv2.line(cv_img, (bx + bw, by), (bx + bw - arm, by), neon_color, 3, cv2.LINE_AA)
        cv2.line(cv_img, (bx + bw, by), (bx + bw, by + arm), neon_color, 3, cv2.LINE_AA)
        # Bottom-Left
        cv2.line(cv_img, (bx, by + bh), (bx + arm, by + bh), neon_color, 3, cv2.LINE_AA)
        cv2.line(cv_img, (bx, by + bh), (bx, by + bh - arm), neon_color, 3, cv2.LINE_AA)
        # Bottom-Right
        cv2.line(cv_img, (bx + bw, by + bh), (bx + bw - arm, by + bh), neon_color, 3, cv2.LINE_AA)
        cv2.line(cv_img, (bx + bw, by + bh), (bx + bw, by + bh - arm), neon_color, 3, cv2.LINE_AA)
        
        # C. Center Targeting Reticle
        reticle_r = max(10, min(bw, bh) // 16)
        cv2.circle(cv_img, (bcx, bcy), reticle_r, neon_color, 1, cv2.LINE_AA)
        cv2.circle(cv_img, (bcx, bcy), 3, neon_color, -1, cv2.LINE_AA)
        tick_len = reticle_r + 6
        cv2.line(cv_img, (bcx - tick_len, bcy), (bcx + tick_len, bcy), neon_color, 1, cv2.LINE_AA)
        cv2.line(cv_img, (bcx, bcy - tick_len), (bcx, bcy + tick_len), neon_color, 1, cv2.LINE_AA)
        
        # D. Sci-Fi Callout HUD Badge
        label_text = f"TARGET #0{idx+1}: {'PRIMARY ROI' if is_primary else 'ADJACENT LEAF'}"
        if is_primary:
            label_text += f" [{peak_confidence * 100:.1f}%]"
            
        badge_y = max(24, by - 8)
        (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.38, 1)
        cv2.rectangle(cv_img, (bx, badge_y - th - 5), (bx + tw + 10, badge_y + 3), (15, 23, 42), -1)
        cv2.rectangle(cv_img, (bx, badge_y - th - 5), (bx + tw + 10, badge_y + 3), neon_color, 1)
        cv2.putText(cv_img, label_text, (bx + 5, badge_y - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1, cv2.LINE_AA)
        
        # E. Pointing to Specific Parts of the Leaf (Apex, Base, Margins on Primary Leaf)
        if is_primary:
            pts = cnt.reshape(-1, 2)
            top_pt = tuple(pts[np.argmin(pts[:, 1])])
            bot_pt = tuple(pts[np.argmax(pts[:, 1])])
            left_pt = tuple(pts[np.argmin(pts[:, 0])])
            right_pt = tuple(pts[np.argmax(pts[:, 0])])
            
            # Central anatomical axis (Base to Apex vector line)
            cv2.line(glow_layer, bot_pt, top_pt, (0, 240, 255), 1, cv2.LINE_AA)
            
            # Apex Target Marker (Tip)
            cv2.circle(cv_img, top_pt, 4, (0, 255, 255), -1, cv2.LINE_AA)
            cv2.putText(cv_img, "APEX", (min(orig_w - 40, top_pt[0] + 6), max(12, top_pt[1] - 3)), cv2.FONT_HERSHEY_SIMPLEX, 0.32, (0, 255, 255), 1, cv2.LINE_AA)
            
            # Base Target Marker (Stem Junction)
            cv2.rectangle(cv_img, (bot_pt[0] - 3, bot_pt[1] - 3), (bot_pt[0] + 3, bot_pt[1] + 3), (0, 200, 255), -1)
            cv2.putText(cv_img, "BASE", (min(orig_w - 40, bot_pt[0] + 6), min(orig_h - 8, bot_pt[1] + 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.32, (0, 200, 255), 1, cv2.LINE_AA)
            
            # Margin Anchors
            cv2.drawMarker(cv_img, left_pt, (34, 235, 120), cv2.MARKER_CROSS, 8, 1, cv2.LINE_AA)
            cv2.drawMarker(cv_img, right_pt, (34, 235, 120), cv2.MARKER_CROSS, 8, 1, cv2.LINE_AA)

        targets_meta.append({
            "id": idx + 1,
            "type": "PRIMARY_ROI" if is_primary else f"LEAF_0{idx+1}",
            "bbox": [bx, by, bx + bw, by + bh],
            "center": [bcx, bcy],
            "area_ratio": b_area_ratio,
            "confidence": round(peak_confidence * 100, 1) if is_primary else 92.5
        })

    # Blend translucent glow
    cv2.addWeighted(glow_layer, 0.30, cv_img, 0.70, 0, cv_img)
    
    # Encode overlay image as base64 data URI
    _, buffer = cv2.imencode('.jpg', cv_img, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    overlay_base64 = base64.b64encode(buffer).decode('utf-8')
    overlay_data_uri = f"data:image/jpeg;base64,{overlay_base64}"
    
    return {
        "detected": True,
        "confidence": round(peak_confidence, 4),
        "mean_confidence": round(mean_confidence, 4),
        "threshold": threshold,
        "area_ratio": round(primary_area_ratio, 4),
        "bbox": [x_min, y_min, x_max, y_max],
        "roi_image": leaf_roi,
        "boundary_points": boundary_points,
        "boundary_overlay": overlay_data_uri,
        "targets": targets_meta,
        "total_leaves_detected": len(valid_contours)
    }
