# plan-1380-private-input-ready-proof

## Goal

Prove the ready private input file path for release-channel metadata without recording private values. Once an operator replaces `.env.release-channel.local` placeholders with real values, the same receipt/preflight handoff should show the ready branch clearly and remain value-free.

## Scope

- Add a synthetic ready private-input-file receipt smoke for `npm run release:channel-placeholder-input-receipt`.
- Validate that the ready receipt has four loaded keys, zero missing/placeholder/invalid rows, a ready preflight, value-free file/line rows, and no local-env modification.
- Add the new smoke to `package.json`, `npm run verify`, docs, quality rules, and QA guard expectations.
- Run focused QA and actual Electron launch smoke before reporting completion.

## Non-Goals

- Do not write or infer real release URLs, support URLs, channel values, credentials, tokens, or Developer ID identities.
- Do not edit the user's real ignored `.env.release-channel.local` or `.env.distribution.local`.
- Do not probe networks, upload releases, publish feeds, sign artifacts, submit to Apple, or claim external distribution completion.
- Do not change the beat workstation composition workflow.

## Constraints

- Work on `codex/plan-1380-private-input-ready-proof` in `.worktree/plan-1380-private-input-ready-proof`.
- Keep release evidence value-free.
- QA and review are separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Inspect existing placeholder-input receipt smoke behavior.
- [x] Add ready private input receipt smoke behavior and validations.
- [x] Update scripts, docs, and QA guards.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed and create review mirror.
- [x] Merge to main, push, and report completion.

## QA Plan

- `npm run qa`
- `npm run release:channel-placeholder-input-receipt-ready-smoke`
- `npm run build`
- `npm run desktop:launch-smoke`
- `git diff --check`
- `npm run release:completion-summary-refresh-smoke`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Add a ready private-input receipt smoke because the current blocker is four placeholder rows in `.env.release-channel.local`; the final private edit path needs a value-free ready-branch proof before the operator supplies real values. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | project_lead | Started plan-1380 from clean main after plan-1379. Current completion is `99.999999%`; current 10-plan progress is `1371-1380: 9/10`; current blocker is four release-channel metadata placeholders in `.env.release-channel.local`. |
| 2026-07-05 | harness_builder | Added `npm run release:channel-placeholder-input-receipt-ready-smoke` to prove the synthetic ready private input file path with four shape-ready rows, preflight exit `0`, no real ignored env read/modify, no local env modification, and value-free output. |
| 2026-07-05 | quality_runner | Passed `node --check harness/scripts/run_release_channel_placeholder_input_receipt.mjs`, `npm run qa`, `npm run release:channel-placeholder-input-receipt-ready-smoke`, `npm run build`, approved-GUI `npm run desktop:launch-smoke`, and `git diff --check`. |
| 2026-07-05 | quality_runner | Attempted `npm run release:completion-summary-refresh-smoke` in the isolated worktree; it stopped because source release evidence was missing, then focused `npm run release:external-preflight` also stopped on missing project-IO release evidence. Final after-work completion refresh will run on `main` after merge. |
