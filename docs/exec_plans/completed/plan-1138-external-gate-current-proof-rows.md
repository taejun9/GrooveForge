# plan-1138-external-gate-current-proof-rows

## Goal

Mirror the current value-free proof action from the external proof bundle into the external distribution gate, so the hard gate and dry-run gate both report the same current next command, blocker, edit rows, proof checklist rows, and command verification rows without recording private values.

## Scope

- Read the external proof bundle when building the external distribution gate.
- Add value-free current proof summaries and rows to the gate JSON, Markdown, console output, and validation.
- Keep `release:external-check` as the hard gate and keep dry-run mode non-claiming.
- Update README, harness architecture, release readiness, quality rules, and QA expectations.

## Out of Scope

- Filling `.env.distribution.local` private values.
- Recording URLs, channels, credentials, identity labels, tokens, or local env values.
- Signing, notarizing, uploading, probing remote channels, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio behavior, project data, exports, or optional sampling scope.

## Plan

1. Inspect the external distribution gate and proof bundle source contracts.
2. Add value-free current proof mirrors to external gate JSON, Markdown, console output, and validation.
3. Update docs and static QA expectations for the hard-gate current-proof contract.
4. Run focused checks, gate smokes, release progress smoke, and full QA as appropriate.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- `node --check harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run release:check` passed. The verify chain reran `npm run desktop:external-distribution-gate-smoke` after `npm run release:proof-bundle-smoke`; the refreshed gate reported `Current proof bundle source ready: yes`, current next command `npm run release:prepare-env`, current env edit rows `4`, current proof checklist rows `3`, and current command verification rows `4` without recording private values.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Mirror proof bundle current rows into the external gate instead of introducing another report. | The hard gate is the final local authority before external distribution; surfacing the same current proof rows there keeps the operator path consistent without storing private values. |
| 2026-06-29 | Rerun the external distribution gate after proof-bundle smoke inside `npm run verify`. | The early dry-run gate may execute before proof-bundle evidence exists; the second gate run proves the current rows are mirrored before release progress reporting. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created after main progress confirmed `99.999999%` completion, `1131-1140: 7/10`, and release-channel metadata placeholders as the current proof blocker. |
| 2026-06-29 | harness_builder | Added optional proof-bundle input to the external distribution gate and exposed current next command, first blocker, edit rows, proof checklist rows, and command verification rows in JSON, Markdown, console output, and validation. |
| 2026-06-29 | repo_cartographer | Updated README, harness architecture, release readiness, quality rules, and QA expectations so the hard gate, proof bundle, and release progress reports describe the same current value-free proof rows. |
| 2026-06-29 | quality_runner | Ran focused static checks and full `npm run release:check`; all passed and the refreshed gate mirrored proof-bundle rows `4/3/4`. |
