# plan-1336-completion-summary-current-plan-guard

## Goal

Make `npm run release:completion-summary-smoke` reject stale ignored source evidence when its latest completed plan or 10-plan progress no longer matches the current `docs/exec_plans/completed` files, so after-work completion reporting cannot silently reuse an older completion percentage window.

## Scope

- Derive the current latest completed plan and 10-plan window directly from `docs/exec_plans/completed` inside the completion summary smoke.
- Add value-free report fields and validation checks that compare the source completion summary with the current completed-plan filesystem state.
- Update README/QA expectations so the stale-source guard remains documented.

## Non-Goals

- Do not change release progress refresh behavior, release artifacts outside ignored `build/desktop/`, private env files, app UI, audio behavior, project schema, signing, notarization, uploads, or external distribution behavior.
- Do not record private release URL, support URL, channel, feed URL, credential, token, Developer ID identity, local env value, beat, or user audio values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, or external distribution completion.

## Validation

- [x] `node --check harness/scripts/run_release_completion_summary_smoke.mjs`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `npm run release:completion-summary-smoke`
- [x] `npm run release:check`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] Completion summary JSON receipt guard fields: source latest/current latest, 10-plan progress/count/report-due matches all `true`
- [x] `git diff --check`

## Decision Log

- 2026-07-04: Created after observing that main's ignored completion source evidence could remain at an older 10-plan count even after newer completed plan files were merged, while `release:completion-summary-smoke` only trusted the existing source JSON.
- 2026-07-04: Added current completed-plan filesystem derivation to `release:completion-summary-smoke` and made source latest plan, 10-plan progress, 10-plan count, and report-due posture hard validation checks before existing-evidence completion readouts are accepted.
- 2026-07-04: The first sandboxed `npm run release:check` stopped at the macOS GUI launch preflight as expected; reran the same command unsandboxed with approval, and it completed successfully.
