# plan-1013-quick-actions-chunk-split

## Goal

Reduce the production build large-chunk warning by splitting Quick Actions supporting code into real Rolldown/Vite chunks without changing GrooveForge runtime behavior.

## Product Fit

GrooveForge should feel solid for both first-time beat makers and working producers. A cleaner production build improves delivery confidence while preserving the direct, sample-free beat workstation path.

## Scope

- Inspect the current production chunk grouping and Quick Actions bundle boundary.
- Split read-only Quick Actions route-label and command-palette support code into separate chunks without behavior changes.
- Keep source maps, existing code splitting, and Vite/Rolldown production build semantics.
- Update docs and QA harness expectations for the build hygiene boundary.

## Non-Goals

- No UI behavior changes, Quick Actions command changes, command ordering changes, project schema changes, playback changes, render/export changes, or save/load changes.
- No hiding chunk warnings by raising `chunkSizeWarningLimit`.
- No sampling, imported audio, sampler device, remote AI, accounts, analytics, payments, cloud sync, or external services.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

`npm run build` and `npm run verify` no longer report the Vite large-chunk warning. The production build now emits:

- `workstation-app-quick-action-route-labels`: 5.91 kB
- `workstation-app-quick-action-palette`: 6.66 kB
- `workstation-app-quick-actions`: 495.77 kB

## Decision Log

- 2026-06-28: Start with Vite/Rolldown chunk grouping and module-boundary inspection before moving code.
- 2026-06-28: Split pure Quick Actions route-label helpers and command-palette/search/pin/recent/source helpers into dedicated modules and chunk groups while keeping the existing Quick Actions import contract intact.
- 2026-06-28: Completed after QA, typecheck, quality gate, build, full QA, and verify passed with no large-chunk warning.

## Status

- Completed.
