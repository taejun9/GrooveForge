# plan-1102-current-command-summary

## Goal

Make `npm run release:next-actions` surface value-free current prerequisite and rerun command summaries at the top level so operators can see the exact command sequence for the current external-distribution blocker from the console and status section.

## Scope

- Add top-level current prerequisite command count/summary fields to the external next-actions JSON.
- Add top-level current rerun command count/summary fields to the external next-actions JSON.
- Show those command summaries in Markdown and compact console output.
- Keep command reporting value-free and aligned with the first priority action.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate bootstrap, no-env, and placeholder-env release next-actions paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected existing current command fields and release next-actions output.
2. Done: Added current prerequisite and rerun command summaries to JSON, Markdown, console output, and validation.
3. Done: Updated docs and QA expectations.
4. Done: Validated bootstrap, no-env, and placeholder-env release next-actions paths.
5. Pending: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: bootstrap `npm run release:next-actions`; console output showed `Current prerequisite commands: 0 (none)` and `Current rerun commands: 2 (npm run release:check, npm run release:next-actions)`.
- Passed: bootstrap JSON inspection confirmed prerequisite/rerun command counts matched arrays and `privateValuesRecorded: false`.
- Passed: no-env `npm run verify`; final next-actions smoke selected `npm run release:prepare-env`, reported `Current prerequisite commands: 3`, `Current rerun commands: 2`, local env file loaded `no`, local release readiness `100.0%`, and no external distribution completion claim.
- Passed: no-env JSON inspection confirmed prerequisite/rerun command counts matched arrays and `privateValuesRecorded: false`.
- Passed: `npm run release:prepare-env`; ignored `.env.distribution.local` scaffold was written without recording private values.
- Passed: placeholder-env `npm run release:next-actions`; current next command was `npm run release:doctor`, console output showed `Current prerequisite commands: 2` and `Current rerun commands: 3`, local env file loaded `yes`, local env placeholder keys `21`, and private values were not recorded.
- Passed: placeholder-env JSON inspection confirmed prerequisite/rerun command counts matched arrays, local env placeholder key count `21`, and `privateValuesRecorded: false`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Surface current command summaries before external-distribution private values are filled. | The JSON already carries current prerequisite and rerun command arrays, but the operator-facing top summary does not show command counts/summaries, which leaves the current sequence less obvious from the console. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | quality_runner | QA passed for syntax, whitespace, base QA, bootstrap next-actions, full no-env verify, prepare-env, and placeholder next-actions. |
