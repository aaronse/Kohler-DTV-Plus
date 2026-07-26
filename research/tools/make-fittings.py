"""
Turn the controller's fitting icons into a light-theme set for the web UI.

The controller ships white-on-black art, because its own settings page is dark.
The K-99693 screen is light, so each icon is rebuilt as black ink on
transparency with alpha taken from the source luminance.

Two wrinkles the naive conversion gets wrong:

1. The source art has a soft white glow around every outline. Read as black ink
   on white that glow becomes a grey smudge, so anything below GLOW_FLOOR is
   cut and the remainder is rescaled.

2. Brightness is how the controller encodes selection, but not consistently
   across types — the Real Rain "unselected" art is mid-blue while a plain
   fitting's "unselected" art is dim grey, so converting straight through leaves
   Real Rain looking permanently selected. Alpha is therefore normalised per
   image and then scaled by state, which makes every fitting agree: grey when
   unselected, solid black when selected.

Output is 3x (270x180) so the ~108px on-screen icons stay crisp on retina.

    python research/tools/make-fittings.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "research" / "controller-mirror" / "images" / "outlets"
DST = ROOT / "app" / "public" / "fittings"

SCALE = 3
GLOW_FLOOR = 45  # luminance below this is halo, not ink
STATE_ALPHA = {"off": 0.42, "on": 1.0}

# Ink colour per UI theme. Alpha carries the shape either way, so the only
# difference is what colour fills it.
THEME_INK = {"light": (0, 0, 0), "dark": (255, 255, 255)}

# Real Rain is the one pair with its own filenames, and the only coloured art.
SPECIAL = {23: ("rr_sm_highlighted.png", "rr_sm_active.png")}


def alpha_mask(src: Path, state: str) -> np.ndarray:
    """Shape of the icon as 0-1 coverage, glow removed, normalised per image."""
    rgba = np.asarray(Image.open(src).convert("RGBA")).astype(np.float64)
    r, g, b, a = rgba[..., 0], rgba[..., 1], rgba[..., 2], rgba[..., 3]

    lum = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255.0)

    ink = np.clip((lum - GLOW_FLOOR) / (255.0 - GLOW_FLOOR), 0.0, 1.0)
    peak = ink.max()
    if peak > 0:
        ink /= peak  # normalise so every type reaches full strength
    return ink * STATE_ALPHA[state]


def write(mask: np.ndarray, dst: Path, theme: str) -> None:
    h, w = mask.shape
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = THEME_INK[theme]
    out[..., 3] = np.rint(mask * 255).astype(np.uint8)
    Image.fromarray(out, "RGBA").resize((w * SCALE, h * SCALE), Image.LANCZOS).save(dst)


def main() -> None:
    made = 0
    for theme in THEME_INK:
        (DST / theme).mkdir(parents=True, exist_ok=True)

    for type_id in range(1, 24):
        off_name, on_name = SPECIAL.get(type_id, (f"{type_id}_off.png", f"{type_id}_on.png"))
        for state, name in (("off", off_name), ("on", on_name)):
            src = SRC / name
            if not src.exists():
                print(f"  missing {src.name}")
                continue
            mask = alpha_mask(src, state)
            for theme in THEME_INK:
                write(mask, DST / theme / f"{type_id}_{state}.png", theme)
                made += 1
    print(f"wrote {made} fitting icons to {DST}")


if __name__ == "__main__":
    main()
