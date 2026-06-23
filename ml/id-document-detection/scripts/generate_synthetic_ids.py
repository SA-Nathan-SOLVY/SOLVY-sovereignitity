#!/usr/bin/env python3
"""
Generate synthetic ID document images for YOLOv8-OBB training.

Outputs:
  dataset/images/train/*.jpg
  dataset/labels/train/*.txt   (YOLO OBB format: class x1 y1 x2 y2 x3 y3 x4 y4)

Each .txt file contains one line per ID document (single class).
Front and back variants are mixed in the same dataset.
"""

import os
import random
import math
import argparse
from datetime import datetime, timedelta
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

# Config
WIDTH, HEIGHT = 640, 640
ID_WIDTH_MIN, ID_WIDTH_MAX = 360, 480
ID_HEIGHT_MIN, ID_HEIGHT_MAX = 220, 300
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"
BACKGROUND_COLORS = [(60, 60, 70), (80, 75, 70), (50, 55, 60), (90, 90, 95), (40, 45, 50)]
ID_BASE_COLORS = [(230, 230, 210), (210, 220, 200), (220, 210, 190), (240, 235, 220)]

STATES = [
    "TEXAS", "CALIFORNIA", "FLORIDA", "NEW YORK", "GEORGIA",
    "NORTH CAROLINA", "OHIO", "MICHIGAN", "PENNSYLVANIA", "ILLINOIS"
]

FIRST_NAMES = ["JAMES", "MARIA", "ROBERT", "JENNIFER", "MICHAEL", "LINDA", "WILLIAM", "PATRICIA"]
LAST_NAMES = ["SMITH", "JOHNSON", "WILLIAMS", "BROWN", "JONES", "GARCIA", "MILLER", "DAVIS"]
STREETS = ["OAK", "MAPLE", "MAIN", "CEDAR", "PINE", "ELM", "WASHINGTON", "LAKE"]
CITIES = ["AUSTIN", "DALLAS", "HOUSTON", "SAN ANTONIO", "FORT WORTH", "EL PASO"]


def get_font(size):
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except OSError:
        return ImageFont.load_default()


def random_id_number():
    return f"{random.randint(10000000, 99999999)}"


def random_date(start_year=1950, end_year=2000):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days))


