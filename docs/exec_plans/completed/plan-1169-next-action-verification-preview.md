# plan-1169-next-action-verification-preview

## Goal

Extend the current-blocker receipt's next action preview with value-free verification rows for `auto-update-feed`, so the operator can see the expected post-edit signals that prove the next action is ready after the current release-channel metadata blocker clears.

## Scope

- Derive next action verification rows from the second ordered priority action ready criteria and blockers.
- Add verification row count, summary, JSON fields, Markdown table, console output, and validation to `release:current-blocker`.
- Keep every row value-free and avoid recording feed URLs, channel values, signing identities, credentials, upload targets, or approval values.
- Update release readiness, quality rules, harness architecture, and QA expectations.

## Out of Scope

- Editing `.env.distribution.local` or any private distribution values.
- Claiming release-channel metadata, auto-update readiness, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing priority action ordering, readiness logic, hard-gate logic, or next-actions remediation logic.

## Plan

1. Map next action ready criteria to value-free expected verification signals.
2. Add next action verification preview rows to current-blocker JSON, Markdown, console output, and validation.
3. Update docs and QA expectations.
4. Run focused validation, complete the plan, review, merge, push, and report progress.

## QA

- Passed `node --check harness/scripts/run_release_current_blocker_smoke.mjs`.
- Passed `python3 -m py_compile harness/scripts/run_qa.py`.
- Passed `git diff --check`.
- Passed `npm run release:current-blocker-smoke`.
- Passed `python3 harness/scripts/run_qa.py`.
- Passed post-move `python3 harness/scripts/run_qa.py`.
- Passed post-move `npm run release:progress-smoke`.
- Passed post-move `npm run release:current-blocker-smoke`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Preview verification rows from the second ordered priority action only. | The current action remains the real blocker; exposing the next action expected signals improves follow-on external release validation without changing readiness or recording private values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1161-1170: 8/10`, current action `release-channel-metadata`, and next priority action `auto-update-feed`. |
| 2026-06-30 | harness_builder | Added 3 value-free next action verification preview rows for `auto-update-feed`, covering feed/channel metadata, auto-update readiness, and signed/notarized update metadata expected signals. |
| 2026-06-30 | quality_runner | Verified the current-blocker smoke writes `3 value-free next action verification rows` while preserving `99.999999%` completion and `1161-1170: 8/10` progress. |
| 2026-06-30 | plan_keeper | Completed plan-1169 and refreshed release progress to `1161-1170: 9/10`; the 10-plan report is still not due. |
