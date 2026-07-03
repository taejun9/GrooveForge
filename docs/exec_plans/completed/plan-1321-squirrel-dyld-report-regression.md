# plan-1321-squirrel-dyld-report-regression

## Goal

Turn the attached macOS launch crash report for `@rpath/Squirrel.framework/Squirrel` into explicit regression evidence, so the packaged app cannot silently return to a missing or signature-incompatible Squirrel framework state.

## Scope

- Add or tighten value-free crash-report regression coverage for the Squirrel dyld launch failure shape in the attached report.
- Confirm packaged app framework dependency evidence still requires Squirrel to be present, code-signed, signature-compatible, and dyld-loadable.
- Keep the fix local to harness regression evidence unless inspection finds an actual package assembly defect in current main.

## Non-Goals

- Do not change app UI, audio behavior, project schema, release metadata, private env values, signing identities, notarization credentials, Gatekeeper claims, uploads, or external distribution claims.
- Do not store user-specific local paths from the crash report in tracked artifacts.

## Validation

- [x] `node --check harness/scripts/run_desktop_crash_report_regression_smoke.mjs`
- [x] `npm run desktop:crash-report-regression-smoke`
- [x] `npm run build`
- [x] `npm run desktop:package-smoke`
- [x] `npm run desktop:launch-smoke`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:check`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after reading the attached crash report. The report is a macOS DYLD launch abort for `Library not loaded: @rpath/Squirrel.framework/Squirrel`; current release validation already passes package and launch checks, but the exact crash shape should remain covered as regression evidence.
- 2026-07-03: Added a sanitized code-signature variant of the attached Squirrel dyld report to `desktop:crash-report-regression-smoke`. Package smoke confirmed framework dependencies `3/3` present, code-signed, signature-compatible, and dyld-loadable; live launch smoke confirmed the production Electron app starts without the attached crash.
- 2026-07-03: Ran full `npm run release:check` after the first completion-summary refresh correctly reported missing source evidence in the new worktree. The full check passed, then completion summary refresh passed with latest completed plan `plan-1321`, `1321-1330: 1/10`, completion `99.999999%`, and remaining `0.000001%`.
