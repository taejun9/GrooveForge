# plan-1128-release-proof-bundle

## Goal

Add a value-free external proof bundle report that lists the exact local evidence artifacts and hard-gate posture an operator must review before attempting external distribution completion.

## Scope

- Add a release proof bundle script and npm commands that read existing release doctor, external preflight, next-actions, operator runbook, readiness ledger, completion status, remediation, and hard-gate artifacts.
- Write ignored Markdown/JSON proof bundle artifacts under `build/desktop/` with artifact labels, paths, presence, readiness booleans, first blockers, next command, and hard gate command.
- Keep all proof bundle rows value-free: no release URLs, support URLs, feed URLs, credentials, tokens, channel values, Developer ID identity labels, private beats, or real user audio.
- Update README, release readiness, harness architecture, quality rules, and QA expectations for the proof bundle contract.

## Out of Scope

- Filling `.env.distribution.local` values.
- Uploading releases, probing remote channels, Developer ID signing, Apple notarization submission, Gatekeeper approval, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Completed Work

1. Added `harness/scripts/run_release_external_proof_bundle.mjs`.
2. Added `npm run release:proof-bundle` and `npm run release:proof-bundle-smoke`, with the smoke included in `npm run verify`.
3. Added value-free proof artifact rows, gate requirement rows, current first blocker, current next command, current command verification row count/summary, local env loader posture, and hard gate command output.
4. Updated README, release readiness, harness architecture, quality rules, and QA expectations.
5. Fixed desktop-wide evidence artifact paths so the full proof bundle reports `21/21` proof artifacts present after release evidence is generated.

## QA

- Passed: `node --check harness/scripts/run_release_external_proof_bundle.mjs`
- Passed: `npm run qa`
- Passed: `npm run release:doctor`
- Passed: `npm run release:next-actions`
- Passed: `npm run release:proof-bundle`
- Passed: `npm run release:proof-bundle-smoke`
- Passed: `npm run verify`
- Passed: `git diff --check`
- Passed: JSON spot-check for release proof bundle rows (`21/21` artifacts present, hard gate `npm run release:external-check`, all rows `valueRecorded: false`).

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add a value-free release proof bundle instead of collecting private values. | The remaining completion blocker is external proof, so the next useful local step is to make the exact proof bundle visible without storing secrets or claiming distribution completion. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added the release proof bundle script, package scripts, docs, and QA expectations. |
| 2026-06-29 | quality_runner | Verified bootstrap proof bundle, generated-evidence proof bundle, full verify, and JSON spot-check. |
