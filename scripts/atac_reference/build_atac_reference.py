#!/usr/bin/env python3
"""
Build the genome reference files the ATAC chromatin viewer needs, from public sources.

Explorer's ATAC coverage endpoints require two JSON files per genome version:

    gene_data_<version>.json   {geneName: {geneName, geneChromosome, geneStart,
                                           geneEnd, geneStrand}}
    cytoband_<version>.json    {chr: [{start, end, name, stain}, ...]}

CZI serves these from s3://atac-static-{staging,prod}, which is not readable outside
CZI (403). This script regenerates them from GENCODE (gene models) and UCSC (cytobands)
so a self-hosted Explorer can serve ATAC datasets.

Usage:
    python scripts/atac_reference/build_atac_reference.py --out ./atac-reference
    python scripts/atac_reference/build_atac_reference.py --out ./atac-reference --genome hg38

Then point the server at the output:
    ATAC_BASE_URI=/abs/path/to/atac-reference ./launch_dev_server.sh <datasets>/
"""
import argparse
import gzip
import io
import json
import os
import sys
import urllib.request

# GENCODE "basic" annotation keeps one representative transcript set -- enough for
# gene-model rendering and far smaller than the comprehensive release.
GENOMES = {
    "hg38": {
        "gencode": "https://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_44/gencode.v44.basic.annotation.gtf.gz",
        # hgdownload.soe.ucsc.edu is frequently unresolvable; hgdownload2 is the mirror.
        "cytoband": "https://hgdownload2.soe.ucsc.edu/goldenPath/hg38/database/cytoBand.txt.gz",
    },
    "mm39": {
        "gencode": "https://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M33/gencode.vM33.basic.annotation.gtf.gz",
        "cytoband": "https://hgdownload2.soe.ucsc.edu/goldenPath/mm39/database/cytoBandIdeo.txt.gz",
    },
}


def log(msg):
    print(msg, flush=True)


def fetch(url):
    log(f"    GET {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "cellxgene-explorer-atac-reference"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()


def build_gene_data(url):
    """Parse a GENCODE GTF into {geneName: {...}}, keeping only `gene` features.

    Where a symbol appears more than once (PAR regions on chrX/chrY, or the same
    symbol on multiple scaffolds), keep the longest span -- that is the locus a
    coverage browser should default to.
    """
    raw = fetch(url)
    genes = {}
    dupes = 0
    with gzip.open(io.BytesIO(raw), "rt") as fh:
        for line in fh:
            if line.startswith("#"):
                continue
            f = line.rstrip("\n").split("\t")
            if len(f) < 9 or f[2] != "gene":
                continue
            chrom, start, end, strand, attrs = f[0], int(f[3]), int(f[4]), f[6], f[8]

            name = None
            for part in attrs.split(";"):
                part = part.strip()
                if part.startswith("gene_name "):
                    name = part[len("gene_name "):].strip('"')
                    break
            if not name:
                continue

            prev = genes.get(name)
            if prev is not None:
                dupes += 1
                if (prev["geneEnd"] - prev["geneStart"]) >= (end - start):
                    continue

            genes[name] = {
                "geneName": name,
                "geneChromosome": chrom,
                # GTF is 1-based inclusive; the viewer works in 0-based half-open
                # coordinates, matching the cytoband track from UCSC.
                "geneStart": start - 1,
                "geneEnd": end,
                "geneStrand": strand,
            }
    log(f"    {len(genes):,} genes ({dupes:,} duplicate symbols collapsed to longest span)")
    return genes


def build_cytobands(url):
    """Parse UCSC cytoBand.txt into {chr: [{start, end, name, stain}, ...]}."""
    raw = fetch(url)
    bands = {}
    with gzip.open(io.BytesIO(raw), "rt") as fh:
        for line in fh:
            f = line.rstrip("\n").split("\t")
            if len(f) < 5:
                continue
            chrom, start, end, name, stain = f[0], int(f[1]), int(f[2]), f[3], f[4]
            bands.setdefault(chrom, []).append(
                {"start": start, "end": end, "name": name, "stain": stain}
            )
    for chrom in bands:
        bands[chrom].sort(key=lambda b: b["start"])
    total = sum(len(v) for v in bands.values())
    log(f"    {total:,} bands across {len(bands):,} chromosomes")
    return bands


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--out", required=True, help="output directory")
    p.add_argument("--genome", action="append", choices=sorted(GENOMES),
                   help="genome version (repeatable; default: all)")
    args = p.parse_args()

    genomes = args.genome or sorted(GENOMES)
    os.makedirs(args.out, exist_ok=True)

    for g in genomes:
        src = GENOMES[g]
        log(f"[{g}] gene models")
        gene_path = os.path.join(args.out, f"gene_data_{g}.json")
        with open(gene_path, "w") as fh:
            json.dump(build_gene_data(src["gencode"]), fh)

        log(f"[{g}] cytobands")
        band_path = os.path.join(args.out, f"cytoband_{g}.json")
        with open(band_path, "w") as fh:
            json.dump(build_cytobands(src["cytoband"]), fh)

        for path in (gene_path, band_path):
            log(f"    wrote {path} ({os.path.getsize(path)/1e6:.1f} MB)")

    log(f"\nDone. Serve with:  ATAC_BASE_URI={os.path.abspath(args.out)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
