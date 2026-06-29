# plan-1099-current-evidence-rows

## Goal

Make `npm run release:next-actions` surface value-free current evidence rows for the active release action so the operator can jump from the current blocker to the exact redacted evidence artifacts without digging through priority action details.

The current next-actions report already listed priority action evidence, but the compact top-level current action summary did not expose those evidence rows directly. This plan keeps private values out while making the current blocker more traceable.

## Scope

- Add top-level current evidence row fields to the external next-actions JSON.
- Show current evidence rows in Markdown and compact console output.
- Mirror the first priority action's evidence rows into current fields.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate bootstrap, release-channel, and QA paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected current next-actions evidence fields and output.
2. Done: Added top-level current evidence rows to JSON, Markdown, and console output.
3. Done: Updated docs and QA expectations.
4. Done: Validated bootstrap, release-channel, and QA paths.
5. Done: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: bootstrap `npm run release:next-actions`; source evidence was missing, current next command was `npm run release:check`, current evidence rows count was `6`, and private values were not recorded.
- Passed: bootstrap JSON inspection confirmed six current evidence rows for source evidence paths, with each row carrying label/path/presence and `valueRecorded: false`.
- Passed: no-env `npm run verify`; final next-actions smoke selected `npm run release:prepare-env`, reported current evidence rows `2`, current env edit rows `4`, local env file loaded `no`, local env placeholder keys `0`, local release readiness `100.0%`, and no external distribution completion claim.
- Passed: no-env JSON inspection confirmed current action `release-channel-metadata`, current next command `npm run release:prepare-env`, two current evidence rows, and `privateValuesRecorded: false`.
- Passed: `npm run release:prepare-env`; ignored `.env.distribution.local` scaffold was written without recording private values.
- Passed: placeholder-env `npm run release:next-actions`; current next command was `npm run release:doctor`, current placeholder edit locations were `.env.distribution.local:10-13`, current evidence rows count was `2`, current env edit rows count was `4`, local env placeholder keys were `21`, and private values were not recorded.
- Passed: placeholder-env JSON inspection confirmed two current evidence rows for distribution private inputs and distribution channel QA artifacts, with `valueRecorded: false`.
- Passed: placeholder-env `npm run verify`; final `release:next-actions-smoke` reported current evidence rows `2`, current env edit rows `4`, local env placeholder keys `21`, local release readiness `100.0%`, and no external distribution completion claim.

## Decision Log

- 2026-06-29: Chose top-level current evidence rows because the remaining external distribution work is operator-owned and benefits from direct, value-free traceability to redacted artifacts.

## Status

- Completed.
