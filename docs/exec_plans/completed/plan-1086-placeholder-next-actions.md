# plan-1086-placeholder-next-actions

## Goal

Make `npm run release:next-actions` turn placeholder-only local distribution env state into a clearer next operator action.

Plan 1085 made `desktop:distribution-private-inputs-smoke` report local env placeholder key names and counts without values. The next-actions report should use that evidence so an operator who already ran `npm run release:prepare-env` sees the local env placeholder cleanup as the next concrete release-channel step, not only generic blocked metadata.

## Scope

- Confirm current `release:next-actions` behavior after an ignored placeholder `.env.distribution.local` is created.
- If needed, update `run_release_next_actions.mjs` to surface placeholder key counts/names and route release-channel metadata toward editing the ignored local env placeholders.
- Keep reports value-free and keep release/support/feed URLs, credentials, tokens, identity labels, channel values, private beats, and user audio out of generated artifacts.
- Update README, release readiness docs, quality rules, and QA expectations.

## Out of Scope

- Filling private release values, credentials, URLs, tokens, channel metadata, Developer ID identity labels, or approval values.
- Developer ID signing, Apple notarization submission, stapling, Gatekeeper approval, release upload, remote feed publishing, remote probing, manual QA approval, or claiming external distribution completion.
- Product UI, sampling/import features, project data model, or beat authoring behavior.

## Plan

1. Completed: Reproduced the `release:next-actions` behavior gap after code inspection; existing logic only routed missing local env files, not loaded placeholder env files.
2. Completed: Implemented value-free placeholder next-action reporting.
3. Completed: Updated docs and QA expectations.
4. Completed: Ran targeted QA, placeholder-path validation, and full verification.
5. In progress: Review is complete; moving this plan to completed, creating review mirror, merging to `main`, pushing, deleting the branch, and removing the worktree remain.

## QA

- Passed: `node --check harness/scripts/run_release_doctor.mjs`.
- Passed: `node --check harness/scripts/run_release_external_preflight.mjs`.
- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:prepare-env`.
- Passed: `npm run verify`.
- Verified generated external next-actions JSON reports `localEnvPlaceholderKeyCount: 22`, keeps `privateValuesRecorded: false` and `localEnvValueRecorded: false`, makes the release-channel next command `npm run release:doctor`, and makes placeholder cleanup the first release-channel blocker without recording values.
- Passed: `npm run release:next-actions`.
- Passed after full validation: `git diff --check`.
- Passed after full validation: `python3 -B harness/scripts/run_qa.py`.

## Decision Log

- 2026-06-29: Chose the release next-actions layer because plan 1085 already emits placeholder key evidence, but operators need that evidence converted into the immediate command/action sequence.
- 2026-06-29: Chose `npm run release:doctor` as the next command after placeholder cleanup because it reruns the targeted redacted distribution input checks without running the full release gate.
- 2026-06-29: Review found no value-recording or release-claim regression; new next-actions guidance uses key names/counts only.

## Status

- Review complete; ready for completion move.
