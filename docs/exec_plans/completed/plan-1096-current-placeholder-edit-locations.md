# plan-1096-current-placeholder-edit-locations

## Goal

Make `npm run release:next-actions` show value-free edit locations and a compact checklist for the current placeholder-blocked release action.

The report named the four release-channel placeholder keys and the ignored env edit target, but an operator still had to open the file and search manually. This plan keeps private values out while making the current action easier to complete correctly.

## Scope

- Add value-free current placeholder edit locations for the current action when a local env file is loaded.
- Add a top-level current action checklist that combines edit target, placeholder keys, guidance, ready criteria, and rerun command without recording values.
- Include the same value-free edit-location/checklist details in priority action JSON and Markdown where relevant.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate bootstrap, no-env, placeholder-env, and QA paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected current placeholder reporting and local env parsing behavior.
2. Done: Added value-free current placeholder edit locations and current action checklist.
3. Done: Updated docs and QA expectations.
4. Done: Validated bootstrap, no-env, placeholder-env, and QA paths.
5. Done: Moved this plan to completed and created the review mirror; merge, push, branch deletion, and worktree cleanup follow after the plan commit.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: bootstrap `npm run release:next-actions`; source evidence was missing, current placeholder edit location count was `0`, and current action checklist count was `2`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: no-env `npm run verify`; final next-actions smoke selected `npm run release:prepare-env`, reported current placeholder edit locations `0`, current action checklist count `3`, and private values recorded `no`.
- Passed: post-fix no-env `npm run release:next-actions`; current action was `release-channel-metadata`, current next command was `npm run release:prepare-env`, current placeholder edit location count was `0`, current action checklist count was `3`, local env file loaded was `false`, and private values recorded was `false`.
- Passed: no-env JSON inspection confirmed the action checklist reruns `npm run desktop:distribution-private-inputs-smoke` after scaffold creation.
- Passed: `npm run release:prepare-env`, creating the ignored placeholder local env scaffold without recording private values.
- Passed: placeholder-env `npm run release:next-actions`; current action remained release-channel metadata, current next command changed to `npm run release:doctor`, current placeholder keys were `4`, current placeholder edit locations were `.env.distribution.local:10-13`, current action checklist count was `5`, local env placeholder keys were `21`, and private values recorded was `false`.
- Passed: placeholder-env JSON inspection confirmed current placeholder edit locations record only key, file, line, placeholder, and valueRecorded fields, with `valueRecorded: false` for all four current release-channel placeholders.
- Passed: final placeholder-env `npm run verify`; final next-actions smoke reported current placeholder edit location count `4`, current action checklist count `5`, local env placeholder keys `21`, private values recorded `no`, local release readiness `100.0%`, and no external distribution completion claim.
- Passed: final JSON inspection after verify confirmed current action `release-channel-metadata`, current next command `npm run release:doctor`, current placeholder edit location count `4`, current action checklist count `5`, local env placeholder locations `21`, private values recorded `false`, external distribution ready `false`, and local release readiness percent `100`.

## Decision Log

- 2026-06-29: Chose line-number/key-only edit locations because they make the current release-channel action easier to complete while avoiding private value capture.
- 2026-06-29: Added a compact current action checklist because the top-level current action should be directly executable without searching nested priority action details.
- 2026-06-29: Kept the current release-channel placeholder edit locations separate from the wider local env placeholder location count so operators can fix the active blocker first.

## Status

- Completed.
