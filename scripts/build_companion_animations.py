#!/usr/bin/env python3
"""Build Swingo companion loops from four-pose transparent sprite strips."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT / "assets" / "companions-source"
PUBLIC_ROOT = PROJECT_ROOT / "public" / "assets" / "companions"
PRESETS = (
    "dressed-up-feminine",
    "dressed-up-masculine",
    "casual-feminine",
    "casual-masculine",
)
STATES = ("celebrate", "reflect", "fired-up", "disappointed")
CANVAS_SIZE = 256
MAX_SPRITE_WIDTH = 232
MAX_SPRITE_HEIGHT = 224
BASELINE = 244
FRAME_ORDER = (0, 1, 2, 3, 2, 1)
FRAME_DURATION_MS = {
    "celebrate": 150,
    "reflect": 280,
    "fired-up": 190,
    "disappointed": 300,
}


def occupied_column_runs(image: Image.Image) -> list[tuple[int, int]]:
    alpha = image.getchannel("A")
    width, height = alpha.size
    pixels = alpha.load()
    occupied = []

    for x in range(width):
        visible_pixels = sum(pixels[x, y] > 32 for y in range(height))
        occupied.append(visible_pixels > 2)

    runs: list[tuple[int, int]] = []
    start = None
    for x, is_occupied in enumerate((*occupied, False)):
        if is_occupied and start is None:
            start = x
        elif not is_occupied and start is not None:
            if x - start > 10:
                runs.append((start, x))
            start = None

    if len(runs) != 4:
        raise ValueError(f"Expected four separated poses, found {len(runs)}")
    return runs


def extract_poses(strip: Image.Image) -> list[Image.Image]:
    poses = []
    for left, right in occupied_column_runs(strip):
        cell = strip.crop((left, 0, right, strip.height))
        bbox = cell.getchannel("A").getbbox()
        if bbox is None:
            raise ValueError("Pose contains no visible pixels")
        poses.append(cell.crop(bbox))
    return poses


def normalize_poses(poses: list[Image.Image]) -> list[Image.Image]:
    max_width = max(pose.width for pose in poses)
    max_height = max(pose.height for pose in poses)
    scale = min(MAX_SPRITE_WIDTH / max_width, MAX_SPRITE_HEIGHT / max_height)

    normalized = []
    for pose in poses:
        size = (
            max(1, round(pose.width * scale)),
            max(1, round(pose.height * scale)),
        )
        resized = pose.resize(size, Image.Resampling.LANCZOS)
        frame = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
        x = (CANVAS_SIZE - resized.width) // 2
        y = BASELINE - resized.height
        frame.alpha_composite(resized, (x, y))
        normalized.append(frame)
    return normalized


def frame_difference(first: Image.Image, second: Image.Image) -> int:
    diff = ImageChops.difference(first, second)
    return sum(
        1 for value in diff.getchannel("A").get_flattened_data() if value > 12
    )


def build_state(preset: str, state: str) -> None:
    source_dir = SOURCE_ROOT / preset
    public_dir = PUBLIC_ROOT / preset
    strip_path = source_dir / "strips-alpha" / f"{state}.png"
    frames_dir = source_dir / "frames"
    frames_dir.mkdir(exist_ok=True)

    strip = Image.open(strip_path).convert("RGBA")
    frames = normalize_poses(extract_poses(strip))

    for index, frame in enumerate(frames, start=1):
        frame.save(frames_dir / f"{state}-{index}.png", optimize=True)

    differences = [
        frame_difference(frames[index], frames[index + 1])
        for index in range(len(frames) - 1)
    ]
    if min(differences) < 250:
        raise ValueError(
            f"{preset}/{state} has insufficient pose change: {differences}"
        )

    loop_frames = [frames[index] for index in FRAME_ORDER]
    duration = FRAME_DURATION_MS[state]
    loop_frames[0].save(
        public_dir / f"{state}.gif",
        save_all=True,
        append_images=loop_frames[1:],
        duration=duration,
        loop=0,
        disposal=2,
        transparency=0,
        optimize=False,
    )
    loop_frames[0].save(
        public_dir / f"{state}.webp",
        save_all=True,
        append_images=loop_frames[1:],
        duration=duration,
        loop=0,
        lossless=True,
        method=6,
    )

    print(
        f"{preset}/{state}: 4 drawn poses, 6-frame loop, "
        f"differences={differences}"
    )


def main() -> None:
    for preset in PRESETS:
        for state in STATES:
            build_state(preset, state)


if __name__ == "__main__":
    main()
