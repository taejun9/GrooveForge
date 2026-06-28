# plan-1095-current-action-ready-criteria

## Goal

Make `npm run release:next-actions` show value-free ready criteria for the current priority action and every pending priority action.

The report now identifies blockers, required keys, placeholder keys, and key guidance. This plan adds value-free criteria that tell operators which evidence state proves each action is complete, without recording private values.

## Scope

- Add ready criteria for each pending priority action in external next-actions JSON, Markdown, and console summary.
- Mirror the first priority action's ready criteria into top-level current ready-criteria fields.
- Keep current next command, blocker, required key, placeholder key, key guidance, env edit target, operator action, and rerun command behavior intact.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate bootstrap, no-env, placeholder-env, and QA paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected current next-actions priority action fields and output.
2. Done: Added value-free ready criteria for current and priority actions.
3. Done: Updated docs and QA expectations.
4. Done: Validated bootstrap, no-env, placeholder-env, and QA paths.
5. Done: Moved this plan to completed and created the review mirror; merge, push, branch deletion, and worktree cleanup follow after the plan commit.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: bootstrap `npm run release:next-actions`; source evidence was missing, current ready criteria count was `2`, and the first action was `npm run release:check`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: no-env `npm run verify`; final next-actions smoke selected `npm run release:prepare-env`, reported current ready criteria count `3`, and generated `readyCriteria` for every pending priority action.
- Passed: no-env JSON inspection confirmed current action `release-channel-metadata`, current ready criteria count `3`, and ready criteria counts of `3` for release-channel, auto-update, Developer ID, notarization, Gatekeeper, manual QA, and final hard gate actions.
- Passed: `npm run release:prepare-env`, creating the ignored placeholder local env scaffold without recording private values.
- Passed: placeholder-env `npm run release:next-actions`; current action remained release-channel metadata, current next command changed to `npm run release:doctor`, current placeholder keys were `4`, current ready criteria count was `3`, local env placeholder keys were `21`, and private values recorded was `false`.
- Passed: placeholder-env JSON inspection confirmed current ready criteria count `3` and ready criteria counts of `3` for every pending priority action.
- Passed: final placeholder-env `npm run verify`; final next-actions smoke reported current ready criteria count `3`, current placeholder keys `4`, local env placeholder keys `21`, private values recorded `no`, and no external distribution completion claim.
- Passed: final `git diff --check`.
- Passed: final `python3 -B harness/scripts/run_qa.py`.

## Decision Log

- 2026-06-29: Chose ready criteria rather than example values so external release values, credentials, channel labels, and approval signals stay out of committed files and generated reports.
- 2026-06-29: Mirrored the first priority action's ready criteria into top-level current ready-criteria fields so console, Markdown, and JSON reports tell operators what done means for the current action without making them inspect lower-level evidence files.

## Status

- Completed.
