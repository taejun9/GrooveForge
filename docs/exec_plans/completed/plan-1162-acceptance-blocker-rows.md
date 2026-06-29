# plan-1162-acceptance-blocker-rows

## Goal

Add value-free current action acceptance blocker rows to the current-blocker receipt so each failing current ready criterion shows its blocker, redacted source field, operator action, and rerun command.

## Scope

- Derive blocker rows from failing current action acceptance rows.
- Add blocker row counts, summaries, Markdown tables, console summaries, and validation to `release:current-blocker`.
- Keep all rows value-free and avoid recording private release URLs, channel values, signing identities, credentials, upload targets, or approval values.
- Update release readiness, quality rules, harness architecture, and QA expectations.

## Out of Scope

- Editing `.env.distribution.local` or any private distribution values.
- Claiming release-channel metadata, Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing acceptance readiness, priority action ordering, hard-gate readiness logic, or next-actions remediation logic.

## Plan

1. Inspect current action acceptance rows and source evidence fields.
2. Add current action acceptance blocker rows to current-blocker output.
3. Update docs and QA expectations.
4. Run focused validation, complete the plan, review, merge, push, and report progress.

## QA

- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:progress-smoke`
- `npm run release:current-blocker-smoke`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Derive blocker rows from failing current action acceptance rows. | Acceptance rows already own the current criterion state; blocker rows should explain only the failed criteria without recomputing readiness. |
| 2026-06-30 | Keep blocker rows source-field based. | Source fields let the operator trace the failing criterion without exposing private values or duplicating source artifacts. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1161-1170: 1/10`, current action acceptance `0/3`, and current action `release-channel-metadata`. |
| 2026-06-30 | harness_builder | Added 3 current action acceptance blocker rows with blocker summaries, source fields, operator actions, proof/rerun commands, and value-free validation. |
| 2026-06-30 | quality_runner | Passed Node syntax check, full QA, diff whitespace validation, progress smoke at `1161-1170: 2/10`, and current-blocker smoke with `3 current action acceptance blockers`. |
