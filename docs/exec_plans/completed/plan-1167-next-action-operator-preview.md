# plan-1167-next-action-operator-preview

## Goal

Extend the current-blocker receipt's next action preview with value-free operator preparation rows for the next pending external action, so the operator can see the exact prerequisite command sequence, operator actions, and env edit locations for `auto-update-feed` before the current release-channel metadata blocker clears.

## Scope

- Derive next action prerequisite command rows, operator action rows, and env edit rows from the second ordered priority action.
- Add row counts, summaries, JSON fields, Markdown sections, console output, and validation to `release:current-blocker`.
- Keep the preview value-free and avoid recording feed URLs, channel values, signing identities, credentials, upload targets, or approval values.
- Update release readiness, quality rules, harness architecture, and QA expectations.

## Out of Scope

- Editing `.env.distribution.local` or any private distribution values.
- Claiming release-channel metadata, auto-update readiness, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing priority action ordering, readiness logic, hard-gate logic, or next-actions remediation logic.

## Plan

1. Inspect next action detail rows for `auto-update-feed`.
2. Add next action operator preview rows to current-blocker JSON, Markdown, console output, and validation.
3. Update docs and QA expectations.
4. Run focused validation, complete the plan, review, merge, push, and report progress.

## QA

- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `python3 -m py_compile harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:current-blocker-smoke`
- `python3 harness/scripts/run_qa.py`
- `npm run release:progress-smoke`
- `npm run release:current-blocker-smoke` (after progress smoke)

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Preview operator preparation rows from the second ordered priority action only. | The current action remains the real blocker; exposing the next action command/edit/operator rows helps prepare the following external step without changing readiness or recording private values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1161-1170: 6/10`, current action `release-channel-metadata`, and next priority action `auto-update-feed`. |
| 2026-06-30 | harness_builder | Added next action prerequisite command rows, operator action rows, and env edit rows to the current-blocker next action preview. |
| 2026-06-30 | quality_runner | Verified `auto-update-feed` preview reports 4 prerequisite command rows, 2 operator action rows, 6 env edit rows, and no recorded values. |
| 2026-06-30 | plan_keeper | Progress smoke updated current 10-plan progress to `1161-1170: 7/10`; regular 10-plan report is not due until `10/10`. |
