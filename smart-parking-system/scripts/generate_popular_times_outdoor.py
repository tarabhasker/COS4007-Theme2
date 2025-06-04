import os
import json
from ultralytics import YOLO

# ==== CONFIGURATION ====
MODEL_PATH = 'server/venv/best_1.pt'   # Change if needed
DATASET_PATH = 'Data/outdoor'                          # Folder with time-based subfolders
OUTPUT_FILE = 'client/public/popular_times_outdoor.json'  # Save output JSON here
# ========================

# Load model
model = YOLO(MODEL_PATH)

# Dict to store vehicle count per hour
popular_times = {}

# Go through each folder (e.g., "10am", "11am", etc.)
for hour_folder in sorted(os.listdir(DATASET_PATH)):
    folder_path = os.path.join(DATASET_PATH, hour_folder)
    if not os.path.isdir(folder_path):
        continue

    count = 0
    for file in os.listdir(folder_path):
        if file.lower().endswith(('.jpg', '.png')):
            img_path = os.path.join(folder_path, file)
            results = model(img_path)
            count += len(results[0].boxes)

    popular_times[hour_folder] = count
    print(f"{hour_folder}: {count} vehicles")

# Save as JSON for React frontend
with open(OUTPUT_FILE, 'w') as f:
    json.dump(popular_times, f, indent=4)

print(f"\n✅ Popular times data saved to {OUTPUT_FILE}")
