# plan-1166-next-action-preview

## Goal

Add a value-free next action preview to the current-blocker receipt so the operator can see the ready criteria and checklist for the next pending external action after the current release-channel metadata action clears.

## Scope

- Derive next action preview rows from the second ordered priority action.
- Add next action ready-criteria rows, checklist rows, row counts, summaries, Markdown, console output, and validation to `release:current-blocker`.
- Keep all rows value-free and avoid recording private release URLs, channel values, signing identities, credentials, upload targets, or approval values.
- Update release readiness, quality rules, harness architecture, and QA expectations.

## Out of Scope

- Editing `.env.distribution.local` or any private distribution values.
- Claiming release-channel metadata, Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing readiness logic, priority action ordering, hard-gate readiness logic, or next-actions remediation logic.

## Plan

1. Inspect priority action details for the next pending action.
2. Add next action preview rows to current-blocker JSON, Markdown, and console output.
3. Update docs and QA expectations.
4. Run focused validation, complete the plan, review, merge, push, and report progress.

## QA

- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `python3 -m py_compile harness/scripts/run_qa.py`
- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run release:current-blocker-smoke`
- `npm run release:progress-smoke`
- `npm run release:current-blocker-smoke` (after progress smoke)

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Preview the second priority action only. | The current action remains the real blocker; previewing the next row gives useful operator prep without changing readiness or claiming completion. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1161-1170: 5/10`, current action `release-channel-metadata`, and next priority action `auto-update-feed`. |
| 2026-06-30 | harness_builder | Added value-free next action preview rows for the second ordered priority action, including ready criteria, checklist, evidence counts, key counts, proof command, Markdown, console output, and validation. |
| 2026-06-30 | quality_runner | Verified the next action preview reports `auto-update-feed`, 3 ready criteria rows, 2 checklist rows, 6 placeholder keys, and no recorded values. |
| 2026-06-30 | plan_keeper | Progress smoke updated current 10-plan progress to `1161-1170: 6/10`; regular 10-plan report is not due until `10/10`. |
