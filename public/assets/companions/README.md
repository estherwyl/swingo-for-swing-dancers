# Swingo Dancer Companion Assets

Generated: 2026-08-07

These assets are the first preset animated dancer companions for the Swingo beta emotional-design test.

## Presets

- `dressed-up-feminine`
- `dressed-up-masculine`
- `casual-feminine`
- `casual-masculine`

## Files Per Preset

- `base.png`: clean static base companion
- `celebrate.webp` / `celebrate.gif`: high energy pleasant
- `reflect.webp` / `reflect.gif`: low energy pleasant
- `fired-up.webp` / `fired-up.gif`: high energy unpleasant
- `disappointed.webp` / `disappointed.gif`: low energy unpleasant
- `all-states-preview.gif`: QA overview of every preset and state

Use `.webp` in the app. Use `.gif` for quick preview or sharing.

## Current Implementation Note

All four presets now use state-specific four-pose sheets. The app animations are built from actual changes to limbs, posture, and facial expression; no loop is created by translating or rotating one still image.

The dressed-up masculine preset uses a deep navy bow tie across its base art and all four emotional animations.

The casual feminine preset uses white tennis sneakers with a subtle green heel tab across its base art and all four emotional animations.

Editable source sheets, transparent strips, and extracted frames live in `assets/companions-source/<preset>/` so they are not shipped with the web app. Each state is exported as a six-frame ping-pong loop in a stable `256x256` stage. Run `scripts/build_companion_animations.py` after changing a transparent pose strip. The builder validates that four separated poses exist and rejects loops without meaningful adjacent pose changes.

The app uses WebP with an asset-version query string to avoid stale browser caching during beta testing.
