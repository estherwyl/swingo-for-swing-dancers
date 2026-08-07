#!/usr/bin/env python3
"""Turn the casual feminine companion's red sneakers into white tennis shoes."""

from __future__ import annotations

import colorsys
from collections import deque
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = PROJECT_ROOT / "assets" / "companions-source" / "casual-feminine"
PUBLIC_DIR = PROJECT_ROOT / "public" / "assets" / "companions" / "casual-feminine"


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha <= 32 or (
        green > 170 and green > red * 1.35 and green > blue * 1.35
    )


def foreground_bbox(
    image: Image.Image, box: tuple[int, int, int, int]
) -> tuple[int, int, int, int]:
    left, top, right, bottom = box
    points = [
        (x, y)
        for y in range(top, bottom)
        for x in range(left, right)
        if not is_background(image.getpixel((x, y)))
    ]
    if not points:
        raise ValueError(f"No companion pixels found in {box}")
    xs, ys = zip(*points)
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def horizontal_pose_boxes(image: Image.Image) -> list[tuple[int, int, int, int]]:
    occupied = []
    for x in range(image.width):
        count = sum(
            not is_background(image.getpixel((x, y))) for y in range(image.height)
        )
        occupied.append(count > 2)

    runs = []
    start = None
    for x, value in enumerate((*occupied, False)):
        if value and start is None:
            start = x
        elif not value and start is not None:
            if x - start > 10:
                runs.append((start, x))
            start = None

    if len(runs) != 4:
        raise ValueError(f"Expected four poses, found {len(runs)}")
    return [
        foreground_bbox(image, (left, 0, right, image.height))
        for left, right in runs
    ]


def connected_components(
    points: set[tuple[int, int]],
) -> list[set[tuple[int, int]]]:
    groups = []
    while points:
        start = points.pop()
        queue = deque([start])
        group = {start}
        while queue:
            x, y = queue.popleft()
            for neighbor in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if neighbor in points:
                    points.remove(neighbor)
                    group.add(neighbor)
                    queue.append(neighbor)
        groups.append(group)
    return groups


def is_shoe_red(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    hue, saturation, _ = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
    return alpha > 32 and red > 100 and hue <= 0.038 and saturation >= 0.55


def white_for(red: int, green: int, blue: int) -> tuple[int, int, int]:
    brightness = max(red, green, blue) / 255
    if brightness < 0.48:
        return 188, 189, 184
    if brightness < 0.68:
        return 218, 219, 214
    return 247, 247, 240


def recolor_pose(
    image: Image.Image, pose_box: tuple[int, int, int, int]
) -> tuple[int, int]:
    left, top, right, bottom = pose_box
    width = right - left
    height = bottom - top
    # Raised dance poses can bring a shoe well above the standing baseline.
    shoe_top = round(top + height * 0.52)
    candidates = {
        (x, y)
        for y in range(shoe_top, bottom)
        for x in range(left, right)
        if is_shoe_red(image.getpixel((x, y)))
    }
    shoe_groups = []
    for group in connected_components(candidates):
        xs = [x for x, _ in group]
        ys = [y for _, y in group]
        group_width = max(xs) - min(xs) + 1
        group_height = max(ys) - min(ys) + 1
        if (
            len(group) >= 24
            and group_width <= width * 0.38
            and group_height <= height * 0.20
        ):
            shoe_groups.append(group)
    if not shoe_groups:
        raise ValueError(f"Could not find red sneakers in pose {pose_box}")

    changed = 0
    accents = 0
    pose_center = (left + right) / 2
    for group in shoe_groups:
        xs = [x for x, _ in group]
        ys = [y for _, y in group]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)

        for x, y in group:
            red, green, blue, alpha = image.getpixel((x, y))
            image.putpixel((x, y), (*white_for(red, green, blue), alpha))
            changed += 1

        # Add a small green heel tab on the upper edge nearest the dancer's body.
        group_center = (min_x + max_x) / 2
        width = max_x - min_x + 1
        height = max_y - min_y + 1
        top_limit = min_y + max(2, round(height * 0.32))
        if group_center < pose_center:
            heel_limit = max_x - max(2, round(width * 0.22))
            heel_points = [(x, y) for x, y in group if x >= heel_limit and y <= top_limit]
        else:
            heel_limit = min_x + max(2, round(width * 0.22))
            heel_points = [(x, y) for x, y in group if x <= heel_limit and y <= top_limit]

        for x, y in heel_points:
            _, _, _, alpha = image.getpixel((x, y))
            image.putpixel((x, y), (41, 105, 72, alpha))
            accents += 1

    return changed, accents


def recolor_horizontal_strip(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    results = [recolor_pose(image, box) for box in horizontal_pose_boxes(image)]
    if path.parent.name == "strips":
        image.convert("RGB").save(path, optimize=True)
    else:
        image.save(path, optimize=True)
    changed = sum(result[0] for result in results)
    accents = sum(result[1] for result in results)
    print(f"{path.relative_to(PROJECT_ROOT)}: {changed} white, {accents} green")


def recolor_base(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    changed, accents = recolor_pose(
        image, foreground_bbox(image, (0, 0, image.width, image.height))
    )
    image.save(path, optimize=True)
    print(f"{path.relative_to(PROJECT_ROOT)}: {changed} white, {accents} green")


def recolor_state_sheet(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    half_width = image.width // 2
    half_height = image.height // 2
    quadrants = (
        (0, 0, half_width, half_height),
        (half_width, 0, image.width, half_height),
        (0, half_height, half_width, image.height),
        (half_width, half_height, image.width, image.height),
    )
    results = [
        recolor_pose(image, foreground_bbox(image, quadrant))
        for quadrant in quadrants
    ]
    image.convert("RGB").save(path, optimize=True)
    changed = sum(result[0] for result in results)
    accents = sum(result[1] for result in results)
    print(f"{path.relative_to(PROJECT_ROOT)}: {changed} white, {accents} green")


def main() -> None:
    recolor_base(PUBLIC_DIR / "base.png")
    for directory in ("strips", "strips-alpha"):
        for path in sorted((SOURCE_DIR / directory).glob("*.png")):
            recolor_horizontal_strip(path)
    recolor_state_sheet(SOURCE_DIR / "state-sheets" / "four-states.png")


if __name__ == "__main__":
    main()
