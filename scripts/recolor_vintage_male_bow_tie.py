#!/usr/bin/env python3
"""Recolor only the vintage masculine companion's bow tie to navy."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = (
    PROJECT_ROOT / "assets" / "companions-source" / "dressed-up-masculine"
)
PUBLIC_DIR = (
    PROJECT_ROOT / "public" / "assets" / "companions" / "dressed-up-masculine"
)


def foreground_bbox(image: Image.Image, box: tuple[int, int, int, int]):
    left, top, right, bottom = box
    visible = []
    for y in range(top, bottom):
        for x in range(left, right):
            red, green, blue, alpha = image.getpixel((x, y))
            is_green = green > 170 and green > red * 1.35 and green > blue * 1.35
            if alpha > 32 and not is_green:
                visible.append((x, y))
    if not visible:
        return None
    xs, ys = zip(*visible)
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def components(points: set[tuple[int, int]]) -> list[set[tuple[int, int]]]:
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


def navy_for(red: int, green: int, blue: int) -> tuple[int, int, int]:
    brightness = max(red, green, blue) / 255
    return (
        round(24 + 42 * brightness),
        round(39 + 68 * brightness),
        round(67 + 98 * brightness),
    )


def recolor_pose(
    image: Image.Image,
    pose_box: tuple[int, int, int, int],
    x_range: tuple[float, float] = (0.34, 0.66),
    y_range: tuple[float, float] = (0.30, 0.42),
) -> int:
    left, top, right, bottom = pose_box
    width = right - left
    height = bottom - top
    roi = (
        round(left + width * x_range[0]),
        round(top + height * y_range[0]),
        round(left + width * x_range[1]),
        round(top + height * y_range[1]),
    )

    candidates = set()
    for y in range(roi[1], roi[3]):
        for x in range(roi[0], roi[2]):
            red, green, blue, alpha = image.getpixel((x, y))
            if (
                alpha > 32
                and red > 85
                and green < 135
                and red - green > 42
                and red - blue > 60
            ):
                candidates.add((x, y))

    groups = components(candidates)
    if not groups:
        raise ValueError(f"Could not locate bow tie in pose {pose_box}")

    largest = max(len(group) for group in groups)
    center_x = left + width / 2
    selected = []
    for group in groups:
        xs = [point[0] for point in group]
        group_center = sum(xs) / len(xs)
        group_width = max(xs) - min(xs) + 1
        if (
            len(group) >= max(6, largest * 0.14)
            and group_width >= 4
            and abs(group_center - center_x) <= width * 0.18
        ):
            selected.extend(group)

    if not selected:
        raise ValueError(f"Bow-tie candidates were too small in pose {pose_box}")

    for x, y in selected:
        red, green, blue, alpha = image.getpixel((x, y))
        image.putpixel((x, y), (*navy_for(red, green, blue), alpha))
    return len(selected)


def horizontal_pose_boxes(image: Image.Image) -> list[tuple[int, int, int, int]]:
    alpha = image.getchannel("A")
    occupied = []
    for x in range(image.width):
        visible = 0
        for y in range(image.height):
            red, green, blue, value = image.getpixel((x, y))
            is_green = green > 170 and green > red * 1.35 and green > blue * 1.35
            if value > 32 and not is_green:
                visible += 1
        occupied.append(visible > 2)

    runs = []
    start = None
    for x, is_occupied in enumerate((*occupied, False)):
        if is_occupied and start is None:
            start = x
        elif not is_occupied and start is not None:
            if x - start > 10:
                runs.append((start, x))
            start = None

    if len(runs) != 4:
        raise ValueError(f"Expected four poses, found {len(runs)}")

    boxes = []
    for left, right in runs:
        box = foreground_bbox(image, (left, 0, right, image.height))
        if box is None:
            raise ValueError("Pose has no visible pixels")
        boxes.append(box)
    return boxes


def recolor_horizontal_strip(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    changed = sum(recolor_pose(image, box) for box in horizontal_pose_boxes(image))
    if path.parent.name == "strips":
        image.convert("RGB").save(path, optimize=True)
    else:
        image.save(path, optimize=True)
    print(f"{path.relative_to(PROJECT_ROOT)}: {changed} bow-tie pixels")


def recolor_base(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    box = foreground_bbox(image, (0, 0, image.width, image.height))
    if box is None:
        raise ValueError("Base companion has no visible pixels")
    changed = recolor_pose(
        image,
        box,
        x_range=(0.25, 0.55),
        y_range=(0.33, 0.46),
    )
    image.save(path, optimize=True)
    print(f"{path.relative_to(PROJECT_ROOT)}: {changed} bow-tie pixels")


def recolor_state_sheet(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    # Tight normalized bounds keep nearby mouths, hands, and suspenders intact.
    bow_tie_boxes = (
        (0.279, 0.172, 0.325, 0.204),
        (0.684, 0.182, 0.725, 0.210),
        (0.279, 0.654, 0.310, 0.685),
        (0.687, 0.678, 0.732, 0.707),
    )
    changed = 0
    for left_ratio, top_ratio, right_ratio, bottom_ratio in bow_tie_boxes:
        left = round(image.width * left_ratio)
        right = round(image.width * right_ratio)
        top = round(image.height * top_ratio)
        bottom = round(image.height * bottom_ratio)
        for y in range(top, bottom):
            for x in range(left, right):
                red, green, blue, alpha = image.getpixel((x, y))
                if (
                    alpha > 32
                    and red > 95
                    and green < 115
                    and red > green * 1.65
                    and red > blue * 1.8
                ):
                    image.putpixel((x, y), (*navy_for(red, green, blue), alpha))
                    changed += 1
    image.convert("RGB").save(path, optimize=True)
    print(f"{path.relative_to(PROJECT_ROOT)}: {changed} bow-tie pixels")


def main() -> None:
    recolor_base(PUBLIC_DIR / "base.png")
    for directory in ("strips", "strips-alpha"):
        for path in sorted((SOURCE_DIR / directory).glob("*.png")):
            recolor_horizontal_strip(path)
    recolor_state_sheet(SOURCE_DIR / "state-sheets" / "four-states.png")


if __name__ == "__main__":
    main()
