# plan-1075-local-pkg-smoke

## Goal

Add a local macOS PKG installer smoke so GrooveForge has value-free evidence for a second local installer artifact beyond the DMG.

The release gate currently proves a portable app bundle, local DMG, simulated DMG install, and project IO after simulated install. It explicitly does not claim PKG installer creation. A local unsigned PKG smoke can improve distribution readiness without needing private Developer ID credentials, notarization, Gatekeeper approval, release upload, or real `/Applications` installation.

## Scope

- Add a `desktop:pkg-smoke` package script.
- Add a macOS-only Node smoke that creates a local unsigned PKG under ignored `build/desktop/`.
- Verify PKG metadata, payload expansion, install location, bundled GrooveForge app payload, checksums, and value-free/not-claimed posture.
- Wire the smoke into `npm run verify` and `npm run release:check`.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Installing into real `/Applications`.
- Signing the PKG with Developer ID Installer, notarizing, stapling, Gatekeeper approval, upload, app-store submission, or claiming external distribution completion.
- Changing app behavior, project files, audio rendering, sampling scope, cloud sync, accounts, analytics, remote AI, or payments.

## Plan

1. Inspect existing desktop DMG/install/release-manifest smoke patterns.
2. Add the local PKG smoke and package script.
3. Align docs and QA expectations.
4. Run focused syntax/QA checks and the PKG smoke.
5. Complete QA, review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_pkg_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_release_manifest_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_release_notes_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_support_artifact_smoke.mjs`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed after unsandboxed rerun: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:dmg-smoke`
- Passed: `npm run desktop:pkg-smoke`
- Passed: `npm run desktop:install-smoke`
- Passed: `npm run desktop:release-manifest-smoke`
- Passed: `npm run desktop:release-notes-smoke`
- Passed: `npm run desktop:support-artifact-smoke`
- Passed: hard external gate expected-failure check with `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` returning exit code 1 because hard external distribution evidence is intentionally not ready in this local-only plan.

## Decision Log

- 2026-06-28: Chose a local unsigned PKG smoke because it adds installer-artifact evidence without requiring private Apple credentials or touching the real Applications directory.

## Status

- Completed on 2026-06-28.
