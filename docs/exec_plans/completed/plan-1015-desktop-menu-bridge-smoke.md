# plan-1015-desktop-menu-bridge-smoke

## Goal

Strengthen the deterministic desktop smoke so GrooveForge's native menu bridge proves the same allowlisted commands are defined in Electron main, validated in preload, typed for the renderer, and handled by the workstation app.

## Product Fit

GrooveForge is a local-first desktop beat workstation. Producers and beginners need desktop menu commands for opening, saving, undo/redo, transport, Quick Actions, Command Reference, and selected-event deletion to keep working after future refactors. This plan adds contract evidence without changing composition behavior.

## Scope

- Extended `npm run desktop:smoke` coverage for the native menu bridge command contract.
- Verified command IDs stay present across Electron main, preload validation, renderer type declarations, and renderer handling.
- Verified each command routes to the existing workstation handlers rather than adding new desktop-only behavior.
- Updated harness, QA, and docs expectations for the stronger bridge coverage.

## Non-Goals

- No UI behavior changes, command additions, accelerator changes, save/open behavior changes, project schema changes, playback changes, audio rendering changes, export changes, or package/distribution work.
- No GUI launch automation, installer, signing, notarization, auto-update, remote services, accounts, analytics, payments, cloud sync, sampling, imported audio, sampler devices, or audio clip scope.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run harness:smoke`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run qa`
- Passed: `npm run verify`

`npm run desktop:smoke` now checks the built Electron entry, preload bridge, renderer native-menu handler contract, and renderer artifact contract. `npm run build` and `npm run verify` completed without a Vite large-chunk warning.

## Decision Log

- 2026-06-28: Use a deterministic source/build artifact smoke instead of launching Electron, keeping validation local, repeatable, and compatible with non-GUI environments.
- 2026-06-28: Kept the change contract-level and non-UI-changing so native menu commands remain tied to existing Open, Save, Undo, Redo, Quick Actions, Command Reference, Play/Stop, and Delete Selected Event handlers.
- 2026-06-28: Completed after QA, typecheck, quality gate, runtime smoke, build, desktop smoke, full QA, and verify passed.

## Status

- Completed.
