# plan-1407-attached-crash-evidence

## Goal

Tie the user-provided Electron/AppKit and GrooveForge/Squirrel crash reports more directly to value-free regression evidence, so future release checks prove the exact attached report classes stay classified without storing full reports, real user paths, or private values.

## Scope

- Add attachment-style report fingerprints to `desktop:crash-report-regression-smoke`.
- Keep the existing AppKit restricted-GUI and Squirrel dyld dependency guard behavior unchanged.
- Update docs and static QA expectations for the attached-report fingerprint contract.
- Validate with focused crash regression, QA, build, completion refresh, and actual app screen launch smoke.

## Out of Scope

- Committing full crash reports, real incident IDs, crash reporter keys, full local paths, or user-specific values.
- Changing Electron launch behavior, packaging/signing behavior, or distribution claims.
- Filling private release-channel metadata values.
- Probing release channels, uploading releases, Developer ID signing, notarizing, or claiming external distribution completion.

## Decision Log

- 2026-07-06: Started after rechecking the attached reports. Existing regression smoke classifies representative AppKit and Squirrel dyld shapes, but the attached report details can be represented more explicitly as sanitized, value-free fingerprints.

## Completion Criteria

- Crash regression JSON/Markdown includes attachment fingerprint rows for the AppKit report and stale-worktree Squirrel dyld report.
- The smoke validates those fingerprints against the existing classifiers and launch/dependency guard coverage.
- Static QA verifies the new fingerprint fields and documentation.
- The plan is moved to `docs/exec_plans/completed/` with a review mirror under `docs/reviews/`.

## Validation Log

- `node --check harness/scripts/run_desktop_crash_report_regression_smoke.mjs` passed.
- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs` passed.
- `npm run desktop:crash-report-regression-smoke` passed with attached report fingerprints ready, AppKit abort classified, Squirrel dyld stale-worktree code-signature classified, and all rows value-free.
- `python3 harness/scripts/run_qa.py` passed after updating the static privacy expectation for incident IDs and crash reporter keys.
- `npm run qa` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run desktop:launch-smoke` passed with approved GUI/AppKit access; it rendered the production Electron app, checked 37 required test ids, sampled 75 colors, and verified beginner/professional producer Quick Actions paths.
- `npm run release:source-evidence-refresh-smoke` passed with approved GUI/AppKit access; source artifacts were 21/21 present in this clean worktree.
- `npm run release:completion-summary-refresh-smoke` passed with latest completed plan `plan-1407`, 10-plan progress `1401-1410: 7/10`, user-facing completion `99.999999%`, remaining completion `0.000001%`, and attached report fingerprints ready.

## Completion Notes

- Added value-free attached-report fingerprint rows to the desktop crash-report regression smoke.
- Mirrored fingerprint readiness through completion-summary refresh evidence.
- Updated README, release readiness, harness architecture, quality rules, and static QA expectations.
- No full crash reports, incident IDs, crash reporter keys, real user paths, private values, network probes, uploads, signing, notarization, or external distribution claims were recorded.
