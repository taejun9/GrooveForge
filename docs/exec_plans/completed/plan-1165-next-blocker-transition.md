# plan-1165-next-blocker-transition

## Goal

Add a value-free current action transition preview to the current-blocker receipt so the operator can see the current release action, the next pending action after it clears, and the final hard-gate command in one compact table.

## Scope

- Derive transition preview rows from current priority action rows and the hard-gate command.
- Add transition readiness, row count, next action id/label, Markdown, console output, and validation to `release:current-blocker`.
- Keep all rows value-free and avoid recording private release URLs, channel values, signing identities, credentials, upload targets, or approval values.
- Update release readiness, quality rules, harness architecture, and QA expectations.

## Out of Scope

- Editing `.env.distribution.local` or any private distribution values.
- Claiming release-channel metadata, Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing readiness logic, priority action ordering, hard-gate readiness logic, or next-actions remediation logic.

## Plan

1. Inspect priority action rows and current-blocker output.
2. Add current action transition preview rows to current-blocker JSON, Markdown, and console output.
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
| 2026-06-30 | Derive transition preview from ordered priority actions. | The priority action ladder is the existing source of truth for what follows the current release-channel action. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1161-1170: 4/10`, current action acceptance `0/3`, and post-edit verification `0/3` currently ready. |
| 2026-06-30 | harness_builder | Added `3` value-free current action transition rows covering current action, next pending action, and final hard gate. |
| 2026-06-30 | quality_runner | Passed Node syntax check, full QA, diff whitespace validation, progress smoke at `1161-1170: 5/10`, and current-blocker smoke with next priority action `auto-update-feed`. |
