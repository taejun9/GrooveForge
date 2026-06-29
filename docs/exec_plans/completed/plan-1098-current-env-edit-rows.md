# plan-1098-current-env-edit-rows

## Goal

Make `npm run release:next-actions` show value-free current env edit rows that combine edit target, file line, key, assignment shape, guidance, and placeholder status for the active release action.

The report now surfaces edit locations and env assignment templates separately. Operators can still make mistakes when combining those two lists manually. This plan keeps private values out while making the current release-channel edit list directly scannable row by row.

## Scope

- Add top-level current env edit row fields to external next-actions JSON.
- Add the same value-free edit rows to priority action details where private env keys are required.
- Show current env edit rows in Markdown and compact console output.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate bootstrap, no-env, placeholder-env, and QA paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected current next-actions edit-location and template output.
2. Done: Added value-free env edit rows for current and priority actions.
3. Done: Updated docs and QA expectations.
4. Done: Validated bootstrap, no-env, placeholder-env, and QA paths.
5. Done: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: bootstrap `npm run release:next-actions`; source evidence was missing, current next command was `npm run release:check`, current env edit rows count was `0`, and private values were not recorded.
- Passed: no-env `npm run verify`; final next-actions smoke selected `npm run release:prepare-env`, reported current env edit rows `4`, local env file loaded `no`, local env placeholder keys `0`, local release readiness `100.0%`, and no external distribution completion claim.
- Passed: no-env JSON inspection confirmed four scaffold-pending env edit rows with `.env.distribution.local:line-after-scaffold`, `line: null`, `locationKnown: false`, `placeholder: false`, assignment shape, guidance, and `valueRecorded: false`.
- Passed: `npm run release:prepare-env`; ignored `.env.distribution.local` scaffold was written without recording private values.
- Passed: placeholder-env `npm run release:next-actions`; current next command was `npm run release:doctor`, current placeholder edit locations were `.env.distribution.local:10-13`, current env edit rows count was `4`, local env placeholder keys were `21`, and private values were not recorded.
- Passed: placeholder-env JSON inspection confirmed four current env edit rows with lines `10-13`, `locationKnown: true`, `placeholder: true`, assignment shape, guidance, and `valueRecorded: false`.
- Passed after retry: placeholder-env `npm run verify`; the first run hit a transient `hdiutil attach` resource conflict at DMG mount, a stale `/dev/disk4` image was detached, and the rerun passed through final `release:next-actions-smoke` with current env edit rows `4`, local env placeholder keys `21`, local release readiness `100.0%`, and no external distribution completion claim.
- Passed: final placeholder-env JSON inspection confirmed current action `release-channel-metadata`, current next command `npm run release:doctor`, current env edit rows count `4`, local env file loaded `true`, local env placeholder keys `21`, private values recorded `false`, external distribution ready `false`, and local release readiness percent `100`.

## Decision Log

- 2026-06-29: Chose row-level value-free edit guidance because it reduces manual translation between location and assignment-template lists without recording any private value.

## Status

- Completed.
