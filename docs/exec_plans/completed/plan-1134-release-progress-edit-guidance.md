# plan-1134-release-progress-edit-guidance

## Goal

Make the release progress report carry value-free edit guidance for the current release-channel placeholder keys, so the remaining external proof step is actionable from the progress artifact without exposing private values.

## Scope

- Mirror current placeholder edit locations, value-free env edit templates, and value-free edit rows from the external proof bundle into the release progress JSON.
- Print concise edit-location and edit-template summaries in release progress console output and Markdown status.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Filling `.env.distribution.local` private values or replacing placeholders.
- Recording URLs, channels, credentials, identity labels, tokens, or local env values.
- Signing, notarizing, uploading, probing remote channels, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio behavior, project data, exports, or sampling scope.

## Plan

1. Inspect current external proof bundle edit-guidance fields.
2. Add value-free edit location/template/row mirrors to the release progress report.
3. Update docs and QA expectations.
4. Run focused checks and progress smoke.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- `node --check harness/scripts/run_release_external_proof_bundle.mjs` - passed.
- `node --check harness/scripts/run_release_progress_report.mjs` - passed.
- `npm run qa` - passed.
- `python3 -m py_compile harness/scripts/run_qa.py` - passed; generated pyc side effect was restored before completion.
- `git diff --check` - passed.
- `npm run release:check` - passed; includes `npm run qa`, `npm run verify`, release proof-bundle smoke, and release progress smoke.
- Generated release progress smoke reported `99.999999%` overall completion, `0.000001%` remaining, current 10-plan progress `1131-1140: 3/10` before this plan moved to completed, and value-free edit guidance arrays with 4 env edit template rows and 4 env edit rows.
- Post-completion `npm run release:proof-bundle-smoke` - passed.
- Post-completion `npm run release:progress-smoke` - passed and reported current 10-plan progress `1131-1140: 4/10`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Mirror value-free edit guidance instead of editing private env values. | The remaining completion gap requires operator-owned release-channel values; the repo can only make the next action clearer and verifiable without recording values. |
| 2026-06-29 | Keep progress smoke compatible with both missing-env and placeholder-env paths. | A clean worktree may have no ignored `.env.distribution.local`, while the operator machine may have placeholder keys; progress reporting should mirror value-free rows from whichever proof-bundle path is current without requiring private values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created after release progress confirmed release-channel metadata placeholders are the current proof target. |
| 2026-06-29 | harness_builder | Mirrored value-free placeholder edit locations, env edit templates, env edit rows, and placeholder remediation rows from external proof bundle summaries into release progress JSON/Markdown/console output. |
| 2026-06-29 | repo_cartographer | Updated README, harness architecture, release readiness, quality rules, and QA expectations for the release progress edit-guidance contract. |
| 2026-06-29 | quality_runner | Ran focused checks and the full release gate; all listed QA commands passed. |
| 2026-06-29 | plan_keeper | Moved the plan to completed, created the review mirror, and confirmed post-completion progress smoke reports `1131-1140: 4/10`. |
