# plan-1400-completion-crash-regression-aliases

## Objective

Mirror the desktop crash-report regression smoke into the after-work completion summary refresh so the user-facing completion receipt directly proves the attached AppKit abort and Squirrel dyld report classes remain covered.

## Scope

- Run `npm run desktop:crash-report-regression-smoke` inside the completion-summary refresh command sequence before release progress evidence is refreshed.
- Add value-free completion-summary aliases for crash-report regression readiness, AppKit report classification, Squirrel dyld report classification, stale-worktree Squirrel dyld classification, restricted GUI preflight readiness, row counts, and artifact paths.
- Preserve private-value redaction, no network/upload/signing/notary behavior, and external-distribution non-claim posture.
- Update QA expectations and release/harness docs.
- Prove the actual app still launches through the real Electron screen test before completion reporting.

## Changes

- Added `npm run desktop:crash-report-regression-smoke` as the first required command inside `npm run release:completion-summary-refresh-smoke`.
- Mirrored the crash regression JSON artifact, command, readiness, row counts, AppKit abort classification, Squirrel dyld classification, stale-worktree Squirrel dyld classification, restricted GUI preflight readiness, and value-free/no-network/no-signing/no-notary guards into the completion-summary refresh receipt.
- Added Markdown and console readout lines so after-work reports can cite the attached crash report coverage without reading raw crash logs.
- Updated QA static expectations and release/harness docs for the new refresh order and receipt fields.

## Validation

- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- `git diff --check`
- `npm run desktop:crash-report-regression-smoke`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke` with approved macOS GUI/AppKit access; passed with renderer `1440x928`, screenshot `2880x1856`, `75` sampled colors, and beginner/professional producer route evidence.
- `npm run release:source-evidence-refresh-smoke` with approved macOS GUI/AppKit access after the sandboxed run correctly stopped at the restricted GUI preflight; passed with source artifacts `21/21`.
- `npm run release:completion-summary-refresh-smoke`; passed before completion move with latest completed plan `plan-1399`, crash regression rows `15/15`, AppKit abort classification `yes`, Squirrel dyld classification `yes`, stale-worktree Squirrel dyld classification `yes`, restricted GUI preflight readiness `yes`, and source artifacts `21/21`.
- `npm run release:completion-summary-refresh-smoke`; passed after completion move with latest completed plan `plan-1400`, 10-plan progress `1391-1400: 10/10`, checkpoint required/run/status `yes`/`yes`/`ready`, crash regression rows `15/15`, AppKit abort classification `yes`, Squirrel dyld classification `yes`, stale-worktree Squirrel dyld classification `yes`, restricted GUI preflight readiness `yes`, and source artifacts `21/21`.

## Decision Log

- Started after plan-1399 completed the operator brief alias path. The current completion receipt reports `plan-1399`, `1391-1400: 9/10`, and 99.999999% completion, while the user-provided crash reports are covered by a dedicated smoke but not directly visible in the final after-work receipt.
- Chose to make the completion-summary refresh run crash regression before progress refresh so the final after-work receipt cannot report completion without also proving the two attached crash classes are still covered.
- Kept the crash regression receipt value-free and sanitized: it records classification booleans and row counts, not full crash reports, user paths, private values, network activity, signing, notarization, uploads, or external distribution claims.
