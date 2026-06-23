#!/usr/bin/env python3
"""Train YOLOv8n-OBB on synthetic ID documents and export to ONNX."""

import argparse
from ultralytics import YOLO


def main(epochs=30, batch=16):
    model = YOLO('yolov8n-obb.pt')
    model.train(
        data='dataset.yaml',
        epochs=epochs,
        imgsz=640,
        batch=batch,
        device='mps',
        project='runs/obb',
        name='id-document-detector',
        patience=10,
        exist_ok=True
    )
    metrics = model.val()
    print(f'mAP50-95: {metrics.box.map:.4f}')
    model.export(format='onnx')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train ID document detector')
    parser.add_argument('--epochs', type=int, default=30)
    parser.add_argument('--batch', type=int, default=16)
    args = parser.parse_args()
    main(args.epochs, args.batch)
