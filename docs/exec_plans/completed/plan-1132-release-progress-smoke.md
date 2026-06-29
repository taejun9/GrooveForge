# plan-1132-release-progress-smoke

## Goal

Add a fast value-free release progress smoke path that reads existing release evidence and refreshes the user-facing completion and 10-plan progress summary without rerunning the full local release gate.

## Scope

- Add a `--from-existing` mode to `harness/scripts/run_release_progress_report.mjs`.
- Add an `npm run release:progress-smoke` script for the fast existing-evidence path.
- Include the fast progress smoke in `npm run verify` after proof-bundle smoke so release-gate evidence always includes the user-facing completion summary.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Changing app UI, audio behavior, project files, export behavior, or sampling scope.
- Filling private distribution values, signing, notarizing, uploading, probing remote channels, or approving manual QA.
- Replacing the full `npm run release:progress` gate-backed report.

## Plan

1. Inspect the release progress report command path and verify ordering.
2. Add existing-evidence mode and package script.
3. Update docs and QA contracts.
4. Run focused checks, fast progress smoke, and QA.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_progress_report.mjs`.
- Passed: `npm run qa`.
- Passed: `git diff --check`.
- Expected first failure: `npm run release:progress-smoke` before the fresh worktree had source release evidence. The command now reports the required prerequisite as `npm run release:check` or `npm run verify`.
- Failed once, then passed on rerun: `npm run release:check` first timed out at `desktop:packaged-project-io-smoke`; the same smoke passed standalone, then the full `npm run release:check` rerun passed.
- Passed: `npm run release:progress-smoke` through `npm run verify`, reporting `existing-evidence smoke`, `Release check run by this report: no`, `99.999999%` complete, `0.000001%` remaining, and `1131-1140: 1/10` before this plan is moved to completed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Keep `release:progress` as the full gate-backed command and add `release:progress-smoke` for existing evidence. | Completion reports need a fast path after every task without weakening the authoritative full progress command. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added `--from-existing`, `release:progress-smoke`, verify coverage, docs, and QA contracts. |
| 2026-06-29 | quality_runner | Verified focused checks and full release gate; first packaged project IO timeout passed on standalone and full rerun. |
| 2026-06-29 | plan_keeper | Completion move will advance the current 10-plan window from `1131-1140: 1/10` to `1131-1140: 2/10`. |
