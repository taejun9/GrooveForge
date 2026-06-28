# plan-1090-current-required-keys

## Goal

Make `npm run release:next-actions` surface the current action's required key count and key names in the compact status output.

The current report shows the next command, first blocker, operator action, and rerun command. Operators still need the action details or JSON arrays to see exactly which required private-input keys belong to the current action. The compact status should expose the current required key count and key names while staying value-free.

## Scope

- Add top-level current required key count and scalar key summary fields to the external next-actions JSON report.
- Add current required keys to Markdown and console output.
- Validate that the scalar/count fields mirror the first priority action and do not record values.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.

## Out of Scope

- Filling private release values, URLs, credentials, tokens, channel metadata, Developer ID identities, or approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Completed: Inspect current required-key report shape and QA expectations.
2. Completed: Add scalar/count current required-key fields.
3. Completed: Update docs and QA expectations.
4. Completed: Validate bootstrap, no-env, and placeholder-env next-actions paths plus full local QA.
5. Completed: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:next-actions` in missing-source/bootstrap mode; console reported `Current required keys: 0 (none)` without private values.
- Passed: `npm run verify`; release next-actions smoke reported `Current required keys: 4 (GROOVEFORGE_DISTRIBUTION_CHANNEL, GROOVEFORGE_RELEASE_DOWNLOAD_URL, GROOVEFORGE_RELEASE_NOTES_URL, GROOVEFORGE_SUPPORT_URL)` in the no-env release-channel path.
- Passed: no-env JSON inspection confirmed `currentRequiredKeyCount: 4`, matching `currentRequiredKeys` and the first priority action, with `privateValuesRecorded: false` and `localEnvValueRecorded: false`.
- Passed: `npm run release:prepare-env` created an ignored placeholder `.env.distribution.local` scaffold without recording values.
- Passed: `npm run release:next-actions` with placeholder env loaded; console and JSON kept the same four current release-channel required keys, moved the current next command to `npm run release:doctor`, and reported 21 placeholder keys without recording values.
- Passed: final `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: final `git diff --check`.
- Passed: final `python3 -B harness/scripts/run_qa.py`.

## Decision Log

- 2026-06-29: Chose to expose key names only, not values, because required key names are already redacted evidence and are necessary for operator sequencing.
- 2026-06-29: Chose `currentRequiredKeyCount` plus `currentRequiredKeySummary` so compact Markdown/console output can show the count and scalar key list without requiring operators to inspect JSON arrays.
- 2026-06-29: Mirrored current required-key count and summary from the first priority action, and added validation for both no-env and placeholder-env release-channel paths.

## Status

- Completed.
