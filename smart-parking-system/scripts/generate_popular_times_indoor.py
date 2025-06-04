import os
import json
from ultralytics import YOLO

# ==== CONFIGURATION ====
MODEL_PATH = 'server/venv/best_1.pt'  # Your model path
DATASET_PATH = 'Data/Indoor'          # <-- Updated path for Indoor
OUTPUT_FILE = 'client/public/popular_times_indoor.json'  # Output for indoor
# ========================

# Load model
model = YOLO(MODEL_PATH)

# Dict to store vehicle count per hour
popular_times = {}

# Go through each hour folder (e.g., "10am", "11am", etc.)
for hour_folder in sorted(os.listdir(DATASET_PATH)):
    hour_path = os.path.join(DATASET_PATH, hour_folder)
    if not os.path.isdir(hour_path):
        continue

    count = 0
    # Go through each level folder inside the hour (e.g., "1A", "2B")
    for level_folder in os.listdir(hour_path):
        level_path = os.path.join(hour_path, level_folder)
        if not os.path.isdir(level_path):
            continue

        for file in os.listdir(level_path):
            if file.lower().endswith(('.jpg', '.png')):
                img_path = os.path.join(level_path, file)
                results = model(img_path)
                count += len(results[0].boxes)

    popular_times[hour_folder] = count
    print(f"{hour_folder}: {count} vehicles")

# Save JSON output
with open(OUTPUT_FILE, 'w') as f:
    json.dump(popular_times, f, indent=4)

print(f"\n✅ Indoor popular times data saved to {OUTPUT_FILE}")
