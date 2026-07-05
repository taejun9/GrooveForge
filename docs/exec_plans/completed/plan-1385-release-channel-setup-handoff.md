# plan-1385-release-channel-setup-handoff

## Goal

Make the release-channel setup wizard a clearer value-free handoff for the remaining four private release-channel metadata inputs, so the operator can edit `.env.release-channel.local`, run preflight/apply/proof commands, and reach the next release proof step without guessing from separate reports.

## Scope

- Add value-free summary fields and Markdown/console guidance to `npm run release:channel-setup-wizard`.
- Keep private release URL, support URL, channel values, credentials, tokens, Developer ID identities, and local env values out of JSON, Markdown, and console output.
- Preserve process env and ignored private input file input paths.
- Update QA guards and durable docs for the wizard handoff contract.
- Run focused release-channel checks plus the required real Electron screen smoke.

## Non-Goals

- Do not edit `.env.release-channel.local` or `.env.distribution.local`.
- Do not invent or record release URLs, support URLs, channel values, credentials, tokens, Developer ID identities, or private audio.
- Do not upload releases, publish feeds, probe distribution channels, sign artifacts, submit to Apple notarization, or claim external distribution completion.

## Constraints

- Work on `codex/plan-1385-release-channel-setup-handoff` in `.worktree/plan-1385-release-channel-setup-handoff`.
- Keep all release setup evidence value-free.
- QA and review are separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Confirm current setup wizard output and remaining release blocker.
- [x] Add wizard handoff summary fields, Markdown, console output, and self-checks.
- [x] Update QA/docs guards.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_channel_setup_wizard.mjs`
- `npm run release:channel-setup-wizard`
- `npm run release:channel-setup-wizard-success-smoke`
- `npm run release:channel-setup-wizard-input-file-success-smoke`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Improve the setup wizard rather than fabricating private release metadata. The app is functionally ready, but the final external completion proof is blocked by four user-owned release-channel values. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | quality_runner | Confirmed current completion summary reports plan-1384, 99.999999% completion, and first blocker as four release-channel placeholder keys at `.env.release-channel.local:6-9`. |
| 2026-07-05 | quality_runner | Ran `npm run release:channel-setup-wizard`; it safely failed with no private values recorded, but the next edit/proof handoff is split across summary text and tables. |
| 2026-07-05 | harness_builder | Added value-free setup wizard Operator Handoff rows, next private input edit target summaries, next preflight command output, and self-checks for the six-row command chain. |
| 2026-07-05 | harness_builder | Updated QA text guards plus release readiness, harness architecture, and quality rules for the new setup wizard handoff contract. |
| 2026-07-05 | quality_runner | `node --check harness/scripts/run_release_channel_setup_wizard.mjs`, `npm run release:channel-setup-wizard-success-smoke`, and `npm run release:channel-setup-wizard-input-file-success-smoke` passed. |
| 2026-07-05 | quality_runner | `npm run release:channel-setup-wizard` returned the expected blocked exit in the isolated worktree while showing six Operator Handoff rows, next edit targets, and no private values. |
| 2026-07-05 | quality_runner | `npm run qa`, `git diff --check`, `npm run build`, and `npm run desktop:launch-smoke` passed; the desktop smoke exercised the live production Electron app screen, Command Reference, Quick Actions handoff, beginner, producer, and workstation paths. |
