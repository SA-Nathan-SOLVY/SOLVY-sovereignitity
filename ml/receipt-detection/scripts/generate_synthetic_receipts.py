#!/usr/bin/env python3
"""
Generate synthetic receipt images for YOLOv8-OBB training.

Outputs:
  dataset/images/train/*.jpg
  dataset/labels/train/*.txt   (YOLO OBB format: class x1 y1 x2 y2 x3 y3 x4 y4)

Each .txt file contains one line per receipt.
"""

import os
import random
import math
import argparse
from datetime import datetime, timedelta
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

# Config
WIDTH, HEIGHT = 640, 640
RECEIPT_WIDTH_MIN, RECEIPT_WIDTH_MAX = 220, 420
RECEIPT_HEIGHT_MIN, RECEIPT_HEIGHT_MAX = 360, 560
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"
BACKGROUND_COLORS = [(240, 240, 240), (220, 215, 200), (230, 230, 220), (245, 245, 245)]
RECEIPT_PAPER_COLORS = [(255, 255, 255), (252, 252, 250), (250, 250, 245)]

STORE_NAMES = [
    "EVERGREEN BEAUTY LOUNGE", "SPS SUPPLY CO", "SOLVY MARKET",
    "NEIGHBORHOOD GROCERY", "QUICK MART", "MAIN ST PHARMACY",
    "FAMILY DINER", "COFFEE CORNER", "TECH STOP", "BOOKS & MORE"
]

ITEMS = [
    ("Hair Oil", 18.99), ("Conditioner", 12.49), ("Shampoo", 14.99),
    ("Styling Gel", 9.99), ("Nail Polish", 7.99), ("Face Cream", 24.99),
    ("Comb Set", 5.49), ("Hair Dryer", 89.99), ("Towels", 15.99),
    ("Brush", 8.99), ("Shaving Kit", 19.99), ("Lotion", 11.49),
    ("Vitamins", 22.99), ("Toothpaste", 4.99), ("Soap", 3.49),
    ("Milk", 3.99), ("Bread", 2.99), ("Eggs", 4.49),
    ("Coffee", 8.99), ("Notebook", 2.49)
]


def get_font(size):
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except OSError:
        return ImageFont.load_default()


