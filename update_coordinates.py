import json
import os
from PIL import Image

scene_dir = 'data/scenes'
image_dir = 'public/images/scenes'
backup_dir = 'public/images/scenes/old_asset'
target_ratio = 16 / 9

def update_json(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    bg_path = data.get('backgroundImage', '').replace('/images/scenes/', '')
    if not bg_path:
        return
    
    original_image_path = os.path.join(backup_dir, bg_path)
    if not os.path.exists(original_image_path):
        print(f"No backup for {bg_path}, skipping {json_path}")
        return
    
    with Image.open(original_image_path) as img:
        W, H = img.size
    
    # Calculate crop
    current_ratio = W / H
    if current_ratio > target_ratio:
        # Width was cropped
        W_new = int(H * target_ratio)
        H_new = H
        offset_x = (W - W_new) / 2
        offset_y = 0
    elif current_ratio < target_ratio:
        # Height was cropped
        W_new = W
        H_new = int(W / target_ratio)
        offset_x = 0
        offset_y = (H - H_new) / 2
    else:
        # No crop
        return

    scale_x = W / W_new
    scale_y = H / H_new

    def transform(rect):
        # rect: {x, y, width, height} in percentages of (W, H)
        # Pixel coords in original:
        p_x = rect['x'] * W / 100
        p_y = rect['y'] * H / 100
        p_w = rect['width'] * W / 100
        p_h = rect['height'] * H / 100
        
        # Pixel coords in new:
        n_x = (p_x - offset_x)
        n_y = (p_y - offset_y)
        n_w = p_w
        n_h = p_h
        
        # New percentages of (W_new, H_new):
        rect['x'] = round(n_x / W_new * 100, 2)
        rect['y'] = round(n_y / H_new * 100, 2)
        rect['width'] = round(n_w / W_new * 100, 2)
        rect['height'] = round(n_h / H_new * 100, 2)

    def transform_nav(nav):
        pos = nav.get('position')
        if pos:
            transform(pos)

    if 'interactables' in data:
        for item in data['interactables']:
            if 'rect' in item:
                transform(item['rect'])
    
    if 'navigation' in data:
        for nav in data['navigation']:
            transform_nav(nav)

    with open(json_path, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Updated {json_path}")

for filename in os.listdir(scene_dir):
    if filename.endswith('.json'):
        update_json(os.path.join(scene_dir, filename))

print("Done updating scene data.")
