# plan-1077-pkg-payload-project-io-smoke

## Goal

Add a local PKG payload project IO smoke so GrooveForge verifies that the app extracted from the unsigned PKG can save and reopen a sample-free project through the real bundled preload bridge and IPC handlers.

`desktop:pkg-payload-smoke` proves the PKG payload contains a launchable branded app. The next local distribution proof is that this exact extracted app can perform native project file IO, not just render. This improves confidence in the installer payload while still avoiding real `/Applications` installation, macOS Installer execution, Developer ID signing, notarization, Gatekeeper approval, uploads, or external distribution claims.

## Scope

- Add a `desktop:pkg-payload-project-io-smoke` package script.
- Add a macOS-only Node smoke that requires the PKG payload app extracted by `desktop:pkg-payload-smoke`.
- Launch the extracted app with `GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE=1`.
- Write and reopen a sample-free `.grooveforge.json` project under ignored `build/desktop/`.
- Write value-free Markdown/JSON evidence.
- Wire the smoke into `npm run verify` and documentation after `desktop:pkg-payload-smoke` and before `desktop:install-smoke`.
- Update QA expectations.

## Out of Scope

- Running the macOS Installer into real `/Applications`.
- Changing normal project file behavior or visible save/open dialogs.
- Developer ID signing, notarization, stapling, Gatekeeper approval, release upload, app-store submission, auto-update readiness changes, or claiming external distribution completion.
- Sampling, imported audio, cloud sync, accounts, analytics, remote AI, or payments.

## Plan

1. Complete: Inspect existing packaged/installed project IO smoke patterns.
2. Complete: Add the PKG payload project IO smoke and package script.
3. Complete: Align README, harness architecture, quality rules, release readiness, and QA expectations.
4. Complete: Run syntax, QA, build, package, PKG payload, and new project IO smoke checks.
5. Complete: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_pkg_payload_project_io_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:dmg-smoke`
- Passed: `npm run desktop:pkg-smoke`
- Passed: `npm run desktop:pkg-payload-smoke`
- Passed: `npm run desktop:pkg-payload-project-io-smoke`
- Passed: `npm run desktop:install-smoke`
- Expected failure confirmed: `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` exits non-zero because external distribution prerequisites remain incomplete.

## Decision Log

- 2026-06-28: Chose a dedicated PKG payload project IO smoke instead of extending `desktop:pkg-payload-smoke` so launch evidence and native save/open evidence remain separate QA steps.
- 2026-06-28: Kept the hard external distribution gate failing after the new local PKG payload project IO proof because private inputs, Developer ID signing, notarization, Gatekeeper acceptance, auto-update, and channel QA are still external prerequisites.

## Status

- Complete.
