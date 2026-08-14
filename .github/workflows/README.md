# Workflow status on this fork

Most of the workflows here are CZI deployment infrastructure and cannot run outside
CZI. They were failing — or worse, hanging — on every push, which buries the signal
from the ones that matter. This documents what is on, what is off, and how to bring
each back.

## Running

| workflow | notes |
|---|---|
| `push_tests.yml` | **The one that matters.** lint, `unit-test` (server, 234 tests), `unit-test-client` (247 tests). Runs on every branch and PR. |
| `conventional-commits.yml` | Validates PR titles. Was pinned to `runs-on: ARM64`; moved to `ubuntu-latest` so it can actually run. Untested until a PR exists. |
| `close-stale-prs.yml` | Harmless; runs clean on a GitHub-hosted runner. |

## Disabled via the GitHub API

These had already registered (they had run at least once), so they were disabled
through the Actions API. **That state is not visible in this file tree** — check
Actions → the workflow → "Enable workflow" to reverse.

| workflow | why |
|---|---|
| `docker-build-rdev.yaml` | pushes to CZI-owned ECR; `startup_failure` on every push |
| `docker-build-staging-prod.yaml` | same |
| `e2e-tests.yml` | runs against a deployed CZI environment |
| `helm-dep-update.yaml` | calls a CZI reusable workflow with `secrets: inherit`; failed on its daily cron |
| `release-please.yaml` | `runs-on: [ARM64]` plus `GH_ACTIONS_HELPER_*` org secrets. Sat **queued for 8 hours** rather than failing. |

## Disabled by reducing the trigger to `workflow_dispatch`

GitHub only allows API-disabling a workflow that has already registered, so for these
— which had never fired — editing `on:` was the only way to stop them pre-emptively.
The original triggers are in git history.

These still show as **active** in the Actions UI, because committing them to the
default branch is what registers a workflow. That is expected: `workflow_dispatch`
means they only ever run if someone presses the button. They were left this way rather
than also API-disabled, so the reason is visible in the file instead of hidden in
repository settings.

| workflow | why |
|---|---|
| `argus-stack-prod-upsert{,-vcp}.yaml` | CZI self-hosted ARM64 runners, CZI AWS accounts |
| `argus-stack-rdev-create{,-vcp}.yaml` | same |
| `argus-stack-rdev-delete{,-vcp}.yaml` | same |
| `argus-stack-staging-upsert{,-vcp}.yaml` | same |
| `helm-lint-single-cell-explorer.yaml` | lints Argus charts targeting CZI-owned ECR |
| `helm-lint-vcp-explorer.yaml` | same |
| `scale-test.yml` | locust against CZI dev infrastructure |

## The ARM64 trap

Ten of these workflows specify `runs-on: ARM64` — a **self-hosted runner label**, not
a GitHub-hosted one. Without a matching runner a job does not fail, it **queues
forever**: no result, no notification, and `concurrency.cancel-in-progress` means each
new push silently cancels the last. That is why it went unnoticed until the workflow
list was audited directly rather than by reading failures.

Anything restored from the lists above needs its `runs-on` checked first.

## Re-enabling for our own deployment

The Argus workflows encode CZI's deploy pipeline and are a reasonable reference, but
targeting our own infrastructure means replacing, at minimum:

- `runs-on: ARM64` → a runner we actually have
- the ECR repositories in `.infra/common.yaml` and `vcp-infra/.infra/common.yaml`
- the AWS role assumptions and org-level secrets throughout
