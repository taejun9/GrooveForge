# plan-1324-release-channel-input-file

## Goal

Allow the release-channel private-env preflight/apply helper to accept the four operator-owned release-channel metadata values from an ignored private input file as well as `process.env`, so the current external distribution blocker is easier to clear without recording private values.

## Scope

- Add an optional ignored private input file source for the four release-channel metadata keys.
- Keep `process.env` values as the highest-precedence source.
- Add value-free report fields that show input file presence, loaded key names, source rows, and row counts without recording channel, release URL, notes URL, or support URL values.
- Add a synthetic input-file smoke that proves preflight and apply can use the ignored input file, update only the synthetic distribution env target, pass strict release-channel live-check, and avoid real local-env reads/modifications.
- Add a sanitized Squirrel DYLD/code-signature stale-worktree crash-report sample so the attached report shape stays classified as a packaging/framework dependency issue and routes operators to fresh build/package/signature verification.
- Update package scripts, `verify`, QA expectations, README, and release readiness docs.

## Non-Goals

- Do not edit real `.env.distribution.local`.
- Do not add committed private values, URL values, channel values, credentials, tokens, signing identities, local env values, private beats, or real user audio.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, release upload, update feed publishing, or external distribution completion.
- Do not change product UI, audio behavior, project schema, signing, notarization, upload behavior, or real release artifacts.

## Validation

- [x] `node --check harness/scripts/run_release_channel_apply_private_env.mjs`
- [x] `node --check harness/scripts/run_release_channel_apply_private_env_input_file_smoke.mjs`
- [x] `node --check harness/scripts/run_release_channel_apply_private_env_preflight_blocked_smoke.mjs`
- [x] `node --check harness/scripts/run_desktop_crash_report_regression_smoke.mjs`
- [x] `npm run release:channel-apply-private-env-input-file-smoke`
- [x] `npm run release:channel-apply-private-env-preflight-blocked-smoke`
- [x] `npm run desktop:crash-report-regression-smoke`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:check`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after main completion summary showed latest completed plan `plan-1323`, 10-plan progress `1321-1330: 3/10`, completion `99.999999%`, and current external blocker as four release-channel metadata placeholders. The current operator sequence starts with `npm run release:channel-apply-private-env-preflight`, but that still requires operator-owned private inputs before proof can advance.
- 2026-07-03: Chose an ignored private input-file source instead of recording values in tracked files or asking for secrets in this thread. This reduces operator friction while preserving value-free release evidence.
- 2026-07-03: The user attached another macOS Crash Reporter log showing `Namespace DYLD, Code 1, Library missing` for `@rpath/Squirrel.framework/Squirrel`, with a stale plan worktree app path and nested framework code-signature evidence. The current packaging guard already verifies Squirrel/ReactiveObjC/Mantle presence, signatures, and dyld loadability, so this plan adds the exact sanitized stale-worktree shape to crash-report regression coverage instead of changing release signing or recording user paths.
