include ../common.mk

.PHONY: clean
clean:
	rm -f common/web/templates/index.html
	rm -rf common/web/static
	rm -f common/web/csp-hashes.json

# `uv run --project ..` resolves the repo-root project env from uv.lock, so this runs
# on the locked deps without a venv being activated first. --frozen stops it silently
# re-locking in CI if pyproject and uv.lock have drifted apart.
.PHONY: unit-test
unit-test:
	PYTHONWARNINGS=ignore:ResourceWarning uv run --project .. --frozen coverage run \
		--source=app,common,compute,dataset \
		--omit=.coverage,venv \
		-m unittest discover \
		--start-directory tests/unit \
		--top-level-directory .. \
		--verbose; test_result=$$?; \
	exit $$test_result \


.PHONY: e2e
e2e:
	python -m unittest discover \
	--start-directory tests/e2e \
	--top-level-directory .. \
	--verbose; test_result=$$?; \
