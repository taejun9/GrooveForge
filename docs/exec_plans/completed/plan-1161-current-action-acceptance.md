# plan-1161-current-action-acceptance

## Goal

Add value-free current action acceptance rows to the current-blocker receipt so the first remaining external blocker shows each ready criterion, whether the current evidence satisfies it, and which command/evidence should close it after operator-owned env edits.

## Scope

- Derive current action acceptance rows from the current external next-actions action and the existing proof/gate/progress evidence.
- Add row counts, summaries, current blocker alignment, Markdown tables, console summaries, and validation to `release:current-blocker`.
- Keep all rows value-free and avoid recording private release URLs, channel values, signing identities, credentials, upload targets, or approval values.
- Update release readiness, quality rules, harness architecture, and QA expectations.

## Out of Scope

- Editing `.env.distribution.local` or any private distribution values.
- Claiming release-channel metadata, Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing priority action ordering, hard-gate readiness logic, or next-actions remediation logic.

## Plan

1. Inspect current next-actions, proof bundle, external gate, and progress fields used for the current release-channel action.
2. Add current action acceptance rows to current-blocker output.
3. Update docs and QA expectations.
4. Run focused validation, complete the plan, review, merge, push, and report progress.

## QA

- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:current-blocker-smoke`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Keep acceptance rows inside `release:current-blocker` instead of creating a new command. | Operators already use current-blocker as the one compact receipt after ignored env edits; adding rows there reduces another command hop. |
| 2026-06-30 | Derive acceptance rows from current ready criteria and redacted evidence booleans only. | The rows need to show closure status without exposing private channel, URL, credential, signing, or approval values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1151-1160: 10/10`, hard gate `9/16` ready, 7 blocked hard-gate requirements, and current action `release-channel-metadata`. |
| 2026-06-30 | harness_builder | Added 3 current action acceptance rows, acceptance ready/ready-count summaries, proof/rerun command linkage, hard-gate command references, and current-action alignment checks to current-blocker output. |
| 2026-06-30 | quality_runner | Passed Node syntax check, full QA, diff whitespace validation, and current-blocker smoke with current action acceptance at `0/3` criteria ready and value-free rows. |
