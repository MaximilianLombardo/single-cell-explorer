# Spatial Deep Zoom tiles

Explorer renders spatial datasets with OpenSeadragon over a Deep Zoom (DZI) pyramid.
This generates that pyramid locally so it can be served from our own origin.

## The problem this solves

Upstream splits the work in a way that only functions inside CZI:

- the converter builds tiles with `pyvips.dzsave` and then **uploads them to a
  CZI-owned S3 bucket** (`SpatialDataProcessor._upload_assets`) — they are *not*
  written into the `.cxg`;
- the client requested them from a **hardcoded** `cellxgene.cziscience.com`
  (or `cellxgene.staging.single-cell.czi.technology`) URL.

Neither is reachable for a self-hoster, so the `.dzi` fetch failed,
`isDeepZoomSourceValid` flipped to false, and the viewer silently fell back to the
low-resolution image embedded in the CXG's `uns['spatial']`. Easy to miss, because
*something* still rendered — just far blurrier than intended.

CZI's own example is not served either:

```
https://cellxgene.staging.single-cell.czi.technology/spatial-deep-zoom/super-cool-spatial/  →  404
```

## What changed

- `client/src/components/Graph/util.ts` now builds a **same-origin** path,
  `/spatial-deep-zoom/<id>/`, instead of a CZI hostname.
- The Flask server serves that path from `SPATIAL_DEEP_ZOOM_DIR` when it is set.
- The dev server (`client/server/development.js`) serves the same directory, because
  in development the client and API sit on different ports.
- This script builds the pyramid from the image already inside the CXG, so no S3 and
  no `pyvips`/libvips are needed — it uses Pillow.

If no assets are generated, the original fallback still applies. Nothing breaks.

## Usage

```bash
uv run python scripts/spatial_deep_zoom/build_deep_zoom.py \
    example-dataset/super-cool-spatial.cxg --out ./deep-zoom

SPATIAL_DEEP_ZOOM_DIR=$PWD/deep-zoom ./launch_dev_server.sh example-dataset/
# and for the hot-reloading client:
SPATIAL_DEEP_ZOOM_DIR=$PWD/deep-zoom make -C client start-frontend
```

Output layout, matching what the client requests:

```
<out>/<dataset>/spatial.dzi
<out>/<dataset>/spatial_files/<level>/<col>_<row>.jpeg
```

`<dataset>` must match `getDatasetVersionId()` in `Graph/util.ts` — the last path
segment with `.cxg` stripped. The script derives it that way by default; override
with `--name`.

Verified on `super-cool-spatial.cxg`: 1955×2000, 12 levels, 93 tiles, 1.2 MB, and 92
tile requests served at 200 from our own origin.

## Resolution ceiling

The pyramid can only be as detailed as the source. Upstream generated tiles during
conversion, when the *original* full-resolution image was still in hand; we generate
from what survived into the CXG, which for these datasets is `images['hires']` —
`uns['spatial'][*]['images']['fullres']` is an empty list.

That is a real improvement over the fallback but not the full-resolution original. To
match upstream exactly, generate tiles at conversion time from the source h5ad, before
the image is downsampled — the script takes any `.cxg`, so the cleaner long-term fix
is to teach the converter to write here instead of uploading to S3.
