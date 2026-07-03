# plan-1339-current-operator-start-command

## Goal

Make external blocker reports expose the current operator start command as a first-class value-free field, so users can distinguish the diagnostic proof command from the first private metadata command they should run.

## Scope

- Add a top-level current operator start command alias to external next-actions evidence.
- Mirror that alias into downstream current-blocker/progress evidence where operators read the current release-channel blocker.
- Update README and quality expectations so the command distinction stays covered.

## Non-Goals

- Do not record release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, beats, or real user audio.
- Do not change private env apply/preflight semantics, release-channel validation, setup wizard behavior, signing, notarization, upload, network probing, project schema, app UI, or export behavior.
- Do not claim release-channel metadata, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA, release upload, or external distribution completion.

## Validation

- [x] `node --check harness/scripts/run_release_next_actions.mjs`
- [x] `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `npm run release:next-actions-smoke`
- [x] `npm run release:current-blocker-smoke`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:completion-summary-smoke`
- [x] `npm run release:check`

## Decision Log

- 2026-07-04: Created after plan-1338 made setup wizard location rows value-free, while the next-actions/current-blocker reports still required readers to infer the real operator first command from the command sequence instead of a stable top-level field.
- 2026-07-04: Added `currentOperatorStartCommand` with role, first-command match status, and `currentOperatorStartCommandValueRecorded` fields to next-actions, proof-bundle, release progress, current-blocker, progress-refresh, completion-summary, and completion-summary-refresh receipts.
- 2026-07-04: Kept the alias value-free and equal to the first current operator command so diagnostic commands such as `currentNextCommand` can remain distinct from the first command an operator should run.
- 2026-07-04: Ran full release QA. The sandboxed run reached the expected macOS GUI boundary at desktop launch smoke; the unsandboxed `npm run release:check` completed with exit code 0.
