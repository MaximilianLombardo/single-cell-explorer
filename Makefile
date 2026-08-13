include common.mk

BUILDDIR := build
CLIENTBUILD := $(BUILDDIR)/client
SERVERBUILD := $(BUILDDIR)/server
CLEANFILES :=  $(BUILDDIR)/ client/build build dist cellxgene.egg-info

PART ?= patch
PYTHON_VERSION ?= 3.11

# CLEANING COMMANDS

.PHONY: clean
clean: clean-lite clean-server clean-client

# cleaning the client's node_modules is the longest one, so we avoid that if possible
.PHONY: clean-lite
clean-lite:
	rm -rf $(CLEANFILES)

.PHONY: clean-client
clean-client:
	cd client && $(MAKE) clean

.PHONY: clean-server
clean-server:
	cd server && $(MAKE) clean

# BUILDING PACKAGE COMMANDS

.PHONY: build-client
build-client:
	cd client && $(MAKE) ci build

.PHONY: build-server
build-server: clean build-client
	git ls-files server/ | grep -v 'server/tests/' | cpio -pdm $(BUILDDIR)
	cp -r client/build/  $(CLIENTBUILD)
	$(call copy_client_assets,$(CLIENTBUILD),$(SERVERBUILD))
	cp -r server/common $(BUILDDIR)/server/common
	cp server/__init__.py $(BUILDDIR)
	cp server/__init__.py $(BUILDDIR)/server
	cp MANIFEST.in README.md setup.cfg $(BUILDDIR)

# If you are actively developing in the server folder use this, dirties the source tree
.PHONY: build-for-server-dev
build-for-server-dev: clean-server build-client
	$(call copy_client_assets,client/build,server)

.PHONY: copy-client-assets-server
copy-client-assets-server:
	$(call copy_client_assets,client/build,server)

.PHONY: test-server
test-server: unit-test-server smoke-test

.PHONY: unit-test-client
unit-test-client:
	cd client && $(MAKE) unit-test

.PHONY: unit-test-server
unit-test-server:
	cd server && $(MAKE) unit-test

.PHONY: smoke-test
smoke-test:
	cd client && $(MAKE) smoke-test

.PHONY: data-persistence-smoke-tests
data-persistence-smoke-tests:
	cd client && $(MAKE) data-persistence-smoke-tests

# LINTING AND FORMATTING COMMANDS

.PHONY: fmt
fmt: fmt-client fmt-server

.PHONY: fmt-client
fmt-client:
	cd client && $(MAKE) fmt

.PHONY: fmt-server
fmt-server:
	black server --exclude server/common/fbs/NetEncoding/ --extend-exclude "server/tests/"

.PHONY: lint
lint: lint-server lint-client

.PHONY: lint-server
lint-server:
	mypy --config-file pyproject.toml
	black server --check --exclude "server/tests/" --extend-exclude "server/common/fbs/NetEncoding/"
	flake8 server --exclude server/tests/,server/common/fbs/NetEncoding/

.PHONY: lint-client
lint-client:
	cd client && $(MAKE) lint

check:
	pre-commit run -a && mypy --config-file pyproject.toml

# DEPENDENCY PACKAGE INSTALLATION COMMANDS

.PHONY: dev-env
dev-env: dev-env-client dev-env-server

.PHONY: dev-env-client
dev-env-client:
	cd client && $(MAKE) ci


# Server deps live in a uv-managed venv at ./.venv so they stay isolated from
# whatever interpreter happens to be active. Run commands with `.venv/bin/python`,
# or `source .venv/bin/activate` first.
.PHONY: dev-env-server
dev-env-server:
	uv venv --python $(PYTHON_VERSION) .venv
	uv pip install --python .venv -r server/requirements-dev.txt

# The h5ad -> CXG converter needs its own env: it depends on cellxgene-schema, which
# requires anndata>=0.11, while the server pins anndata==0.10.9.
.PHONY: dev-env-converter
dev-env-converter:
	uv venv --python $(PYTHON_VERSION) scripts/h5ad_to_cxg/.venv
	uv pip install --python scripts/h5ad_to_cxg/.venv -r scripts/h5ad_to_cxg/requirements.txt

# quicker than re-building client
.PHONY: gen-package-lock
gen-package-lock:
	cd client && $(MAKE) install

.PHONY: start-backend
start-backend:
	cd client && $(MAKE) start-backend

.PHONY: start-backend-user-data
start-backend-user-data:
	cd client && $(MAKE) start-backend-user-data

.PHONY: start-frontend
start-frontend:
	cd client && $(MAKE) start-frontend
