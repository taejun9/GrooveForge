# plan-1133-release-progress-operator-action

## Goal

Make the release progress report surface the current external proof target and operator action directly, so every completion update states the next value-free release step without requiring a separate long doctor report scan.

## Scope

- Add current proof target and operator action fields to `harness/scripts/run_release_progress_report.mjs`.
- Print those fields in console output and include them in Markdown/JSON artifacts for both full and existing-evidence smoke modes.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Filling `.env.distribution.local` private values or replacing placeholders.
- Signing, notarizing, uploading, probing remote channels, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio behavior, project data, exports, or sampling scope.

## Plan

1. Inspect current release proof bundle and progress report field names.
2. Add value-free proof target/operator action fields to the release progress report.
3. Update docs and QA expectations.
4. Run focused checks and progress smoke.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_progress_report.mjs`.
- Passed: `npm run qa`.
- Passed: `git diff --check`.
- Passed: `npm run release:check` outside the sandbox.
- Passed through `npm run verify`: `npm run release:progress-smoke` reported `existing-evidence smoke`, `99.999999%` complete, `0.000001%` remaining, `1131-1140: 2/10` before this plan is moved to completed, `External proof current target: Release channel metadata`, and the current value-free operator action.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Keep this as a release progress reporting improvement, not private env editing. | The remaining completion gap requires real external/private proof; reporting can make the next operator action clearer without inventing values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created after `release:doctor` confirmed release-channel placeholders are the current blocker. |
| 2026-06-29 | harness_builder | Added current proof target and operator action fields to release progress JSON, Markdown, console output, and validation. |
| 2026-06-29 | doc_gardener | Updated README, harness architecture, release readiness, quality rules, and QA expectations. |
| 2026-06-29 | quality_runner | Ran focused checks and the full release gate; release progress smoke now prints the next external proof target and operator action. |
| 2026-06-29 | plan_keeper | Completion move will advance the current 10-plan window from `1131-1140: 2/10` to `1131-1140: 3/10`. |
