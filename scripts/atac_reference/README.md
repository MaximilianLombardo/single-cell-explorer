# ATAC genome reference files

Explorer's chromatin-accessibility viewer needs two JSON files per genome version:

```
gene_data_<version>.json    {geneName: {geneName, geneChromosome, geneStart, geneEnd, geneStrand}}
cytoband_<version>.json     {chr: [{start, end, name, stain}, ...]}
```

`gene_data` draws the gene-model track and resolves a gene symbol to a genomic
region; `cytoband` draws the chromosome ideogram above it. Note these are *reference
annotation only* — the actual per-cell-type coverage lives in the `coverage` TileDB
array inside each ATAC `.cxg`, so it is already local.

## Why this script exists

Upstream loads these from `s3://atac-static-{staging,prod}`, which is **not readable
outside CZI** (403). Before this change that was fatal twice over: the server refused
to start at all, and setting `SKIP_ATAC_CACHE=1` to get past it left the coverage
endpoint returning 500.

This script rebuilds both files from public sources:

| file | source |
|---|---|
| `gene_data_hg38` / `gene_data_mm39` | GENCODE basic annotation GTF (release 44 / M33) |
| `cytoband_hg38` / `cytoband_mm39` | UCSC `cytoBand` / `cytoBandIdeo` |

## Usage

```bash
.venv/bin/python scripts/atac_reference/build_atac_reference.py --out ./atac-reference

# single genome
.venv/bin/python scripts/atac_reference/build_atac_reference.py --out ./atac-reference --genome hg38
```

Then point the server at it — any `DataLocator` URI works, including a local path or
your own S3 bucket:

```bash
ATAC_BASE_URI=/abs/path/to/atac-reference ./launch_dev_server.sh <datasets>/
```

Leave `ATAC_BASE_URI` unset to keep the upstream `s3://atac-static-*` default.

Output is ~8 MB for hg38 (61,228 genes, 1,549 bands) and ~7 MB for mm39 (56,734 genes).

## Notes on the data

- GENCODE **basic** is used: one representative transcript set, much smaller than the
  comprehensive release and sufficient for gene-model rendering.
- GTF is 1-based inclusive; output is converted to 0-based half-open to match the UCSC
  cytoband track and the client's coordinate handling.
- Where a gene symbol appears more than once (PAR regions, scaffolds), the longest span
  is kept — that is the locus a coverage browser should default to. For hg38 this
  collapses 1,472 duplicate symbols.
- Gene spans are whole-gene, so they are wider than any single RefSeq transcript. For
  example GENCODE v44 spans `ACTB` as `chr7:5,526,408-5,563,902`, not the ~3.5 kb
  principal-transcript span. This is correct and matches what CZI's viewer shows.

## Genome versions

The client currently hardcodes `hg38` (see `GENOME_VERSION` in
`client/src/components/BottomPanel/components/Cytoband/Cytoband.tsx`, marked TODO
upstream). A missing genome is now a warning rather than a startup failure, so a
human-only deployment can build `hg38` alone.