def generate_receipt_paper():
    """Render a clean receipt image with random content."""
    w = random.randint(RECEIPT_WIDTH_MIN, RECEIPT_WIDTH_MAX)
    h = random.randint(RECEIPT_HEIGHT_MIN, RECEIPT_HEIGHT_MAX)

    paper = Image.new("RGB", (w, h), random.choice(RECEIPT_PAPER_COLORS))
    draw = ImageDraw.Draw(paper)

    font_header = get_font(18)
    font_normal = get_font(14)
    font_small = get_font(11)

    margin = 16
    y = margin

    # Store header
    store = random.choice(STORE_NAMES)
    draw.text((w // 2, y), store, fill=(0, 0, 0), font=font_header, anchor="mt")
    y += 28

    # Address / phone
    draw.text((w // 2, y), "123 MAIN STREET, AUSTIN TX", fill=(80, 80, 80), font=font_small, anchor="mt")
    y += 16
    draw.text((w // 2, y), "(555) 123-4567", fill=(80, 80, 80), font=font_small, anchor="mt")
    y += 24

    # Date / time
    days_ago = random.randint(0, 60)
    date_str = (datetime.now() - timedelta(days=days_ago)).strftime("%m/%d/%Y %H:%M")
    draw.text((margin, y), date_str, fill=(0, 0, 0), font=font_small)
    draw.text((w - margin, y), f"TXN#{random.randint(100000, 999999)}", fill=(0, 0, 0), font=font_small, anchor="rt")
    y += 22

    # Separator
    draw.line([(margin, y), (w - margin, y)], fill=(0, 0, 0), width=1)
    y += 10

    # Items
    num_items = random.randint(2, 6)
    subtotal = 0
    for _ in range(num_items):
        item, price = random.choice(ITEMS)
        qty = random.randint(1, 3)
        line_total = round(price * qty, 2)
        subtotal += line_total
        draw.text((margin, y), f"{item} x{qty}", fill=(0, 0, 0), font=font_normal)
        draw.text((w - margin, y), f"${line_total:.2f}", fill=(0, 0, 0), font=font_normal, anchor="rt")
        y += 20

    y += 6
    draw.line([(margin, y), (w - margin, y)], fill=(0, 0, 0), width=1)
    y += 12

    tax_rate = random.choice([0.0625, 0.07, 0.0825, 0.0875])
    tax = round(subtotal * tax_rate, 2)
    total = round(subtotal + tax, 2)

    draw.text((margin, y), "SUBTOTAL", fill=(0, 0, 0), font=font_normal)
    draw.text((w - margin, y), f"${subtotal:.2f}", fill=(0, 0, 0), font=font_normal, anchor="rt")
    y += 20

    draw.text((margin, y), "TAX", fill=(0, 0, 0), font=font_normal)
    draw.text((w - margin, y), f"${tax:.2f}", fill=(0, 0, 0), font=font_normal, anchor="rt")
    y += 22

    draw.text((margin, y), "TOTAL", fill=(0, 0, 0), font=font_header)
    draw.text((w - margin, y), f"${total:.2f}", fill=(0, 0, 0), font=font_header, anchor="rt")
    y += 32

    # Footer
    draw.text((w // 2, y), "THANK YOU FOR SHOPPING!", fill=(80, 80, 80), font=font_small, anchor="mt")

    # Add slight paper texture / noise
    paper = add_paper_texture(paper)
    return paper


def add_paper_texture(img):
    """Add subtle noise and fold lines to make receipts look realistic."""
    pixels = img.load()
    for i in range(0, img.width, 2):
        for j in range(0, img.height, 2):
            r, g, b = pixels[i, j]
            noise = random.randint(-6, 6)
            pixels[i, j] = (
                max(0, min(255, r + noise)),
                max(0, min(255, g + noise)),
                max(0, min(255, b + noise)),
            )

    # Occasional faint horizontal fold line
    if random.random() < 0.4:
        draw = ImageDraw.Draw(img)
        y_fold = random.randint(img.height // 3, 2 * img.height // 3)
        draw.line([(0, y_fold), (img.width, y_fold)], fill=(200, 200, 200), width=1)

    return img


def apply_perspective_transform(receipt, corners):
    """
    Warp receipt into target quadrilateral (perspective).
    Returns an RGBA image (WIDTH x HEIGHT) where the receipt region is opaque
    and the rest is transparent, ready to be composited onto a background.
    """
    src_w, src_h = receipt.size
    src_corners = [
        (0, 0), (src_w, 0), (src_w, src_h), (0, src_h)
    ]
    # Image.transform expects output->input mapping.
    # find_coeffs(pa, pb) solves pb -> pa, so pa=src_corners, pb=corners.
    coeffs = find_coeffs(src_corners, corners)
    warped = receipt.transform((WIDTH, HEIGHT), Image.Transform.PERSPECTIVE,
                               data=coeffs, resample=Image.Resampling.BICUBIC)

    # Create alpha mask: opaque inside the target quadrilateral, transparent outside
    mask = Image.new('L', (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(corners, fill=255)

    # Convert warped receipt to RGBA and apply mask
    rgba = warped.convert('RGBA')
    rgba.putalpha(mask)
    return rgba


def find_coeffs(pa, pb):
    """Compute perspective transform coefficients mapping pb -> pa."""
    matrix = []
    for p1, p2 in zip(pa, pb):
        matrix.append([p2[0], p2[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[1]*p1[0]])
        matrix.append([0, 0, 0, p2[0], p2[1], 1, -p2[0]*p1[1], -p2[1]*p1[1]])

    A = []
    B = []
    for row in matrix:
        A.append(row[:8])
        B.append(row[8] if len(row) > 8 else -row[6]*p1[0] - row[7]*p1[0])

    # Solve using simple linear algebra
    import numpy as np
    A = np.array(matrix)[:, :8]
    B = np.array([c for p in pa for c in p])
    res = np.dot(np.linalg.inv(A.T @ A) @ A.T, B)
    return res.tolist()


def rotate_corners(corners, angle_deg, cx, cy):
    """Rotate corner points around a center."""
    angle = math.radians(angle_deg)
    cos_a, sin_a = math.cos(angle), math.sin(angle)
    rotated = []
    for x, y in corners:
        dx, dy = x - cx, y - cy
        rx = dx * cos_a - dy * sin_a + cx
        ry = dx * sin_a + dy * cos_a + cy
        rotated.append((rx, ry))
    return rotated


def order_corners_yolo_obb(corners):
    """
    Order corners for YOLO OBB: top-left, top-right, bottom-right, bottom-left.
    Image coordinates: origin top-left, y increases downward.
    """
    # Sort by y ascending; top two corners first
    sorted_by_y = sorted(corners, key=lambda p: p[1])
    top_two = sorted(sorted_by_y[:2], key=lambda p: p[0])  # left to right
    bottom_two = sorted(sorted_by_y[2:], key=lambda p: p[0], reverse=True)  # right to left

    return [top_two[0], top_two[1], bottom_two[0], bottom_two[1]]


def generate_image(idx, split):
    """Generate one training image and its YOLO OBB label."""
    # Background
    bg_color = random.choice(BACKGROUND_COLORS)
    bg = Image.new("RGB", (WIDTH, HEIGHT), bg_color)

    # Generate receipt paper
    receipt = generate_receipt_paper()
    rw, rh = receipt.size

    # Random placement
    margin = 40
    cx = random.randint(margin + rw // 2, WIDTH - margin - rw // 2)
    cy = random.randint(margin + rh // 2, HEIGHT - margin - rh // 2)

    # Initial corners (axis-aligned)
    corners = [
        (cx - rw // 2, cy - rh // 2),  # TL
        (cx + rw // 2, cy - rh // 2),  # TR
        (cx + rw // 2, cy + rh // 2),  # BR
        (cx - rw // 2, cy + rh // 2)   # BL
    ]

    # Apply random rotation
    angle = random.uniform(-35, 35)
    corners = rotate_corners(corners, angle, cx, cy)

    # Apply slight perspective by perturbing one corner
    if random.random() < 0.7:
        corner_idx = random.randint(0, 3)
        dx = random.randint(-20, 20)
        dy = random.randint(-20, 20)
        x, y = corners[corner_idx]
        corners[corner_idx] = (x + dx, y + dy)

    # Warp receipt onto background
    warped_receipt = apply_perspective_transform(receipt, corners)

    # Composite onto background using alpha channel as mask
    bg.paste(warped_receipt, (0, 0), warped_receipt.split()[-1])

    # Add slight blur/noise
    if random.random() < 0.3:
        bg = bg.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.3, 1.0)))

    # Adjust brightness/contrast
    if random.random() < 0.4:
        enhancer = ImageEnhance.Brightness(bg)
        bg = enhancer.enhance(random.uniform(0.85, 1.15))
        enhancer = ImageEnhance.Contrast(bg)
        bg = enhancer.enhance(random.uniform(0.9, 1.2))

    # Save image
    img_dir = Path(f"dataset/images/{split}")
    lbl_dir = Path(f"dataset/labels/{split}")
    img_dir.mkdir(parents=True, exist_ok=True)
    lbl_dir.mkdir(parents=True, exist_ok=True)

    img_name = f"receipt_{idx:05d}.jpg"
    img_path = img_dir / img_name
    bg.save(img_path, quality=90)

    # Normalize corners and write YOLO OBB label
    ordered = order_corners_yolo_obb(corners)
    norm = []
    for x, y in ordered:
        norm.append(x / WIDTH)
        norm.append(y / HEIGHT)

    label_path = lbl_dir / f"receipt_{idx:05d}.txt"
    with open(label_path, "w") as f:
        f.write("0 " + " ".join(f"{v:.6f}" for v in norm) + "\n")

    return img_path, label_path


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic receipt dataset")
    parser.add_argument("--train", type=int, default=200, help="Number of training images")
    parser.add_argument("--val", type=int, default=40, help="Number of validation images")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    args = parser.parse_args()

    random.seed(args.seed)

    print(f"Generating {args.train} training images...")
    for i in range(args.train):
        generate_image(i, "train")
        if (i + 1) % 50 == 0:
            print(f"  ...{i + 1}/{args.train}")

    print(f"Generating {args.val} validation images...")
    for i in range(args.val):
        generate_image(i, "val")
        if (i + 1) % 20 == 0:
            print(f"  ...{i + 1}/{args.val}")

    print("Done.")
    print(f"Dataset location: {Path('dataset').resolve()}")


if __name__ == "__main__":
    main()
