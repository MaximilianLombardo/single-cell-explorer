# h5ad → CXG converter (vendored)

Explorer serves datasets in **CXG** (a TileDB-backed format), not `.h5ad`. This directory
vendors CZI's converter so you can produce a CXG from your own AnnData file without
standing up the whole Discover ingestion pipeline.

## Why vendored

The converter lives in [`chanzuckerberg/single-cell-data-portal`][portal], under
`backend/layers/processing/`. It is not published to PyPI and imports a handful of
sibling modules from that repo, so it cannot be installed standalone. The 17 modules in
`backend/` here are copied verbatim from that repo's `main`, with two exceptions noted
below.

[portal]: https://github.com/chanzuckerberg/single-cell-data-portal

## Usage

The converter is **its own uv project** (`scripts/h5ad_to_cxg/pyproject.toml` +
`uv.lock`), separate from the server's. That is
deliberate: it depends on `cellxgene-schema`, which requires `anndata>=0.11`, while
the server pins `anndata==0.10.9` in the root `pyproject.toml`. Keeping them apart avoids a resolver
fight over a tool that only runs at build time.

```bash
make dev-env-converter          # uv sync --project scripts/h5ad_to_cxg

scripts/h5ad_to_cxg/.venv/bin/python scripts/h5ad_to_cxg/convert.py \
    input.h5ad output.cxg -v

# if your pipeline's h5ad has no uns['schema_version'] / uns['title']:
scripts/h5ad_to_cxg/.venv/bin/python scripts/h5ad_to_cxg/convert.py \
    input.h5ad output.cxg --fill-missing-uns -v
```

Then serve it:

```bash
./launch_dev_server.sh /path/to/directory-containing-the-cxg/
```

## What the converter requires of your h5ad

Much less than the Discover *submission* process does. The converter does **not** run
cellxgene-schema's ontology validator — it only borrows two utility functions from that
package (`read_h5ad`, `get_matrix_format`).

| Requirement | Where enforced | Notes |
|---|---|---|
| `uns["schema_version"]` | `get_corpora_properties()` | **required**; raises `KeyError` if absent |
| `uns["title"]` | `get_corpora_properties()` | **required**; raises `KeyError` if absent |
| unique `var` index | `validate_anndata()` | **required** |
| unique `obs` index | `validate_anndata()` | **required** |
| `uns["batch_condition"]` | optional | must be list-like if present |
| `uns["default_embedding"]` | optional | which `obsm` key Explorer opens with |
| `uns["X_approximate_distribution"]` | optional | |

No ontology term IDs are required.

### How pipeline annotations come through

Verified against a synthetic pipeline-style h5ad (`obs` categoricals of str, bool, int
and float dtype, plus a plain float column, and no `uns` at all):

| obs column dtype | CXG result |
|---|---|
| categorical of `str` | `categorical`, categories preserved |
| categorical of `bool` | `categorical`, **stringified** to `['False','True']` |
| categorical of `int` / `float` | `categorical`, **no `categories` list in the schema** |
| plain `float32` | `float32`, shown under Continuous |

The int/float case looks alarming in the schema (`categories: null` from `/schema`)
but works: Explorer derives the labels from the data at runtime. A synthetic
`leiden_cluster` of 8 integer clusters rendered labels 0-7 with counts summing exactly
to the cell total.

Practical upshot: arbitrary `obs` columns from your own pipeline pass straight through
and appear under "Author Categories". Nothing needs stringifying by hand. Arbitrary `obs` columns — including annotations from
your own pipeline — pass through and become categorical/continuous fields in Explorer.

`--fill-missing-uns` synthesises the two required keys into a temp copy of your file, so
a pipeline output needs no manual preparation.

## Local patches

Two changes from upstream, both marked with `# VENDOR PATCH` comments in
`backend/layers/processing/utils/cxg_generation_utils.py`:

1. `ATACDataProcessor` (needs `pysam`) and `SpatialDataProcessor` (needs `pyvips`, `PIL`,
   `boto3`) are imported **lazily**, inside the two functions that use them. Upstream
   imports both at module scope, which forces those heavy dependencies on every
   conversion — including plain scRNA datasets that touch neither code path.
2. `convert_uns_to_cxg_group` constructs `SpatialDataProcessor` lazily, only when the
   `uns` actually contains spatial data, for the same reason.

Neither patch changes conversion output. If you need ATAC or spatial support, install
`pysam` / `pyvips` and the lazy imports resolve normally.

## Updating

Re-run `fetch_deps.py` (in the session scratchpad) against upstream `main`, then re-apply
the two patches above.
