# plan-1136-operator-runbook-current-proof-rows

## Goal

Mirror the current value-free release proof action into the external operator runbook, so the operator runbook carries the same current edit guidance, proof checklist rows, and command verification rows that already appear in release next-actions, proof bundle, and progress reports.

## Scope

- Read the current external next-actions artifact when building the external operator runbook.
- Add value-free current action summaries, current edit rows, proof checklist rows, and command verification rows to the runbook JSON and Markdown.
- Add concise console summaries for the new runbook rows.
- Update README, harness architecture, release readiness, quality rules, and QA expectations for the runbook proof-row contract.

## Out of Scope

- Filling `.env.distribution.local` private values.
- Recording URLs, channels, credentials, identity labels, tokens, or local env values.
- Signing, notarizing, uploading, probing remote channels, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio behavior, project data, exports, or optional sampling scope.

## Plan

1. Inspect the current external operator runbook and release next-actions row shapes.
2. Add value-free current action row mirrors to the operator runbook JSON, Markdown, console output, and validation.
3. Update docs and static QA expectations.
4. Run focused checks, operator runbook smoke, release proof-bundle smoke, and release progress smoke.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- `node --check harness/scripts/run_desktop_external_operator_runbook_smoke.mjs` - passed.
- `npm run qa` - passed.
- `git diff --check` - passed.
- `npm run release:check` - passed; includes `npm run qa`, `npm run verify`, the refreshed post-next-actions external operator runbook smoke, release proof-bundle smoke, and release progress smoke.
- Generated external operator runbook smoke reported current action source ready, current env edit rows `4`, current proof checklist rows `3`, current command verification rows `4`, and no external distribution completion claim.
- Generated release progress smoke reported `99.999999%` overall completion, `0.000001%` remaining, and current 10-plan progress `1131-1140: 5/10` before this plan moved to completed.
- Post-completion `npm run desktop:external-operator-runbook-smoke` - passed and reported current env edit rows `4`, proof checklist rows `3`, and command verification rows `4`.
- Post-completion `npm run release:proof-bundle-smoke` - passed.
- Post-completion `npm run release:progress-smoke` - passed and reported current 10-plan progress `1131-1140: 6/10`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Extend the operator runbook instead of adding another artifact. | The runbook is the existing operator-facing sequence for the final external proof path, so putting current value-free proof rows there reduces document hopping without recording private values. |
| 2026-06-29 | Refresh the operator runbook after next-actions inside `npm run verify`. | The initial runbook must exist before next-actions can read source evidence, but the final runbook should mirror the current value-free next-action rows before proof-bundle and progress evidence are generated. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created after main release progress confirmed the remaining blocker is release-channel metadata placeholders in the ignored local env file. |
| 2026-06-29 | harness_builder | Added optional next-actions mirroring to the external operator runbook for current edit rows, proof checklist rows, and command verification rows, all value-free. |
| 2026-06-29 | repo_cartographer | Updated README, harness architecture, release readiness, quality rules, package verify order, and QA expectations for the refreshed runbook proof-row contract. |
| 2026-06-29 | quality_runner | Ran full release check; the refreshed operator runbook reported current action source ready with 4 edit rows, 3 proof rows, and 4 command verification rows. |
| 2026-06-29 | plan_keeper | Moved the plan to completed, created the review mirror, and confirmed post-completion progress smoke reports `1131-1140: 6/10`. |
