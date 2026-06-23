# SOLVY Receipt Detection Model

On-device YOLOv8n-OBB model for detecting receipt regions in camera images.

## Folder Structure

```
ml/receipt-detection/
├── scripts/
│   ├── generate_synthetic_receipts.py   # Create training/validation dataset
│   ├── train.py                         # Train YOLOv8n-OBB and export ONNX
│   └── test_onnx.py                     # Validate exported ONNX model
├── dataset/
│   ├── images/train                     # 200 synthetic receipt images
│   ├── images/val                       # 40 synthetic receipt images
│   ├── labels/train                     # YOLO OBB labels
│   └── labels/val
├── dataset.yaml                         # Ultralytics dataset config
├── requirements.txt                     # Python dependencies
└── venv/                                # Isolated Python environment
```

## Quick Start

```bash
cd ml/receipt-detection
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Generate dataset
python scripts/generate_synthetic_receipts.py --train 200 --val 40

# Train and export
python scripts/train.py --epochs 50 --batch 16

# Copy exported model to the mobile/web app
mkdir -p ../../solvy-cards/public/models
cp runs/obb/receipt-detector/weights/best.onnx ../../solvy-cards/public/models/receipt-detector.onnx
```

## Training Results

- **Model:** YOLOv8n-OBB
- **Dataset:** 200 synthetic training images, 40 validation images
- **mAP50:** 0.995
- **mAP50-95:** 0.995
- **Export:** ONNX, ~12 MB
- **Hardware:** Apple M1 (MPS)

## Notes

- Synthetic data uses simple paper textures, rotations, and perspective distortions.
- Confidence calibration is now strong; the app uses sigmoid-activated confidence with `CONF_THRESHOLD = 0.25` and area-weighted NMS.
- For production, retrain on real member-consented receipts (with PII redacted) and fine-tune confidence thresholds.
- The ONNX model and WebAssembly runtime run entirely on the member's device.
