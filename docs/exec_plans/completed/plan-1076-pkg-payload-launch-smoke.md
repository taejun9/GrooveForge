# plan-1076-pkg-payload-launch-smoke

## Goal

Add a local PKG payload launch smoke so GrooveForge verifies that the unsigned PKG contains a launchable branded app payload without installing into the real Applications directory.

`desktop:pkg-smoke` creates a local unsigned PKG and verifies metadata plus payload listing. The next useful local installer proof is to expand the PKG payload into ignored build output, inspect the extracted `GrooveForge.app`, and launch that extracted app through the existing hidden-window smoke path. This improves installer confidence without Developer ID Installer signing, notarization, Gatekeeper approval, upload, or real installation.

## Scope

- Add a `desktop:pkg-payload-smoke` package script.
- Add a macOS-only Node smoke that expands the local PKG, extracts its payload under ignored `build/desktop/`, validates the extracted app bundle, and launches it with `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1`.
- Write value-free Markdown/JSON PKG payload smoke artifacts.
- Wire the smoke into `npm run verify` and `npm run release:check` after `desktop:pkg-smoke`.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Running the macOS Installer into real `/Applications`.
- Developer ID Installer signing, Developer ID Application signing, notarization, stapling, Gatekeeper approval, release upload, app-store submission, or claiming external distribution completion.
- Changing app behavior, project files, audio rendering, sampling scope, cloud sync, accounts, analytics, remote AI, or payments.

## Plan

1. Complete: Inspect current PKG and install smoke patterns.
2. Complete: Add the PKG payload extraction/launch smoke and package script.
3. Complete: Align docs and QA expectations.
4. Complete: Run focused syntax/QA checks and PKG payload smoke.
5. Complete: Complete review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_pkg_payload_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:dmg-smoke`
- Passed: `npm run desktop:pkg-smoke`
- Passed: `npm run desktop:pkg-payload-smoke`
- Passed: `npm run desktop:install-smoke`
- Expected failure confirmed: `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` exits non-zero because external distribution prerequisites remain incomplete.

## Decision Log

- 2026-06-28: Chose payload expansion and hidden-window launch instead of real installation so installer evidence improves without touching `/Applications` or requiring private Apple credentials.
- 2026-06-28: Kept the hard external distribution gate failing after the new local PKG payload proof because Developer ID signing, notarization, Gatekeeper acceptance, private inputs, auto-update, and channel QA are still external prerequisites.

## Status

- Complete.
