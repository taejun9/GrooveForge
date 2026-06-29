# plan-1130-release-proof-current-env-summary

## Goal

Make the value-free external proof bundle and release progress report show the current env/placeholder remediation summary for the active external-distribution blocker, so the operator can see the required keys, placeholder keys, edit target, edit row counts, remediation row counts, proof checklist counts, command sequence counts, rerun command, and hard gate without opening multiple artifacts.

## Scope

- Read the current release-channel metadata fields already produced by `release:next-actions`.
- Surface current required key count/names, placeholder key count/names, placeholder edit location count/summary, env edit target, env edit template count/summary, env edit row count/summary, placeholder remediation row count/summary, proof checklist row count/summary, action checklist count/summary, command sequence count/summary, rerun command, and command verification summary in the external proof bundle JSON/Markdown/console output.
- Mirror the compact current env summary into `npm run release:progress` JSON/Markdown/console output from the proof bundle.
- Keep every field value-free: key names, counts, paths, and assignment shapes only; no release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Filling or editing `.env.distribution.local` private values.
- Uploading releases, probing remote channels, Developer ID signing, Apple notarization submission, Gatekeeper approval, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, optional sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect current `release:next-actions`, proof bundle, release progress, and QA contracts for current env summary fields.
2. Add the current env/placeholder remediation summary to the external proof bundle.
3. Mirror the compact current env summary into release progress.
4. Update docs and QA expectations.
5. Run focused checks and repository validation.
6. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_external_proof_bundle.mjs`
- Passed: `node --check harness/scripts/run_release_progress_report.mjs`
- Passed: `npm run qa`
- Passed: `npm run release:proof-bundle-smoke`
- Passed: `npm run desktop:packaged-project-io-smoke` after the first full `release:progress` run hit a transient packaged project IO timeout.
- Passed: `npm run release:progress` outside the sandbox because it runs Electron hidden-window launch smoke.
- Passed: `git diff --check`
- Passed: JSON spot-check for proof bundle and release progress current env summary fields: proof bundle ready, release progress ready, current required keys `4`, placeholder keys `0`, env edit target `.env.distribution.local`, env edit rows `4`, proof checklist rows `3`, command sequence `4`, command verification rows `4`, and value-recorded booleans false.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add current env summary to proof/progress instead of storing values. | The first remaining external blocker is operator-owned release-channel metadata; reports should show exactly what needs editing without recording secrets. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added value-free current env/placeholder summary fields to external proof bundle and release progress. |
| 2026-06-29 | doc_gardener | Updated README, release readiness, harness architecture, quality rules, and QA expectations. |
| 2026-06-29 | quality_runner | Ran focused checks and full release progress; reran packaged project IO after a transient timeout and confirmed the full gate passes. |
