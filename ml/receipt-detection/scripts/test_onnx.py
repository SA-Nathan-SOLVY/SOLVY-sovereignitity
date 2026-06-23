#!/usr/bin/env python3
"""Test the exported ONNX model and inspect output format."""

from pathlib import Path
from PIL import Image
from ultralytics import YOLO

pt_path = Path("/Users/smayone/Sovereignitity-Stack/runs/obb/runs/obb/receipt-detector/weights/best.pt")
onnx_path = Path("/Users/smayone/Sovereignitity-Stack/runs/obb/runs/obb/receipt-detector/weights/best.onnx")
img_path = Path("/Users/smayone/Sovereignitity-Stack/ml/receipt-detection/dataset/images/val/receipt_00000.jpg")

print("=== PT model conf=0.01 ===")
model_pt = YOLO(pt_path, task="obb")
results = model_pt(img_path, imgsz=640, conf=0.01)
for r in results:
    print("Boxes:", r.obb.xyxyxyxy if r.obb else None)
    print("Confidences:", r.obb.conf if r.obb else None)
