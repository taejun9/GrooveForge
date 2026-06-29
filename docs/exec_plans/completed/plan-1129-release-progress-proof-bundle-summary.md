# plan-1129-release-progress-proof-bundle-summary

## Goal

Make `npm run release:progress` include the current value-free external proof bundle summary, so completion reports can cite proof artifact coverage, hard-gate posture, current next command, and first blocker from the same operator evidence bundle.

## Scope

- Read the ignored external proof bundle JSON from the release progress report after `npm run release:check` regenerates release evidence.
- Surface proof bundle readiness, proof artifact count/present/missing summary, gate requirement ready/blocked counts, current next command, current first blocker, current command verification row summary, and hard gate command in release progress JSON, Markdown, console output, and self-checks.
- Keep the release progress report value-free and avoid recording release URLs, support URLs, feed URLs, credentials, tokens, channel values, Developer ID identity labels, private beats, or real user audio.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Filling `.env.distribution.local` values.
- Uploading releases, probing remote channels, Developer ID signing, Apple notarization submission, Gatekeeper approval, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect release progress and proof bundle artifact contracts.
2. Add proof bundle summary fields to release progress JSON, Markdown, console output, and validations.
3. Update README, release readiness, harness architecture, quality rules, and QA expectations.
4. Run focused release progress/proof bundle checks and repository validation.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_progress_report.mjs`
- Passed: `npm run qa`
- Passed: `npm run release:proof-bundle-smoke`
- Passed: `npm run desktop:launch-smoke` outside the sandbox after sandboxed Electron launch aborted with `SIGABRT`.
- Passed: `npm run release:progress` outside the sandbox because it runs the Electron hidden-window launch smoke.
- Passed: `git diff --check`
- Passed: JSON spot-check for release progress proof bundle fields: release progress ready, proof bundle ready, proof artifacts `21/21`, proof gate `9/16`, blocked `7`, current next command `npm run release:prepare-env`, first blocker `Ignored local distribution env file is not loaded.`, hard gate `npm run release:external-check`, and value/claim booleans false.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add proof bundle summary to release progress instead of claiming completion. | The remaining completion blocker is external proof; progress reports should show exactly which proof bundle and hard-gate blockers remain without storing secrets. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added external proof bundle summary fields to the release progress JSON, Markdown, console output, and self-checks. |
| 2026-06-29 | doc_gardener | Updated README, harness architecture, release readiness, quality rules, and QA expectations. |
| 2026-06-29 | quality_runner | Ran focused checks and full `release:progress`; sandboxed Electron launch aborted, but the same launch smoke and full release progress passed outside the sandbox. |
