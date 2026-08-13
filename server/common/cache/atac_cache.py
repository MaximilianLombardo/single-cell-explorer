import json
import logging
from functools import lru_cache

from server.common.utils.data_locator import DataLocator

GENE_DATA_CACHE = {}

CYTOBAND_DATA_CACHE = {}


def _preload(cache: dict, atac_base_uri: str, prefix: str, genome_versions) -> None:
    """Load <prefix>_<version>.json for each genome version into `cache`.

    A missing genome is logged and skipped rather than fatal: a self-hosted
    deployment serving only human data has no reason to ship a mouse reference,
    and previously any missing file took down server startup entirely. Requests
    for a genome that did not load fail individually, in get_atac_gene_info.
    """
    for version in genome_versions:
        uri = f"{atac_base_uri}/{prefix}_{version}.json"
        try:
            with DataLocator(uri).open("r") as f:
                cache[version] = json.load(f)
        except Exception as e:
            logging.warning(f"ATAC reference {prefix} for {version} unavailable at {uri}: {e}")

    if not cache:
        logging.warning(
            f"No ATAC {prefix} reference loaded from {atac_base_uri}; the chromatin viewer "
            "will be unavailable. Set ATAC_BASE_URI, or build the files with "
            "scripts/atac_reference/build_atac_reference.py."
        )


@lru_cache(maxsize=2)
def preload_gene_data(atac_base_uri: str, genome_versions=("hg38", "mm39")):
    _preload(GENE_DATA_CACHE, atac_base_uri, "gene_data", genome_versions)


@lru_cache(maxsize=2)
def preload_cytoband_data(atac_base_uri: str, genome_versions=("hg38", "mm39")):
    _preload(CYTOBAND_DATA_CACHE, atac_base_uri, "cytoband", genome_versions)
