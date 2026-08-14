#!/usr/bin/env python3
"""
Generate Deep Zoom (DZI) tiles for a spatial CXG so they can be served locally.

Upstream, the converter generates these with pyvips `dzsave` and then UPLOADS them to
a CZI-owned S3 bucket; the client fetches them from a hardcoded
`https://cellxgene.cziscience.com/spatial-deep-zoom/<id>/` URL. Neither is reachable
for a self-hoster, so deep zoom silently degrades to the low-resolution base image
embedded in the CXG's `uns['spatial']`.

This reads that same embedded image and writes a DZI pyramid to a local directory
laid out to match the URL the client requests:

    <out>/<dataset>/spatial.dzi
    <out>/<dataset>/spatial_files/<level>/<col>_<row>.jpeg

Point the server at <out> with SPATIAL_DEEP_ZOOM_DIR and the client resolves tiles
from the same origin.

Usage:
    python scripts/spatial_deep_zoom/build_deep_zoom.py DATASET.cxg --out ./deep-zoom
"""
import argparse
import math
import os
import pickle
import sys
import xml.etree.ElementTree as ET

import numpy as np
import tiledb
from PIL import Image

# pyvips dzsave defaults, which is what upstream produced and what the client's
# viewer was configured against.
TILE_SIZE = 254
OVERLAP = 1
FORMAT = "jpeg"
DZI_NS = "http://schemas.microsoft.com/deepzoom/2008"


def load_spatial_image(cxg_path):
    """Pull the highest-resolution image available out of uns['spatial']."""
    uns = tiledb.open(os.path.join(cxg_path, "uns"), "r")
    if "spatial" not in uns.meta:
        raise SystemExit(f"{cxg_path} has no uns['spatial'] -- not a spatial dataset?")
    raw = uns.meta["spatial"]
    try:
        blob = pickle.loads(raw)
    except Exception:
        import json

        blob = json.loads(raw)

    for library_id, content in blob.items():
        if not isinstance(content, dict) or "images" in content is None:
            continue
        images = content.get("images") or {}
        # fullres when present, else hires; upstream usually ships only hires
        for key in ("fullres", "hires", "lowres"):
            arr = images.get(key)
            if arr is None or (hasattr(arr, "__len__") and len(arr) == 0):
                continue
            arr = np.asarray(arr)
            if arr.ndim == 3:
                print(f"  library {library_id!r}: using images[{key!r}] {arr.shape} {arr.dtype}")
                return arr
    raise SystemExit("no usable image array found under uns['spatial'][*]['images']")


def to_uint8_image(arr):
    """Normalise float or uint arrays to an 8-bit RGB PIL image."""
    if arr.dtype != np.uint8:
        lo, hi = float(np.nanmin(arr)), float(np.nanmax(arr))
        # float images are conventionally 0-1, but do not assume it
        scale = 255.0 if hi <= 1.0 + 1e-6 else (255.0 / (hi - lo) if hi > lo else 1.0)
        offset = 0.0 if hi <= 1.0 + 1e-6 else lo
        arr = np.clip((arr - offset) * scale, 0, 255).astype(np.uint8)
    if arr.shape[2] == 4:
        arr = arr[:, :, :3]
    return Image.fromarray(arr, mode="RGB")


def write_dzi(img, out_dir, basename="spatial"):
    """Write a DZI descriptor plus the tile pyramid for `img`."""
    width, height = img.size
    max_level = math.ceil(math.log2(max(width, height)))

    root = ET.Element(
        f"{{{DZI_NS}}}Image",
        {"TileSize": str(TILE_SIZE), "Overlap": str(OVERLAP), "Format": FORMAT},
    )
    ET.SubElement(root, f"{{{DZI_NS}}}Size", {"Width": str(width), "Height": str(height)})
    ET.ElementTree(root).write(os.path.join(out_dir, f"{basename}.dzi"), encoding="UTF-8", xml_declaration=True)

    files_dir = os.path.join(out_dir, f"{basename}_files")
    n_tiles = 0
    for level in range(max_level + 1):
        # level `max_level` is full size; each step down halves it
        scale = 2 ** (max_level - level)
        lw, lh = max(1, math.ceil(width / scale)), max(1, math.ceil(height / scale))
        level_img = img if scale == 1 else img.resize((lw, lh), Image.LANCZOS)

        level_dir = os.path.join(files_dir, str(level))
        os.makedirs(level_dir, exist_ok=True)

        for row in range(math.ceil(lh / TILE_SIZE)):
            for col in range(math.ceil(lw / TILE_SIZE)):
                # tiles carry OVERLAP extra pixels on every inward-facing edge
                x0 = max(0, col * TILE_SIZE - OVERLAP)
                y0 = max(0, row * TILE_SIZE - OVERLAP)
                x1 = min(lw, (col + 1) * TILE_SIZE + OVERLAP)
                y1 = min(lh, (row + 1) * TILE_SIZE + OVERLAP)
                level_img.crop((x0, y0, x1, y1)).save(os.path.join(level_dir, f"{col}_{row}.{FORMAT}"), quality=90)
                n_tiles += 1
    return width, height, max_level, n_tiles


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("cxg", help="path to a spatial .cxg directory")
    p.add_argument("--out", required=True, help="deep-zoom root directory")
    p.add_argument(
        "--name",
        default=None,
        help="dataset id used in the URL (default: the .cxg directory name without suffix)",
    )
    args = p.parse_args()

    cxg = args.cxg.rstrip("/")
    if not os.path.isdir(cxg):
        raise SystemExit(f"not a directory: {cxg}")

    # must match getDatasetVersionId() in client/src/components/Graph/util.ts,
    # which takes the last path segment and strips ".cxg"
    name = args.name or os.path.basename(cxg).split(".cxg")[0]
    out_dir = os.path.join(args.out, name)
    os.makedirs(out_dir, exist_ok=True)

    print(f"reading {cxg}")
    img = to_uint8_image(load_spatial_image(cxg))
    print(f"  image {img.size[0]}x{img.size[1]}")

    w, h, levels, n = write_dzi(img, out_dir)
    total = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(out_dir) for f in fs)
    print(f"wrote {out_dir}")
    print(f"  {w}x{h}, {levels + 1} levels, {n} tiles, {total / 1e6:.1f} MB")
    print(f"\nServe with:  SPATIAL_DEEP_ZOOM_DIR={os.path.abspath(args.out)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
