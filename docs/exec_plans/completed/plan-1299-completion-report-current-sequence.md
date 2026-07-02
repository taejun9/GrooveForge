# plan-1299-completion-report-current-sequence

## Goal

Make the release completion report packet mirror the source Current Operator Command Sequence instead of using the guided channel setup wizard as the first operator command, and pin the attached macOS Squirrel.framework DYLD launch report as an Electron runtime framework diagnostic instead of an AppKit sandbox diagnostic.

## Scope

- Update `npm run release:completion-report-packet-smoke` to derive its Current Operator Command Sequence from value-free current blocker evidence exposed by the channel edit packet.
- Keep `npm run release:channel-setup-wizard` visible as a guided setup command, but not as the canonical current operator first command when the current-blocker source says preflight or prepare-env comes first.
- Validate first-command alignment, preflight-before-apply, apply-before-strict-proof, ready rows, and value-free posture.
- Extend desktop launch diagnostics and `desktop:smoke` regression coverage for attached `Namespace DYLD, Code 1, Library missing` Squirrel/ReactiveObjC/Mantle framework reports.
- Update docs and QA expectations so completion report packets cannot drift from source operator guidance.

## Out of Scope

- Editing `.env.distribution.local` values.
- Supplying private release metadata, update feed values, Developer ID identities, notary credentials, or manual QA approval.
- Running real signing, notarization, Gatekeeper distribution, feed publishing, release upload, or external distribution probes.
- Changing beat-composition workflows, renderer UI, project schema, audio rendering, export artifacts, or package contents.

## Validation

- `node --check harness/scripts/run_release_completion_report_packet_smoke.mjs`
- `node --check harness/scripts/desktop_gui_launch_guard.mjs`
- `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- `node --check harness/scripts/run_release_channel_edit_packet_smoke.mjs`
- `PYTHONDONTWRITEBYTECODE=1 python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1299-run_qa.pyc', doraise=True)"`
- `git diff --check`
- `npm run desktop:smoke`
- `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- `npm run desktop:package-smoke`
- `npm run release:channel-edit-packet-smoke`
- `npm run release:completion-report-packet-smoke`
- `npm run release:progress-refresh-smoke`

## Decision Log

- 2026-07-03: Created after main evidence showed `release:completion-report-packet-smoke` still reported `npm run release:channel-setup-wizard` as `Current operator first command` while current-blocker/progress/operator-brief evidence correctly pointed at `npm run release:channel-apply-private-env-preflight` in the placeholder-env state.
- 2026-07-03: The newest attached macOS report shows `Namespace DYLD, Code 1, Library missing` for `@rpath/Squirrel.framework/Squirrel`, with a missing framework candidate and a signature-blocked candidate. Current `desktop:package-smoke` already proves the fresh bundle has 3/3 Electron runtime frameworks present, code-signed, dyld-loadable, and launchable; this plan adds explicit crash-report classification so the same report shape is diagnosed as a framework dependency failure with a fresh package-smoke action.
- 2026-07-03: Added a dedicated macOS DYLD framework abort classifier for Squirrel/ReactiveObjC/Mantle reports and regression coverage in `desktop:smoke`, before the broader AppKit SIGABRT launch diagnostic.
- 2026-07-03: Split guided channel setup rows from canonical current operator rows. Completion report packets now read `currentOperatorCommandRows` from the channel edit packet source, reject `npm run release:channel-setup-wizard` as the current first command, and validate prepare-env/preflight/apply/strict-proof ordering.
- 2026-07-03: Updated README, release readiness, harness architecture, quality rules, and QA expectations for the Squirrel DYLD diagnostic and source-aligned Current Operator Command Sequence.
- 2026-07-03: Verified syntax, QA, desktop smoke, fresh package smoke, channel edit packet smoke, completion report packet smoke, unsandboxed `npm run release:check`, and `npm run release:progress-refresh-smoke`; fresh package/PKG/install evidence reports 3/3 Electron runtime frameworks present, code-signed, and dyld-loadable.
