from PIL import Image
import os
import shutil

src_dir = 'public/images/scenes'
backup_dir = 'public/images/scenes/old_asset'
target_ratio = 16 / 9

if not os.path.exists(backup_dir):
    os.makedirs(backup_dir)

files = [f for f in os.listdir(src_dir) if f.endswith('.png')]

for filename in files:
    file_path = os.path.join(src_dir, filename)
    backup_path = os.path.join(backup_dir, filename)
    
    # Backup original
    shutil.copy2(file_path, backup_path)
    print(f"Backed up {filename}")
    
    with Image.open(file_path) as img:
        width, height = img.size
        current_ratio = width / height
        
        if current_ratio > target_ratio:
            # Too wide, cut left and right
            new_width = int(height * target_ratio)
            left = (width - new_width) / 2
            top = 0
            right = (width + new_width) / 2
            bottom = height
            img_cropped = img.crop((left, top, right, bottom))
            print(f"Cropped {filename} (width): {width}x{height} -> {new_width}x{height}")
        elif current_ratio < target_ratio:
            # Too tall, cut top and bottom
            new_height = int(width / target_ratio)
            left = 0
            top = (height - new_height) / 2
            right = width
            bottom = (height + new_height) / 2
            img_cropped = img.crop((left, top, right, bottom))
            print(f"Cropped {filename} (height): {width}x{height} -> {width}x{new_height}")
        else:
            img_cropped = img
            print(f"No crop needed for {filename}")
            
        img_cropped.save(file_path)

print("Done processing images.")
