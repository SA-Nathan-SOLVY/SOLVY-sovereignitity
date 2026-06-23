# SOLVY ID Document Detection Model

On-device YOLOv8n-OBB model for detecting government-issued ID document regions in camera images for Lithic KYC.

## Folder Structure

```
ml/id-document-detection/
├── scripts/
│   ├── generate_synthetic_ids.py   # Create training/validation dataset
│   └── train.py                    # Train YOLOv8n-OBB and export ONNX
├── dataset/
│   ├── images/train                # 200 synthetic ID images
│   ├── images/val                  # 40 synthetic ID images
│   ├── labels/train                # YOLO OBB labels
│   └── labels/val
├── dataset.yaml                    # Ultralytics dataset config
└── requirements.txt                # Python dependencies
```

## Quick Start

```bash
cd ml/id-document-detection
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Generate dataset
python scripts/generate_synthetic_ids.py --train 200 --val 40

# Train and export
python scripts/train.py --epochs 30 --batch 16

# Copy exported model to the mobile/web app
mkdir -p ../../solvy-cards/public/models
cp runs/obb/id-document-detector/weights/best.onnx ../../solvy-cards/public/models/document-detector.onnx
```

## Training Results

- **Model:** YOLOv8n-OBB
- **Dataset:** 200 synthetic training images, 40 validation images
- **mAP50:** 0.995
- **mAP50-95:** 0.995
- **Export:** ONNX, ~12 MB
- **Hardware:** Apple M1 (MPS)

## Notes

- Synthetic data generates driver's license front/back variants with random rotations and perspective distortions.
- For production, retrain on real, consented, PII-redacted ID images and fine-tune confidence thresholds.
- The ONNX model and WebAssembly runtime run entirely on the member's device.
