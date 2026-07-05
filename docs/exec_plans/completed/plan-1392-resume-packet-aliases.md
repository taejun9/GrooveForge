# plan-1392-resume-packet-aliases

## Goal

Add explicit value-free JSON/Markdown/console aliases to the external completion resume packet so after-work reports and operator tooling can read the latest completed plan and guided setup next operator command without knowing deeper field names.

## Scope

- Add `latestCompletedPlan` and `latestCompletedPlanNumber` aliases that mirror the existing latest plan fields.
- Add `realSetupWizardNextOperatorCommand` as a direct alias for the setup wizard's next operator command after private input edits.
- Add self-checks and static QA expectations for those aliases.
- Update durable docs for the resume packet handoff.
- Run QA plus the required real Electron screen smoke.

## Non-Goals

- Do not edit `.env.release-channel.local` or `.env.distribution.local`.
- Do not record release URLs, support URLs, channel values, credentials, tokens, local env values, private input values, or private audio.
- Do not upload releases, publish feeds, probe distribution channels, sign artifacts, submit notarization, run the hard gate, or claim external distribution completion.

## Constraints

- Work on `codex/plan-1392-resume-packet-aliases` in `.worktree/plan-1392-resume-packet-aliases`.
- Keep the aliases value-free and non-claiming.
- QA and review are separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Confirm current alias gap from main evidence.
- [x] Add external completion resume packet aliases and checks.
- [x] Update QA/docs guards.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`
- `npm run release:external-completion-resume-packet-smoke -- --from-existing-run-packet`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run release:source-evidence-prereq-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Improve the resume packet alias surface instead of editing private metadata, because the remaining blocker is operator-owned private release-channel input but the evidence should expose direct value-free fields for reports and resume tooling. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | quality_runner | Confirmed `main` is clean, no active plan exists, latest completion summary refresh reports plan-1391, `1391-1400: 1/10`, 99.999999% completion, source prereq 21/21, and the current blocker is four `.env.release-channel.local:6-9` release-channel metadata placeholders. |
| 2026-07-05 | quality_runner | Confirmed the external completion resume packet has `latestPlan` and `realSetupWizardNextOperatorCommandAfterPrivateInputEdit`, but not direct `latestCompletedPlan` or `realSetupWizardNextOperatorCommand` aliases. |
| 2026-07-05 | harness_builder | Added `latestCompletedPlan`, `latestCompletedPlanNumber`, and `realSetupWizardNextOperatorCommand` aliases to the external completion resume packet, plus JSON self-checks, Markdown/console labels, static QA expectations, and durable docs. |
| 2026-07-05 | quality_runner | Passed `node --check harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`, `npm run qa`, `npm run build`, `git diff --check`, `npm run release:source-evidence-prereq-smoke`, and `npm run desktop:launch-smoke` in the feature worktree. The real Electron screen smoke launched the production app and verified beginner/professional producer routes, Quick Actions, Command Reference, workstation controls, and screenshot pixels. |
| 2026-07-05 | quality_runner | `npm run release:external-completion-resume-packet-smoke -- --from-existing-run-packet` was attempted in the isolated feature worktree and failed because the ignored external completion run packet artifact was absent there. Full resume packet and completion-summary-refresh validation are deferred to `main`, where the full 21/21 ignored source evidence exists. |
