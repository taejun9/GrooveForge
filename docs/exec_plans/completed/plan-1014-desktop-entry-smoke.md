# plan-1014-desktop-entry-smoke

## Goal

Add a deterministic desktop-entry smoke check so GrooveForge's Electron production entry path is verified after the web and Electron builds complete.

## Product Fit

GrooveForge is meant to become a usable desktop beat workstation for first-time beat makers and working producers. The runtime smoke already proves sample-free beat creation and exports; this plan adds evidence that the packaged desktop entry points load the built workstation with the expected local-first Electron boundary.

## Scope

- Added a local desktop entry smoke script that checks built Electron and renderer artifacts.
- Verified the production Electron main entry loads `dist/index.html` through `loadFile`, uses the compiled preload, and preserves core BrowserWindow security settings.
- Verified the preload exposes the bounded GrooveForge desktop bridge and validates native menu commands.
- Added the smoke command to `package.json`, `npm run verify`, docs, and QA harness expectations.

## Non-Goals

- No Electron installer, app signing, notarization, auto-update, packaging service, or distribution flow.
- No UI behavior changes, project schema changes, playback changes, render/export changes, save/open behavior changes, or menu command changes.
- No sampling, imported audio, sampler device, remote AI, accounts, analytics, payments, cloud sync, or external services.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run qa`
- Passed: `npm run verify`

`npm run verify` now runs the strict quality gate, sample-free all-style runtime smoke, typecheck, production build, and desktop entry smoke. `npm run build` and `npm run verify` completed without a Vite large-chunk warning.

## Decision Log

- 2026-06-28: Use a deterministic artifact/contract smoke instead of launching Electron, so the desktop entry check can run in local/CI contexts without GUI availability while still proving the production entry contract after build.
- 2026-06-28: Completed after QA, typecheck, quality gate, build, desktop smoke, full QA, and verify passed.

## Status

- Completed.
