# CLAUDE.md

A fork of CZ CELLxGENE Explorer, being adapted to self-host our own annotated
datasets. **We no longer track upstream** — `chanzuckerberg/single-cell-explorer`
`main` has not moved since 2026-03, and this fork has diverged deliberately
(uv-managed dependencies, CZI infrastructure removed).

This file covers the things that are not obvious from the code and that have already
cost time. Subsystem detail lives in the READMEs linked at the bottom — prefer
updating those over growing this file.

## Running it

```bash
# once
make dev-env-server        # uv sync --group dev            -> ./.venv
make dev-env-converter     # uv sync --project scripts/...  -> scripts/h5ad_to_cxg/.venv
export PUPPETEER_SKIP_DOWNLOAD=true   # required on arm64; puppeteer's chromium fails
make dev-env-client        # npm ci
make build-for-server-dev

# API server on :5005
./launch_dev_server.sh <dir of .cxg datasets>/

# hot-reloading client on :3000  ->  http://localhost:3000/d/<dataset>.cxg/
cd client && CXG_SERVER_PORT=5005 make start-frontend
```

Optional, to enable features that would otherwise silently degrade:

| variable | effect |
|---|---|
| `ATAC_BASE_URI=<dir>` | serve the ATAC gene/cytoband reference locally; without it the chromatin viewer is unavailable and startup logs a warning naming the fix |
| `SPATIAL_DEEP_ZOOM_DIR=<dir>` | serve spatial Deep Zoom tiles; set on **both** servers in dev |
| `SKIP_ATAC_CACHE=1` | skip the ATAC preload entirely. Upstream needed this to boot at all outside CZI; we made the preload tolerant, so it is now only a way to save a few seconds of failed S3 lookups. |

## Traps

**Rebuilding the client without `CXG_SERVER_PORT` breaks the app.** `client/index.html`
bakes the API prefix in at build time. Rebuild without it and the prefix becomes
`http://localhost/` with no port; the app loads and then dies with "error loading
cellxgene". Always `CXG_SERVER_PORT=5005 npm run build -- <config>`.

**Two server unit tests fail on a dev machine, and they are not real.** The config
validator binds real ports during unit tests, so anything already listening on 5001 or
5005 — including our own dev server — makes `test_get_web_base_url_works` or
`test_changes_from_default_...` fail. They pass in CI. Check `lsof -i:5001,5005`
before investigating.

**The REST API is not addressed the way it looks.** `/d/<dataset>.cxg/api/v0.3/`
exposes only `s3_uri` and `dataset-metadata`. Everything else hangs off a
**double-URL-encoded** S3 URI, and the double encoding is deliberate — Flask's WSGI
layer decodes slashes too early otherwise:

```bash
S3=$(curl -s "localhost:5005/d/pbmc3k.cxg/api/v0.3/s3_uri")     # -> "example-dataset/pbmc3k.cxg"
# then: localhost:5005/s3_uri/<encodeURIComponent(encodeURIComponent(S3))>/api/v0.3/schema
```

`client/src/annoMatrix/loader.ts` and `globals.ts` (`updateAPIWithS3`) do this in the
client. Documented nowhere upstream.

## Environments

Two **separate** uv projects, deliberately — the converter needs `cellxgene-schema`
(anndata>=0.11) while the server pins `anndata==0.10.9`, and both must be usable at
once:

| project | env | for |
|---|---|---|
| repo root | `.venv` | the server |
| `scripts/h5ad_to_cxg` | `scripts/h5ad_to_cxg/.venv` | the h5ad→CXG converter |

`uv sync` removes packages that should not be there, which `pip install -r` cannot.
`make check-locks` fails if a `pyproject.toml` and its lock have drifted.

## Tests and CI

```bash
cd client && npm run test    # 247 unit tests, ~20s, no browser launched
make unit-test-server        # 234 tests
make unit-test-client        # same as npm run test
```

Client unit tests run as the **`unit` Playwright project** — they use the
`@playwright/test` API but touch no browser fixture. They were unreachable for years
(jest removed, no project matched them); if you add tests, make sure they still match.

`push_tests.yml` runs lint + both suites on every branch and PR. Most other workflows
are disabled — see `.github/workflows/README.md`, and note that jobs pinned to
`runs-on: ARM64` **queue forever** rather than failing.

## Do not refactor

`client/src/annoMatrix/`, `client/src/util/typedCrossfilter/`,
`client/src/util/dataframe/`, `client/src/components/Graph/`. This is the lazy-loading
data layer, the typed-array crossfilter, and the regl renderer — the performance
engineering that makes ~45 ms gene queries over 65k cells possible. It is stable, and
it is the only part with real test coverage. Wrap it; do not rewrite it.

## Styling

Four systems currently coexist: the SDS/MUI theme (`util/theme.ts`, `globals.ts`),
co-located `style.ts` files using emotion, legacy CSS modules, and inline
`style={{}}` in most `.tsx` files. **The target is `style.ts` + theme tokens** —
`components/MenuBar/style.ts` is the reference.

Two things to know before converting a directory: `style` and `className` land on
different DOM nodes for Blueprint/SDS composite components (check the component's
source before wrapping it), and inline styles win specificity fights that a single
emotion class loses. A bulk codemod is not safe.

There is **no visual regression coverage** — no component stories, and Chromatic needs
CZI's token. Parity currently rests on reading CSS and building successfully.

## Where things are documented

| | |
|---|---|
| `scripts/h5ad_to_cxg/README.md` | h5ad→CXG conversion; what an input h5ad must contain |
| `scripts/atac_reference/README.md` | building ATAC gene/cytoband reference from public sources |
| `scripts/spatial_deep_zoom/README.md` | spatial Deep Zoom tiles; the crop+flip the client assumes |
| `.github/workflows/README.md` | which workflows run, which are off, and why |
| `dev_docs/` | upstream's docs — accurate on CXG format and the REST API, stale on tooling |

## Remaining CZI dependencies

Deployment-time decisions, not blockers: CellGuide (`server/common/constants.py`),
`gene_info` and `data_locator` (`hosted/config.yaml`), the CORS allowlist
(`server/ecs/app.py`), and the NavBar links to Collections/Datasets/Census. Several
are features to decide against rather than reimplement. Both Dockerfiles now use the
public `ubuntu:22.04` base, but **neither image has ever been built**.
