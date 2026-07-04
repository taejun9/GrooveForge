# plan-1354-audience-starter-command-reference

## Goal

Make the new first-time composer and professional producer Audience Starter project creation path discoverable from Command Reference, so beginners and working producers can find the same local starter project commands through the app's command map before opening Quick Actions.

## Scope

- Add an Audience Starter Command Reference row with context for the beginner and producer starter creation commands.
- Update renderer/static coverage so the command-map surface proves the Audience Starter path is searchable and remains sample-free/local-first.
- Update product/quality docs to keep the dual-audience starter path aligned with direct beat composition.

## Non-Goals

- Do not add protected artist style imitation, remote AI calls, sampling-first setup, imported audio, accounts, analytics, cloud sync, signing, notarization, upload, or private release values.
- Do not change project schema, export behavior, starter generation, or the completion percentage formula.
- Do not claim external distribution completion.

## Validation

- [x] `npm run renderer:smoke`
- [x] `npm run persona:smoke`
- [x] `npm run typecheck`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`
- [x] `npm run release:completion-summary-refresh-smoke`

Additional validation:

- [x] `npm run build`
- [x] `npm run release:check`

## Decision Log

- 2026-07-04: Created after plan-1353 promoted Audience Starter project creation into the app. The immediate gap is Command Reference discoverability: Quick Actions can create the starters, but the command map should also teach beginners and working producers how to find those creation commands without relying on memory.
- 2026-07-04: Added an Audience Starter Guide row to Command Reference, proved it through renderer smoke by SSR-rendering the Command Reference dialog, and updated product, quality, and release readiness evidence so the beginner/pro starter creation path is guarded as local-first, direct-composition, and sample-free.
- 2026-07-04: `npm run release:check` first failed inside the restricted macOS GUI sandbox at `desktop:launch-smoke`; reran the same command with approved unsandboxed GUI/AppKit access and it passed. Final completion summary refresh reports latest completed plan `plan-1354`, 10-plan progress `1351-1360: 4/10`, user-facing completion `99.999999%`, remaining `0.000001%`, and current first blocker `Ignored local distribution env file is not loaded.`
