#!/usr/bin/env python3
"""
Convert an .h5ad file into a CXG directory that Explorer can serve.

This drives the vendored CZI converter (see README.md for provenance).

Usage:
    python scripts/h5ad_to_cxg/convert.py INPUT.h5ad OUTPUT.cxg
    python scripts/h5ad_to_cxg/convert.py INPUT.h5ad OUTPUT.cxg --sparse-threshold 25.0

The only hard requirements on the input are two `uns` keys, `schema_version` and
`title`. Pass --fill-missing-uns to have them synthesised if absent, which is the
normal case for a dataset coming out of your own pipeline rather than Discover.
"""
import argparse
import logging
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

DEFAULT_SCHEMA_VERSION = "3.0.0"


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("input", help="path to input .h5ad")
    p.add_argument("output", help="path to output .cxg directory (must not exist)")
    p.add_argument("--sparse-threshold", type=float, default=25.0,
                   help="percent density below which X is stored sparse (CZI prod uses 25.0)")
    p.add_argument("--var-index-column-name", default=None,
                   help="var column to use as the gene index (default: the var index)")
    p.add_argument("--title", default=None, help="dataset title (default: filename)")
    p.add_argument("--fill-missing-uns", action="store_true",
                   help="write schema_version/title into uns if absent (writes a temp copy)")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="[%(asctime)s] %(message)s", datefmt="%H:%M:%S")

    if not os.path.exists(args.input):
        print(f"error: input not found: {args.input}", file=sys.stderr)
        return 1
    if os.path.exists(args.output):
        print(f"error: output already exists: {args.output}", file=sys.stderr)
        return 1

    src = args.input
    tmp = None
    if args.fill_missing_uns:
        src, tmp = _ensure_uns(args.input, args.title)

    from backend.layers.processing.h5ad_data_file import H5ADDataFile

    t0 = time.time()
    try:
        h5ad = H5ADDataFile(src, var_index_column_name=args.var_index_column_name)
        print(f"read {os.path.basename(args.input)}: "
              f"{h5ad.anndata.n_obs:,} obs x {h5ad.anndata.n_vars:,} var  "
              f"title={h5ad.dataset_title!r}")
        h5ad.to_cxg(
            output_cxg_directory=args.output,
            sparse_threshold=args.sparse_threshold,
            dataset_version_id="local",
        )
    finally:
        if tmp and os.path.exists(tmp):
            # remove the temp copy and the directory created to hold it
            os.unlink(tmp)
            os.rmdir(os.path.dirname(tmp))

    size = sum(os.path.getsize(os.path.join(r, f))
               for r, _, fs in os.walk(args.output) for f in fs)
    print(f"wrote {args.output}  ({size/1e9:.2f} GB) in {time.time()-t0:.1f}s")
    return 0


def _ensure_uns(input_path, title):
    """Copy the h5ad with schema_version/title populated, if they're missing."""
    import anndata
    import tempfile

    adata = anndata.read_h5ad(input_path, backed="r")
    missing = [k for k in ("schema_version", "title") if k not in adata.uns]
    if not missing:
        adata.file.close()
        return input_path, None

    print(f"uns missing {missing}; writing a temp copy with them populated")
    adata = anndata.read_h5ad(input_path)
    if "schema_version" not in adata.uns:
        adata.uns["schema_version"] = DEFAULT_SCHEMA_VERSION
    if "title" not in adata.uns:
        adata.uns["title"] = title or os.path.splitext(os.path.basename(input_path))[0]

    # H5ADDataFile derives dataset_title from the INPUT FILENAME, not from uns["title"]
    # (extract_metadata_about_dataset never reads it back off corpora_properties). So
    # the temp copy has to keep the original basename, or the dataset ends up titled
    # something like "tmpv3k9x1qa" in Explorer.
    tmpdir = tempfile.mkdtemp(prefix="h5ad_to_cxg_")
    tmp = os.path.join(tmpdir, os.path.basename(input_path))
    adata.write_h5ad(tmp)
    return tmp, tmp


if __name__ == "__main__":
    sys.exit(main())
