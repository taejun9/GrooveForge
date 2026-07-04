# plan-1352-current-blocker-freshness-guard

## Goal

Prevent current-blocker and completion-progress receipts from silently reporting stale completed-plan progress after a new plan is completed, so every after-work completion report stays tied to the current `docs/exec_plans/completed` state.

## Scope

- Add a value-free freshness guard to the current-blocker existing-evidence path.
- Compare release-progress source rows against the current completed-plan window before reporting 10-plan progress through current-blocker evidence.
- Surface an explicit refresh command when current-blocker evidence is stale instead of presenting old completion rows as current.
- Update QA and release/quality docs so the after-work completion evidence chain includes the freshness guard.

## Non-Goals

- Do not edit private release values, local env values, release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identities, or real user audio.
- Do not run distribution channel probes, release uploads, update-feed publishing, Developer ID signing, Apple notarization, Gatekeeper approval, manual QA approval, app-store submission, or the external hard gate.
- Do not change the completion percentage formula or claim external distribution completion.

## Validation

- [x] `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-04: Created after plan-1351 exposed that `release:current-blocker-smoke` can read stale release-progress evidence from ignored build output and surface an older 10-plan window, even when the repository has newer completed plans. The fix should keep current-blocker reports value-free while forcing stale evidence to be refreshed before user-facing completion rows are trusted.
- 2026-07-04: Implemented a completed-plan freshness guard that derives the current 10-plan window from `docs/exec_plans/completed`, compares it with release-progress source rows, and reports the source-only refresh command when the source is stale.
- 2026-07-04: Validation confirmed the refreshed after-work evidence reports `1351-1360: 2/10`, stale artifacts `0`, and user-facing completion `99.999999%` while keeping external/private release proof pending.
