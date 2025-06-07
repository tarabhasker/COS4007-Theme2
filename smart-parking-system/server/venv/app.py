# server/venv/app.py
from flask import Flask, request, jsonify
from ultralytics import YOLO
from PIL import Image
import os, io, json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend access

model = YOLO("final_best-tara.pt")

# Path to client public JSONs
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../client/public'))

def load_json(filename):
    path = os.path.join(BASE_DIR, filename)
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return {}

def save_json(filename, data):
    path = os.path.join(BASE_DIR, filename)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def format_hour(hour_str):
    hour = int(hour_str.split(":")[0])
    if hour == 0:
        return "12am"
    elif hour == 12:
        return "12pm"
    elif hour < 12:
        return f"{hour}am"
    else:
        return f"{hour - 12}pm"

@app.route('/predict', methods=['POST'])
def predict():
    image = Image.open(io.BytesIO(request.files['image'].read()))
    location = request.form['location']
    date = request.form['date']
    time = request.form['time']

    results = model(image)
    count = len(results[0].boxes)

    is_outdoor = 'outdoor' in location.lower()
    loc_type = 'outdoor' if is_outdoor else 'Indoor'
    time_key = format_hour(time)
    loc_name = location.split('-')[-1].strip() if '-' in location else location
    date_key = date

    # Update popular_times json
    pt_filename = f"popular_times_{loc_type}.json"
    pt_data = load_json(pt_filename)
    pt_data.setdefault(date_key, {}).setdefault(time_key, 0)
    pt_data[date_key][time_key] += count
    save_json(pt_filename, pt_data)

    # Update combined_occupancy
    combined_data = load_json("combined_occupancy.json")
    combined_data.setdefault(date_key, []).append({
        "location_type": loc_type,
        "location": loc_name,
        "time": time_key,
        "vehicle_count": count
    })

    # Update combined popular_times summary
    combined_data.setdefault("popular_times", {}).setdefault(loc_type, {}).setdefault(time_key, 0)
    combined_data["popular_times"][loc_type][time_key] += count
    save_json("combined_occupancy.json", combined_data)

    return jsonify({"success": True, "count": count})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
