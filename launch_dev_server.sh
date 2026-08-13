#!/usr/bin/env bash
set -e

client_port=${CXG_CLIENT_PORT:-`jq -r '.CXG_CLIENT_PORT' environment.default.json`}
echo -n "localhost:${client_port}/" > .test_base_url.txt

PROJECT_ROOT=$(git rev-parse --show-toplevel)

export PYTHONPATH=${PROJECT_ROOT}  # permits module discovery when run from somewhere other than top level dir

cd "${PROJECT_ROOT}"

# Prefer the uv-managed venv (see `make dev-env-server`) so the server always runs on
# its pinned deps rather than whatever interpreter happens to be active. Falls back to
# `python` if the venv is absent or one is already activated.
PYTHON_BIN="python"
if [ -z "${VIRTUAL_ENV}" ] && [ -x "${PROJECT_ROOT}/.venv/bin/python" ]; then
  PYTHON_BIN="${PROJECT_ROOT}/.venv/bin/python"
fi

PROJECT_ROOT=${PROJECT_ROOT} "${PYTHON_BIN}" -m server.cli.launch -d $@
