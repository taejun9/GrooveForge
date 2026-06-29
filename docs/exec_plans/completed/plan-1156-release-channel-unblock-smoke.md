# plan-1156-release-channel-unblock-smoke

## Goal

Add a value-free smoke that proves the release-channel metadata placeholder blocker can advance once an operator supplies non-placeholder local env values, without recording private values or claiming external distribution completion.

## Scope

- Create a synthetic ignored local env fixture under `build/desktop/` during the smoke.
- Load that fixture through the shared redacted local-env loader with a synthetic root.
- Verify release-channel placeholder keys drop to zero, release-channel required keys are loaded, URL/channel values remain absent from reports, and the next proof command remains `npm run release:doctor` for real operator-owned env edits.
- Add package script, QA expectations, and release/docs references for the new smoke.

## Out of Scope

- Editing the real ignored `.env.distribution.local`.
- Adding real release URLs, support URLs, feed URLs, credentials, identity labels, Apple notarization credentials, or private channel metadata.
- Claiming Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, release upload, or external distribution completion.

## Plan

1. Inspect release doctor and env loader behavior.
2. Add the release-channel unblock smoke.
3. Wire package script, QA expectations, and docs.
4. Run focused QA and smoke commands.
5. Complete plan, create review mirror, merge, push, and report progress.

## QA

- `node --check harness/scripts/run_release_channel_unblock_smoke.mjs`
- `npm run release:channel-unblock-smoke`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Use a synthetic ignored env fixture instead of editing `.env.distribution.local`. | The remaining blocker is private/operator-owned; the repo can only prove the value-free unblocking path without storing private values. |
| 2026-06-30 | Call the shared local-env loader with a synthetic root instead of setting `GROOVEFORGE_DISTRIBUTION_ENV_FILE`. | The smoke should not read or modify the real ignored env file or overwrite release doctor/current-blocker artifacts. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1151-1160: 5/10`, and current external blocker `.env.distribution.local:10-13` release-channel placeholders on main. |
| 2026-06-30 | harness_builder | Added `npm run release:channel-unblock-smoke` to prove four release-channel metadata keys can load as non-placeholder shape-valid values through the shared loader while recording no values and making no external-distribution claim. |
| 2026-06-30 | quality_runner | Passed focused syntax, smoke, QA, and diff checks. |
