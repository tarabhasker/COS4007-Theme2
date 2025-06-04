from ultralytics import YOLO
import os
import json

# Root directory that contains all time folders
root_dir = r'C:\Users\USER\Pictures\COS40007'

# Load the model
model = YOLO('venv/best_1.pt')
results_list = []

# Loop over each folder (e.g., '10am - Multi', '1pm - Outdoor')
for folder_name in os.listdir(root_dir):
    folder_path = os.path.join(root_dir, folder_name)

    # Only process folders
    if not os.path.isdir(folder_path):
        continue

    # Try to extract time from folder name (e.g., "10am" from "10am - Multi")
    time = folder_name.split()[0]

    print(f"\n🔍 Scanning folder: {folder_name} (Time: {time})")

    for file in os.listdir(folder_path):
        if file.lower().endswith('.jpg'):
            file_path = os.path.join(folder_path, file)
            print(f"Processing {file}...")

            try:
                # Run YOLO inference
                results = model(file_path)
                count = len(results[0].boxes)

                # Parse location and view from filename: e.g., 4A_10am_Left.jpg
                parts = file.replace('.jpg', '').replace('.JPG', '').split('_')
                location = parts[0]
                view = parts[2] if len(parts) > 2 else 'Unknown'

                results_list.append({
                    'image': file,
                    'location': location,
                    'time': time,
                    'view': view,
                    'vehicle_count': count
                })

            except Exception as e:
                print(f"⚠️ Error processing {file}: {e}")

# Save to JSON
output_path = 'occupancy_data_1.json'
with open(output_path, 'w') as f:
    json.dump(results_list, f, indent=2)

print(f"\n✅ All predictions saved to {output_path}")
