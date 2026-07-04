# plan-1382-source-evidence-refresh-chain

## Goal

Add a value-free release source evidence refresh chain so the remaining external release proof can regenerate the local source artifacts behind `release:source-evidence-prereq-smoke` and prove the 21-artifact prerequisite map is current without running uploads, network distribution probes, Apple notarization submission, or recording private values.

## Scope

- Add `npm run release:source-evidence-refresh-smoke`.
- Run the local-only packaging, manifest, support/update/signing-readiness, completion, external runbook, proof-bundle, and source prerequisite smokes in dependency order.
- Write a Markdown/JSON receipt with command rows, exit statuses, final source artifact coverage, current blocker, operator commands, and value-free/no-claim posture.
- Update package scripts, docs, and QA command coverage.
- Run focused QA plus actual Electron launch smoke before reporting completion.

## Non-Goals

- Do not edit `.env.release-channel.local`, `.env.distribution.local`, or any operator-owned private input.
- Do not infer, print, or store real release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identity labels, or private audio.
- Do not sign with Developer ID unless an operator-owned identity is already configured through existing smokes.
- Do not submit to Apple notarization, upload release artifacts, publish update feeds, probe distribution channels, approve manual QA, or claim external distribution completion.

## Constraints

- Work on `codex/plan-1382-source-evidence-refresh-chain` in `.worktree/plan-1382-source-evidence-refresh-chain`.
- Keep all release evidence value-free.
- QA and review are separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Inspect existing source evidence prerequisite behavior and release evidence command dependencies.
- [x] Add source evidence refresh chain smoke and receipt validation.
- [x] Update scripts, docs, and QA guards.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_source_evidence_refresh_smoke.mjs`
- `npm run qa`
- `npm run release:source-evidence-refresh-smoke`
- `npm run release:source-evidence-prereq-smoke`
- `npm run build`
- `npm run desktop:launch-smoke`
- `git diff --check`
- `npm run release:completion-summary-refresh-smoke`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Add a narrow source evidence refresh chain because plan-1381 exposed the 21-artifact prerequisite map, but the current checkout still reports 13 missing local source artifacts unless the heavier release evidence chain is run first. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | project_lead | Started plan-1382 from clean main after plan-1381. Current completion is `99.999999%`; current 10-plan progress is `1381-1390: 1/10`; current blocker is four release-channel metadata placeholders in `.env.release-channel.local`. |
| 2026-07-05 | harness_builder | Added `npm run release:source-evidence-refresh-smoke` to regenerate the local-only build/package/project-IO/release manifest/support/update/signing-readiness/completion/external runbook/proof-bundle evidence chain, force `GROOVEFORGE_NOTARY_SUBMIT=0`, clean generated intermediates, then require `release:source-evidence-prereq-smoke` to report `21/21` source artifacts and zero missing rows. |
| 2026-07-05 | quality_runner | Passed `node --check harness/scripts/run_release_source_evidence_refresh_smoke.mjs`, `npm run qa`, `npm run release:source-evidence-refresh-smoke`, `npm run release:source-evidence-prereq-smoke`, `npm run build`, approved-GUI `npm run desktop:launch-smoke`, and `git diff --check`. The real Electron launch smoke rendered the workstation and verified first-time composer, professional producer, Quick Actions, starter, command reference, route bridge, readiness, completion, and export-control paths. |
| 2026-07-05 | quality_runner | Reserved `npm run release:completion-summary-refresh-smoke` for the post-merge main worktree so after-work reporting uses the maintained ignored release evidence and the latest completed-plan count. |
