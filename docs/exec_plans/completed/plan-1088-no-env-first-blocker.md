# plan-1088-no-env-first-blocker

## Goal

Make `npm run release:next-actions` identify the missing ignored local distribution env file as the first blocker when no local env file is loaded.

The current report correctly routes the operator to `npm run release:prepare-env`, but its first blocker still comes from the broader release-channel metadata group. The no-env path should say that the ignored local env file is not loaded so the next command and blocker align.

## Scope

- Update release next-actions priority action construction for the no-env release-channel metadata path.
- Keep placeholder-env behavior unchanged: placeholder cleanup remains the first blocker and `npm run release:doctor` remains the current next command.
- Update docs and QA expectations so no-env first blocker behavior stays enforced.
- Keep all reports value-free.

## Out of Scope

- Creating or filling private release values, URLs, credentials, tokens, channel metadata, Developer ID identities, or approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, sampling, project schema, or export behavior changes.

## Plan

1. Done: Inspect current next-actions action construction and QA expectations.
2. Done: Implement explicit no-env first blocker behavior.
3. Done: Update release docs and harness QA expectations.
4. Done: Validate bootstrap, no-env, and placeholder-env next-actions paths plus full local QA.
5. Done: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: bootstrap `npm run release:next-actions` with missing source evidence. It still surfaced `npm run release:check` and source evidence regeneration as the first action.
- Passed: no-env `npm run release:next-actions-smoke` inside `npm run verify`. It surfaced `currentNextCommand: npm run release:prepare-env` and `currentFirstBlocker: Ignored local distribution env file is not loaded.`
- Passed: no-env JSON inspection. The first priority action and top-level current blocker both matched `Ignored local distribution env file is not loaded.`
- Passed: `npm run release:prepare-env`.
- Passed: placeholder-env `npm run release:next-actions`. It preserved `currentNextCommand: npm run release:doctor` and `currentFirstBlocker: Local distribution env still contains 21 placeholder keys.`
- Passed: `npm run verify`.

## Decision Log

- 2026-06-29: Chose to improve only the no-env first blocker because current command routing is already correct and the placeholder-env path already has the right specific blocker.
- 2026-06-29: Kept the missing-env blocker value-free and path-neutral; the report names the ignored local env posture without printing local env values.

## Status

- Completed.
