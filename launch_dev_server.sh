#!/usr/bin/env bash
set -e

client_port=${CXG_CLIENT_PORT:-`jq -r '.CXG_CLIENT_PORT' environment.default.json`}
echo -n "localhost:${client_port}/" > .test_base_url.txt

PROJECT_ROOT=$(git rev-parse --show-toplevel)

export PYTHONPATH=${PROJECT_ROOT}  # permits module discovery when run from somewhere other than top level dir

cd "${PROJECT_ROOT}"

# `uv run` resolves the project environment from uv.lock, so the server always runs on
# its pinned deps rather than whatever interpreter happens to be active. It also syncs
# the venv first if it is missing or stale. Fall back to plain `python` where uv is not
# installed, so this still works in a container that installed deps some other way.
if command -v uv >/dev/null 2>&1; then
  PROJECT_ROOT=${PROJECT_ROOT} exec uv run --frozen python -m server.cli.launch -d "$@"
else
  PROJECT_ROOT=${PROJECT_ROOT} exec python -m server.cli.launch -d "$@"
fi
