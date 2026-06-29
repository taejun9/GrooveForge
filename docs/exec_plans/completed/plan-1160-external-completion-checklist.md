# plan-1160-external-completion-checklist

## Goal

Add a value-free external completion checklist to the current-blocker receipt so the final `0.000001%` path shows each pending priority action, the evidence needed to close it, and the commands to rerun before the hard external gate.

## Scope

- Derive completion checklist rows from the existing external next-actions priority actions.
- Add the checklist rows, summaries, current-row alignment, and validation to `release:current-blocker` JSON, Markdown, and console output.
- Keep all rows value-free and avoid recording private release URLs, channel values, signing identities, credentials, upload targets, or approval values.
- Update release readiness, quality rules, harness architecture, and QA expectations for the new current-blocker evidence.

## Out of Scope

- Editing `.env.distribution.local` or any private distribution values.
- Claiming Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing priority action ordering or hard-gate readiness logic.

## Plan

1. Inspect current next-actions priority action evidence and current-blocker summary rows.
2. Add external completion checklist rows to current-blocker output.
3. Update docs and QA expectations.
4. Run focused validation, complete the plan, review, merge, push, and report the 10-plan milestone.

## QA

- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:current-blocker-smoke`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Derive completion checklist rows from `release:next-actions` instead of recomputing readiness. | Next-actions owns the ordered remediation actions; current-blocker should mirror the closure checklist without creating a second source of truth. |
| 2026-06-30 | Keep completion checklist rows compact and evidence-label based. | The receipt should show which evidence closes each pending action without copying private values or duplicating every detailed next-actions row. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1151-1160: 9/10`, hard gate `9/16` ready, and 7 blocked hard-gate requirements. |
| 2026-06-30 | harness_builder | Added 7 value-free external completion checklist rows, current checklist row fields, hard-gate command references, and current-row alignment validation to current-blocker JSON, Markdown, and console output. |
| 2026-06-30 | quality_runner | Passed Node syntax check, full QA, diff whitespace validation, and current-blocker smoke with checklist rows aligned to the current priority action. |
