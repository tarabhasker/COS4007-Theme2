import gradio as gr
from ultralytics import YOLO
from PIL import Image
import numpy as np
import torch

# Manually disable weights_only for older PyTorch versions
# This is needed because torch 2.5 defaults to weights_only=True, which breaks with YOLOv8
def load_model(path):
    return torch.load(path, map_location="cpu", weights_only=False)

# Load YOLOv8 model
model = YOLO("best_2.pt")  # will work now because we’re using torch <2.6 and no safe_globals

# Define prediction function
def predict(image):
    results = model(image)
    result_image = results[0].plot()
    return Image.fromarray(result_image.astype(np.uint8))

# Gradio interface
iface = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil"),
    outputs=gr.Image(type="pil"),
    title="YOLOv8 Vehicle Detection",
    description="Upload a parking lot image to detect vehicles using our YOLOv8 model."
)

if __name__ == "__main__":
    iface.launch(share=True)
