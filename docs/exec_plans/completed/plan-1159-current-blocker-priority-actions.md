# plan-1159-current-blocker-priority-actions

## Goal

Mirror the value-free `release:next-actions` priority action ladder into the current-blocker receipt so the remaining external `0.000001%` shows the current first blocker, the hard-gate ladder, and the ordered operator actions in one place.

## Scope

- Read the existing external next-actions JSON artifact from `release:current-blocker`.
- Add value-free priority action rows, counts, current action linkage, next command, rerun command, and checklist summaries to current-blocker JSON, Markdown, and console output.
- Validate priority action rows remain value-free and align with the current blocker and hard gate.
- Update release readiness, quality rules, harness architecture, and QA expectations.

## Out of Scope

- Editing `.env.distribution.local` or any private distribution values.
- Claiming external distribution completion, Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, uploads, or app-store submission.
- Changing next-actions priority ordering or hard-gate readiness logic.

## Plan

1. Inspect current next-actions priority action shape.
2. Mirror priority action rows into current-blocker output.
3. Update docs and QA expectations.
4. Run focused validation, complete the plan, review, merge, push, and report progress.

## QA

- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `npm run release:current-blocker-smoke`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Use `release:next-actions` as the source for the priority action ladder. | It already owns the ordered operator actions; current-blocker should mirror that value-free evidence instead of recomputing it. |
| 2026-06-30 | Keep priority action rows as summaries instead of copying full action details. | Current-blocker should remain compact while linking the current blocker, hard gate, and next action order without duplicating every detailed next-actions table. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1151-1160: 8/10`, hard gate `9/16` ready, and 7 blocked hard-gate requirements. |
| 2026-06-30 | harness_builder | Mirrored the external next-actions source path/readiness, 7 priority action rows, current priority action, next command, and alignment check into current-blocker JSON, Markdown, and console output. |
| 2026-06-30 | quality_runner | Passed current-blocker smoke, Node syntax check, full QA, and diff whitespace validation with priority action rows value-free and aligned to the current first blocker. |
