# plan-1101-current-evidence-label-summary

## Goal

Make `npm run release:next-actions` surface a value-free current evidence label summary at the top level so operators can see which redacted evidence artifacts matter from the console without opening JSON or Markdown first.

## Scope

- Add top-level current evidence label fields to the external next-actions JSON.
- Show the current evidence label summary in Markdown and compact console output.
- Keep labels value-free and stable, with no private values or external distribution completion claims.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate bootstrap, no-env, and placeholder-env release next-actions paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected current evidence row summary fields and output.
2. Done: Added current evidence label summary fields to JSON, Markdown, and console output.
3. Done: Updated docs and QA expectations.
4. Done: Validated bootstrap, no-env, and placeholder-env release next-actions paths.
5. Done: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: bootstrap `npm run release:next-actions`; console output showed `Current evidence labels: 6`, and JSON confirmed the six current evidence labels matched the six current evidence rows with `privateValuesRecorded: false`.
- Passed: no-env `npm run verify`; final next-actions smoke selected `npm run release:prepare-env`, reported `Current evidence labels: 2 (Distribution private inputs, Distribution-channel QA)`, local env file loaded `no`, local release readiness `100.0%`, and no external distribution completion claim.
- Passed: no-env JSON inspection confirmed current evidence label count `2`, summary `Distribution private inputs, Distribution-channel QA`, labels matching evidence row labels, local env file loaded `false`, and `privateValuesRecorded: false`.
- Passed: `npm run release:prepare-env`; ignored `.env.distribution.local` scaffold was written without recording private values.
- Passed: placeholder-env `npm run release:next-actions`; current next command was `npm run release:doctor`, console output kept `Current evidence labels: 2 (Distribution private inputs, Distribution-channel QA)`, current env edit rows count was `4`, local env placeholder keys were `21`, and private values were not recorded.
- Passed: placeholder-env JSON inspection confirmed current evidence label count `2`, summary and labels matching evidence row labels, current env edit rows count `4`, local env file loaded `true`, local env placeholder keys `21`, and `privateValuesRecorded: false`.

## Decision Log

- 2026-06-29: Chose a label-summary improvement because the current terminal output showed the evidence row count but not the artifact labels that identify the next evidence files to inspect.

## Status

- Completed.
