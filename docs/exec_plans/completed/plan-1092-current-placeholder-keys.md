# plan-1092-current-placeholder-keys

## Goal

Make `npm run release:next-actions` separate the current action's placeholder key names from the full local env placeholder list.

The current compact status correctly reports the current action's required keys and the total local env placeholder count, but the operator action asks for all placeholder keys at once. For the current release-channel action, operators should see the four current placeholder keys first while the global 21-key placeholder count remains available.

## Scope

- Add value-free top-level current placeholder key count, summary, and key list fields to the external next-actions JSON report.
- Add current placeholder keys to Markdown and console output.
- Make release-channel placeholder cleanup operator action target current required placeholder keys first while preserving global placeholder evidence.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.

## Out of Scope

- Filling private release values, URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspect current next-actions placeholder flow.
2. Done: Add current placeholder key fields and focused operator action text.
3. Done: Update docs and QA expectations.
4. Done: Validate no-env, placeholder-env, and full local QA paths.
5. Done: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:next-actions` in clean-checkout/bootstrap mode before source evidence existed: current placeholder keys `0 (none)`.
- Passed: `npm run verify` with no local distribution env after source evidence was generated: current release-channel action used `npm run release:prepare-env`, required keys `4`, and current placeholder keys `0`.
- Passed: `npm run release:prepare-env`.
- Passed: `npm run release:next-actions` with placeholder local env: current placeholder keys `4`, local env placeholder keys `21`, next command `npm run release:doctor`, private values recorded `false`.
- Passed: final `npm run verify` with placeholder local env: release next-actions smoke reported current placeholder keys `4` and local env placeholder keys `21`.

## Decision Log

- 2026-06-29: Chose to keep global `localEnvPlaceholderKeys` while adding current action placeholder keys, because external distribution still needs all placeholders cleared but the current operator action should stay focused.
- 2026-06-29: Changed the placeholder first blocker to say `placeholder keys` explicitly so the current blocker text and validation contract use the same operator-facing term.

## Status

- Completed.
