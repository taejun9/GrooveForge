# plan-1318-crash-report-dyld-regression

## Goal

Turn the user-provided macOS crash reports into deterministic release evidence so the Squirrel dyld launch crash and AppKit restricted-GUI abort class stay directly covered by current package and launch checks.

## Scope

- Add a value-free crash-report regression smoke that reads representative report text and classifies the reported failure classes without storing user paths or private values.
- Prove the latest `@rpath/Squirrel.framework/Squirrel` dyld report maps to the existing packaged bundle dependency guard requirements.
- Prove the earlier Electron/AppKit `SIGABRT` report maps to the shared GUI launch guard diagnostic instead of being mistaken for a renderer/runtime bug.
- Wire the new smoke into QA/static expectations and release documentation so future completion reports can cite it.
- Keep the work local-first and do not claim Developer ID signing, notarization, Gatekeeper approval, external distribution, uploads, private release URLs, credentials, tokens, or user audio.

## Non-Goals

- Do not copy full crash reports into the repository.
- Do not edit `.env.distribution.local` or require private release-channel values.
- Do not change Electron version, packaging format, product UI, audio behavior, project schema, export semantics, or composition-first scope unless investigation proves it is required.
- Do not run remote network probes, Apple notarization, release uploads, or external distribution gates as completion claims.

## Validation

- [x] `node --check harness/scripts/run_desktop_crash_report_regression_smoke.mjs`
- [x] `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- [x] `npm run desktop:crash-report-regression-smoke`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run build`
- [x] `npm run desktop:smoke`
- [x] `npm run desktop:package-smoke`
- [x] `npm run desktop:adhoc-sign-smoke`
- [x] `npm run desktop:launch-smoke`
- [x] `npm run release:check`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after reviewing the user's latest attached GrooveForge crash report with `Termination Reason: Namespace DYLD, Code 1, Library missing` for `@rpath/Squirrel.framework/Squirrel`. Existing plans strengthened package and signing guards, but the report text itself was not a current regression input, so future evidence could drift away from the exact crash signature.
- 2026-07-03: Added `desktop:crash-report-regression-smoke` with sanitized representative crash shapes only. The smoke classifies the Squirrel dyld `Namespace DYLD, Code 1, Library missing` report, maps it to bundle dependency guard coverage, classifies the earlier Electron/AppKit `Abort trap: 6` report through the GUI launch guard, and writes value-free Markdown/JSON evidence without full reports, user paths, private values, network, signing, notarization, or distribution claims.
- 2026-07-03: Wired the new smoke into `npm run verify` after `desktop:smoke` and before `desktop:launch-smoke`, then updated QA/static expectations plus README, harness architecture, quality rules, and release readiness docs so the direct crash-report regression remains part of release evidence.
- 2026-07-03: Targeted desktop checks passed after rebuild. Package, ad-hoc signed, live launch, PKG payload, and install release checks all reported framework dependencies `3/3 present`, `3/3 code-signed`, `3/3 signature-compatible`, and dyld framework loadability `3/3 loadable via 2 dyld rpaths`, covering the reported Squirrel runtime failure class.
- 2026-07-03: `npm run release:check` passed with the new crash-report regression smoke in the verify sequence. External distribution remains intentionally pending because private release-channel metadata, Developer ID signing, notarization, Gatekeeper/manual QA, and update-feed proof are not complete.
- 2026-07-03: Moved the plan to completed and refreshed completion summary evidence. Latest completed plan is `plan-1318`, current 10-plan progress is `1311-1320: 8/10`, user-facing completion is `99.999999%`, remaining completion is `0.000001%`, and the current external blocker remains the ignored local distribution env/release-channel metadata handoff.
- 2026-07-03: Created the review mirror with no blocking findings and reran `git diff --check` successfully after documentation updates.
