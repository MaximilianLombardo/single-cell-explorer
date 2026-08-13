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

The converter has **its own uv-managed venv**, separate from the server's. That is
deliberate: it depends on `cellxgene-schema`, which requires `anndata>=0.11`, while
`server/requirements.txt` pins `anndata==0.10.9`. Keeping them apart avoids a resolver
fight over a tool that only runs at build time.

```bash
make dev-env-converter          # creates scripts/h5ad_to_cxg/.venv via uv

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

No ontology term IDs are required. Arbitrary `obs` columns — including annotations from
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
