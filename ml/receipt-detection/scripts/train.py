#!/usr/bin/env python3
"""
Train a YOLOv8n-OBB model for receipt detection.

Prerequisites:
  source venv/bin/activate
  python scripts/generate_synthetic_receipts.py

Run:
  python scripts/train.py

Outputs:
  runs/obb/train/weights/best.pt
  runs/obb/train/weights/best.onnx (after export)
"""

import argparse
from pathlib import Path
from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8n-OBB receipt detector")
    parser.add_argument("--epochs", type=int, default=50, help="Training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    parser.add_argument("--data", type=str, default="dataset.yaml", help="Dataset YAML path")
    parser.add_argument("--export", action="store_true", default=True, help="Export to ONNX")
    parser.add_argument("--output-dir", type=str, default="models", help="Where to copy exported model")
    args = parser.parse_args()

    # Load pretrained nano OBB model
    print("Loading YOLOv8n-OBB...")
    model = YOLO("yolov8n-obb.pt")

    # Train
    print(f"Training for {args.epochs} epochs...")
    model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project="runs/obb",
        name="receipt-detector",
        exist_ok=True,
        patience=10,
        device="mps"  # Apple Silicon Metal Performance Shaders; use 'cpu' if unavailable
    )

    # Validate
    print("Validating...")
    metrics = model.val()
    print(f"mAP50-95: {metrics.box.map:.4f}")

    # Export to ONNX
    if args.export:
        print("Exporting to ONNX...")
        model.export(format="onnx", imgsz=args.imgsz, simplify=True)

        # Copy best model and ONNX to output dir
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        weights_dir = Path("runs/obb/receipt-detector/weights")
        best_pt = weights_dir / "best.pt"
        best_onnx = weights_dir / "best.onnx"

        if best_pt.exists():
            import shutil
            shutil.copy(best_pt, output_dir / "receipt-detector.pt")
            print(f"Copied {best_pt} -> {output_dir / 'receipt-detector.pt'}")

        if best_onnx.exists():
            import shutil
            shutil.copy(best_onnx, output_dir / "receipt-detector.onnx")
            print(f"Copied {best_onnx} -> {output_dir / 'receipt-detector.onnx'}")

    print("Done.")


if __name__ == "__main__":
    main()