def generate_id_front():
    """Render a synthetic driver's license front."""
    w = random.randint(ID_WIDTH_MIN, ID_WIDTH_MAX)
    h = random.randint(ID_HEIGHT_MIN, ID_HEIGHT_MAX)

    base_color = random.choice(ID_BASE_COLORS)
    card = Image.new("RGB", (w, h), base_color)
    draw = ImageDraw.Draw(card)

    font_header = get_font(16)
    font_title = get_font(20)
    font_normal = get_font(13)
    font_small = get_font(11)

    margin = 14
    y = margin

    # State header
    state = random.choice(STATES)
    draw.text((w // 2, y), state, fill=(0, 0, 100), font=font_title, anchor="mt")
    y += 26
    draw.text((w // 2, y), "DRIVER LICENSE", fill=(0, 0, 0), font=font_header, anchor="mt")
    y += 28

    # Photo placeholder (left side)
    photo_w, photo_h = 100, 120
    photo_x = w - margin - photo_w
    photo_y = y
    draw.rectangle([photo_x, photo_y, photo_x + photo_w, photo_y + photo_h], outline=(0, 0, 0), width=2)
    draw.text((photo_x + photo_w // 2, photo_y + photo_h // 2), "PHOTO", fill=(100, 100, 100),
              font=font_small, anchor="mm")

    # Text fields (left of photo)
    x_col = margin
    y_field = y

    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    draw.text((x_col, y_field), f"LN {last}", fill=(0, 0, 0), font=font_normal)
    y_field += 22
    draw.text((x_col, y_field), f"FN {first}", fill=(0, 0, 0), font=font_normal)
    y_field += 22

    street_num = random.randint(1000, 9999)
    street = random.choice(STREETS)
    city = random.choice(CITIES)
    draw.text((x_col, y_field), f"{street_num} {street} ST", fill=(0, 0, 0), font=font_small)
    y_field += 18
    draw.text((x_col, y_field), f"{city}, TX {random.randint(10000, 99999)}", fill=(0, 0, 0), font=font_small)
    y_field += 24

    dob = random_date(1950, 2000).strftime("%m/%d/%Y")
    issue = random_date(2020, 2023).strftime("%m/%d/%Y")
    expiry = random_date(2026, 2030).strftime("%m/%d/%Y")
    draw.text((x_col, y_field), f"DOB {dob}  ISS {issue}", fill=(0, 0, 0), font=font_small)
    y_field += 18
    draw.text((x_col, y_field), f"EXP {expiry}  ID# {random_id_number()}", fill=(0, 0, 0), font=font_small)
    y_field += 24

    draw.text((x_col, y_field), f"CLASS C  END NONE  REST NONE", fill=(0, 0, 0), font=font_small)

    # Subtle pattern lines
    for i in range(4):
        ly = y + 20 + i * 30
        draw.line([(margin, ly), (w - margin, ly)], fill=(180, 180, 160), width=1)

    return card


def generate_id_back():
    """Render a synthetic driver's license back."""
    w = random.randint(ID_WIDTH_MIN, ID_WIDTH_MAX)
    h = random.randint(ID_HEIGHT_MIN, ID_HEIGHT_MAX)

    base_color = random.choice(ID_BASE_COLORS)
    card = Image.new("RGB", (w, h), base_color)
    draw = ImageDraw.Draw(card)

    font_header = get_font(16)
    font_normal = get_font(12)
    font_bar = get_font(10)

    margin = 14
    y = margin

    draw.text((w // 2, y), "IDENTIFICATION CARD", fill=(0, 0, 100), font=font_header, anchor="mt")
    y += 28

    # Fake barcode block
    barcode_h = 60
    draw.rectangle([margin, y, w - margin, y + barcode_h], fill=(240, 240, 240), outline=(0, 0, 0), width=1)
    barcode_text = "PDF417" + "*" * 80
    for i in range(6):
        draw.text((margin + 4, y + 4 + i * 9), barcode_text[i * 12:(i + 1) * 12],
                  fill=(0, 0, 0), font=font_bar)
    y += barcode_h + 16

    # Back text
    lines = [
        "RESTRICTIONS: NONE",
        "ENDORSEMENTS: NONE",
        "ADDRESS CHANGES MUST BE REPORTED WITHIN 30 DAYS",
        "NOT FOR FEDERAL IDENTIFICATION",
        "THIS CARD IS PROPERTY OF THE STATE",
        f"ID: {random_id_number()}",
    ]
    for line in lines:
        draw.text((margin, y), line, fill=(0, 0, 0), font=font_normal)
        y += 18

    # Magstripe placeholder
    stripe_y = h - 40
    draw.rectangle([0, stripe_y, w, stripe_y + 24], fill=(30, 30, 30))

    return card


def apply_perspective_transform(card, corners):
    """Warp card into target quadrilateral and composite onto transparent background."""
    src_w, src_h = card.size
    src_corners = [(0, 0), (src_w, 0), (src_w, src_h), (0, src_h)]
    coeffs = find_coeffs(src_corners, corners)
    warped = card.transform((WIDTH, HEIGHT), Image.Transform.PERSPECTIVE,
                           data=coeffs, resample=Image.Resampling.BICUBIC)

    mask = Image.new('L', (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(corners, fill=255)

    rgba = warped.convert('RGBA')
    rgba.putalpha(mask)
    return rgba


def find_coeffs(pa, pb):
    """Compute perspective transform coefficients mapping pb -> pa."""
    matrix = []
    for p1, p2 in zip(pa, pb):
        matrix.append([p2[0], p2[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[1]*p1[0]])
        matrix.append([0, 0, 0, p2[0], p2[1], 1, -p2[0]*p1[1], -p2[1]*p1[1]])

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
    """Order corners for YOLO OBB: top-left, top-right, bottom-right, bottom-left."""
    sorted_by_y = sorted(corners, key=lambda p: p[1])
    top_two = sorted(sorted_by_y[:2], key=lambda p: p[0])
    bottom_two = sorted(sorted_by_y[2:], key=lambda p: p[0], reverse=True)
    return [top_two[0], top_two[1], bottom_two[0], bottom_two[1]]


def generate_image(idx, split):
    """Generate one training image and its YOLO OBB label."""
    bg_color = random.choice(BACKGROUND_COLORS)
    bg = Image.new("RGB", (WIDTH, HEIGHT), bg_color)

    side = random.choice(["front", "back"])
    card = generate_id_front() if side == "front" else generate_id_back()
    cw, ch = card.size

    margin = 50
    cx = random.randint(margin + cw // 2, WIDTH - margin - cw // 2)
    cy = random.randint(margin + ch // 2, HEIGHT - margin - ch // 2)

    corners = [
        (cx - cw // 2, cy - ch // 2),
        (cx + cw // 2, cy - ch // 2),
        (cx + cw // 2, cy + ch // 2),
        (cx - cw // 2, cy + ch // 2)
    ]

    angle = random.uniform(-30, 30)
    corners = rotate_corners(corners, angle, cx, cy)

    if random.random() < 0.7:
        corner_idx = random.randint(0, 3)
        dx = random.randint(-20, 20)
        dy = random.randint(-20, 20)
        x, y = corners[corner_idx]
        corners[corner_idx] = (x + dx, y + dy)

    warped_card = apply_perspective_transform(card, corners)
    bg.paste(warped_card, (0, 0), warped_card.split()[-1])

    if random.random() < 0.3:
        bg = bg.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.3, 1.0)))

    if random.random() < 0.4:
        enhancer = ImageEnhance.Brightness(bg)
        bg = enhancer.enhance(random.uniform(0.85, 1.15))
        enhancer = ImageEnhance.Contrast(bg)
        bg = enhancer.enhance(random.uniform(0.9, 1.2))

    img_dir = Path(f"dataset/images/{split}")
    lbl_dir = Path(f"dataset/labels/{split}")
    img_dir.mkdir(parents=True, exist_ok=True)
    lbl_dir.mkdir(parents=True, exist_ok=True)

    img_name = f"id_{idx:05d}.jpg"
    img_path = img_dir / img_name
    bg.save(img_path, quality=90)

    ordered = order_corners_yolo_obb(corners)
    norm = []
    for x, y in ordered:
        norm.append(x / WIDTH)
        norm.append(y / HEIGHT)

    label_path = lbl_dir / f"id_{idx:05d}.txt"
    with open(label_path, "w") as f:
        f.write("0 " + " ".join(f"{v:.6f}" for v in norm) + "\n")

    return img_path, label_path


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic ID document dataset")
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
