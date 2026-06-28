# plan-1078-pkg-payload-project-io-evidence-chain

## Goal

Make the PKG payload project IO smoke a first-class completion evidence source.

`desktop:pkg-payload-project-io-smoke` now proves that the app extracted from the unsigned PKG can save and reopen a sample-free project through the bundled preload bridge and IPC handlers. The completion audit and downstream reporting chain should read that evidence explicitly, so local release status and the external distribution gate cannot ignore installer-payload project-file IO readiness.

## Scope

- Add the PKG payload project IO JSON artifact to completion audit inputs.
- Require `pkgPayloadProjectIoReady` alongside native, packaged, and installed project IO evidence.
- Surface the PKG payload project IO artifact in completion audit evidence rows and downstream status/progress evidence where needed.
- Update the hard external distribution gate to require the expanded desktop project IO evidence.
- Align release readiness docs and QA expectations.

## Out of Scope

- Running the macOS Installer into real `/Applications`.
- Changing project file save/open behavior, dialogs, parser contracts, or beat data.
- Developer ID signing, notarization, stapling, Gatekeeper approval, release upload, app-store submission, remote feed probing, or claiming external distribution completion.
- Sampling, imported audio, cloud sync, accounts, analytics, remote AI, payments, or changing the direct-composition-first product scope.

## Plan

1. Complete: Inspect current completion audit, external gate, completion status, ledger, and progress scripts.
2. Complete: Add the active plan and define the evidence-chain scope.
3. Complete: Wire PKG payload project IO evidence into completion audit and downstream hard-gate reporting.
4. Complete: Update docs and QA expectations.
5. Complete: Run QA, review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_completion_audit_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_completion_status_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_external_operator_runbook_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_external_readiness_ledger_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_completion_progress_smoke.mjs`
- Passed: `node --check harness/scripts/run_release_progress_report.mjs`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run verify`
- Passed: `npm run release:progress` with macOS GUI/process access outside the sandbox for Electron launch smokes.
- Passed: `npm run desktop:external-operator-runbook-smoke`
- Passed: `npm run desktop:external-readiness-ledger-smoke`
- Passed: `npm run desktop:completion-progress-smoke`
- Confirmed: completion audit JSON reports `pkgPayloadProjectIoReady: true`, `desktopProjectIoEvidenceReady: true`, and `completionAuditReady: true`.
- Confirmed: release progress report JSON reports `releaseProgressReportReady: true`, `pkgPayloadProjectIoEvidenceReady: true`, `localReleaseReadinessPercent: 100`, and `externalDistributionGateReady: false`.
- Expected failure confirmed: `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` exits non-zero because private inputs, distribution-channel QA, auto-update, Developer ID signing, notarization/stapling, and notarized Gatekeeper evidence remain incomplete.

## Decision Log

- 2026-06-28: Chose to make PKG payload project IO part of the existing desktop project IO readiness group instead of creating a separate completion dimension, because it validates the same project-file IO contract at a later packaging stage.
- 2026-06-28: Added an explicit external-gate requirement for `pkgPayloadProjectIoReady` instead of relying only on the aggregate `desktopProjectIoEvidenceReady` boolean, so hard-gate evidence names the installer-payload IO proof directly.
- 2026-06-28: Extended operator runbook, readiness ledger, completion progress, and release progress checks to require the explicit external-gate PKG payload project IO row, so downstream reports cannot pass from completion status alone.

## Status

- Complete.
