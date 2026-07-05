# plan-1391-doctor-private-input-handoff

## Goal

Mirror the current release-channel private input handoff into the release doctor receipt, so the current next command exposes the ignored private input file target, template helper, preflight/apply/proof order, and value-free placeholder locations without requiring operators to open deeper packets.

## Scope

- Add release doctor top-level fields for private input template command/default path/file key, current private input placeholder location count/summary/rows, and operator preflight/apply/proof commands.
- Add Markdown and console output for the same handoff.
- Add self-checks and QA text expectations.
- Update durable docs for the doctor receipt.
- Run QA plus the required real Electron screen smoke.

## Non-Goals

- Do not edit `.env.release-channel.local` or `.env.distribution.local`.
- Do not record release URLs, support URLs, channel values, credentials, tokens, local env values, or private audio.
- Do not upload releases, publish feeds, probe distribution channels, sign artifacts, submit notarization, or claim external distribution completion.

## Constraints

- Work on `codex/plan-1391-doctor-private-input-handoff` in `.worktree/plan-1391-doctor-private-input-handoff`.
- Keep the receipt value-free and non-claiming.
- QA and review are separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Confirm the doctor handoff mirror gap.
- [x] Add release doctor private input handoff fields and checks.
- [x] Update QA/docs guards.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_doctor.mjs`
- `npm run release:doctor`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run release:source-evidence-prereq-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Improve the current `npm run release:doctor` handoff instead of editing private metadata, because the remaining release-channel values are operator-owned but the current next command should expose the exact value-free private input path and command order. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | quality_runner | Confirmed `main` is clean, no active plan exists, latest completion summary refresh reports plan-1390, `1381-1390: 10/10`, 99.999999% completion, source prereq 21/21, checkpoint ready, and the current blocker is four `.env.release-channel.local:6-9` release-channel metadata placeholders. |
| 2026-07-05 | harness_builder | Added release doctor private input handoff fields for the template helper, default path, input-file key, current private input file path/presence/loaded-key count, value-free placeholder rows, preflight/apply/proof-runner/strict-proof commands, Markdown output, console output, and self-checks. |
| 2026-07-05 | quality_runner | Passed `node --check harness/scripts/run_release_doctor.mjs`, `npm run release:doctor`, `npm run qa`, `npm run build`, `git diff --check`, `npm run desktop:launch-smoke`, and `npm run release:source-evidence-prereq-smoke` in the feature worktree. The real Electron screen smoke launched the production app, verified beginner/professional producer routes, Quick Actions, Command Reference, workstation controls, and screenshot pixels. |
| 2026-07-05 | quality_runner | `npm run release:completion-summary-refresh-smoke` was attempted in the isolated feature worktree and failed at `npm run release:proof-bundle` because only 4/21 source artifacts were present there. This is expected for the isolated worktree; rerun the completion refresh on `main` after merge where the full 21/21 source evidence exists. |
