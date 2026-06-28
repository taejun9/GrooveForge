# plan-1097-current-env-edit-template

## Goal

Make `npm run release:next-actions` show a value-free current env edit template for the active release action.

The report showed current placeholder keys, file/line edit locations, key guidance, ready criteria, and an action checklist. Operators still had to translate that into env assignment lines. This plan adds copyable, value-free assignment templates so the current action can be edited without searching docs or exposing private values.

## Scope

- Add top-level current env edit template fields to external next-actions JSON.
- Add the same value-free assignment template to priority action details where private env keys are required.
- Show the current env edit template in Markdown and compact console output.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate bootstrap, no-env, placeholder-env, and QA paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected current next-actions template/guidance output.
2. Done: Added value-free env assignment templates for current and priority actions.
3. Done: Updated docs and QA expectations.
4. Done: Validated bootstrap, no-env, placeholder-env, and QA paths.
5. Done: Moved this plan to completed and created the review mirror; merge, push, branch deletion, and worktree cleanup follow after the plan commit.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: bootstrap `npm run release:next-actions`; source evidence was missing, current env edit template count was `0`, and current action remained `npm run release:check`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: no-env `npm run verify`; final next-actions smoke selected `npm run release:prepare-env`, reported current env edit template count `4`, current placeholder edit locations `0`, local env file loaded `no`, private values recorded `no`, and no external distribution completion claim.
- Passed: no-env JSON inspection confirmed current action `release-channel-metadata`, current next command `npm run release:prepare-env`, four value-free assignments for the current release-channel keys, `valueRecorded: false` for every template row, and private values recorded `false`.
- Passed: `npm run release:prepare-env`, creating the ignored placeholder local env scaffold without recording private values.
- Passed: placeholder-env `npm run release:next-actions`; current action remained release-channel metadata, current next command changed to `npm run release:doctor`, current placeholder edit locations were `.env.distribution.local:10-13`, current env edit template count was `4`, current action checklist count was `5`, local env placeholder keys were `21`, and private values recorded was `false`.
- Passed: placeholder-env JSON inspection confirmed current env edit templates record only key, placeholder, assignment, guidance, and `valueRecorded: false`, and that every priority action with required keys has matching value-free template coverage.
- Passed: final placeholder-env `npm run verify`; final next-actions smoke reported current env edit template count `4`, current placeholder edit location count `4`, local env placeholder keys `21`, private values recorded `no`, local release readiness `100.0%`, and no external distribution completion claim.
- Passed: final JSON inspection after verify confirmed current action `release-channel-metadata`, current next command `npm run release:doctor`, current env edit template count `4`, current placeholder edit location count `4`, local env placeholder locations `21`, private values recorded `false`, external distribution ready `false`, and local release readiness percent `100`.
- Passed: final `git diff --check`.
- Passed: final `python3 -B harness/scripts/run_qa.py`.
- Passed: final `node --check harness/scripts/run_release_next_actions.mjs`.

## Decision Log

- 2026-06-29: Chose value-free assignment templates because they reduce operator translation work while keeping all private values outside committed files and generated reports.
- 2026-06-29: Kept assignment templates in ignored report artifacts rather than writing or patching `.env.distribution.local`, because the operator must still supply private values deliberately.
- 2026-06-29: Mirrored the first priority action's env edit template into top-level current fields so the compact console/Markdown/JSON path remains focused on the current release blocker.

## Status

- Completed.
