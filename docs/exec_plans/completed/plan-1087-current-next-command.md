# plan-1087-current-next-command

## Goal

Make `npm run release:next-actions` expose the immediate next command and first blocker at the top level.

The report already contains prioritized action rows, but the operator still has to inspect the first action details to find the command to run next. The compact next-actions report should surface `currentNextCommand`, `currentFirstBlocker`, and current action metadata in JSON, Markdown, and console output while remaining value-free.

## Scope

- Add top-level current action summary fields to external next-actions JSON.
- Add current next command and first blocker to the external next-actions Markdown status block and console output.
- Keep bootstrap, missing-local-env, and placeholder-local-env paths value-free.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.

## Out of Scope

- Filling private release values, credentials, URLs, tokens, channel metadata, Developer ID identity labels, or approval values.
- Developer ID signing, Apple notarization submission, stapling, Gatekeeper approval, release upload, remote feed publishing, remote probing, manual QA approval, or claiming external distribution completion.
- Product UI, sampling/import features, project data model, or beat authoring behavior.

## Plan

1. Done: Implement top-level current next-command reporting in `run_release_next_actions.mjs`.
2. Done: Update docs and QA expectations.
3. Done: Run targeted no-env and placeholder-env next-actions validation.
4. Done: Run full verification.
5. Done: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:next-actions` in a clean source-evidence-missing/bootstrap path. It surfaced `currentNextCommand: npm run release:check`, mirrored the first priority action, and recorded no private values.
- Passed: `npm run release:prepare-env`.
- Passed: `npm run verify`.
- Passed: placeholder-env `npm run release:next-actions-smoke` inside `npm run verify`. It surfaced `currentNextCommand: npm run release:doctor` and `currentFirstBlocker: Local distribution env still contains 21 placeholder keys.`
- Passed: placeholder-env `npm run release:next-actions` operator command after verification. It surfaced `currentNextCommand: npm run release:doctor`, mirrored `release-channel-metadata`, and recorded no private values.

## Decision Log

- 2026-06-29: Chose to summarize the first priority action rather than invent a new command, because the existing action ordering already encodes the operator priority.
- 2026-06-29: Kept the current action summary value-free by exposing only action ids, labels, key names, commands, and blockers already present in redacted remediation evidence.

## Status

- Completed.
