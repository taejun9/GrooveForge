# plan-1432-quick-actions-demand-materialization

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Remove the closed Quick Actions palette's full command-construction work from ordinary workstation renders while preserving immediate keyboard opening, complete command search, pins, recents, route results, and launch-smoke coverage.

## Non-Goals

- Removing, reducing, or renaming Quick Actions or Command Reference commands.
- Deferring the visible workstation, audio engine, editable events, or direct composition controls.
- Changing project data, undo/redo, playback, rendering, exports, delivery bundles, or project files.
- Adding remote services, analytics, accounts, imported audio, or sampling workflows.

## Context Map

- `src/ui/App.tsx`: Quick Actions lifecycle and full command materialization call.
- `src/ui/workstationAppQuickActionPalette.ts`: palette lifecycle helper and pin normalization.
- `harness/scripts/run_renderer_smoke.mjs`: inactive/active factory and source integration evidence.
- `electron/main.ts`: live palette opening and complete command evidence.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live desktop command search/run regression gate.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- The closed palette must not invoke the full `createQuickActions` factory.
- Opening Quick Actions by button or keyboard must materialize the complete current command set in the same render.
- Pins and recents must survive closing and reopening the palette.
- Launch smoke may explicitly materialize commands for its route evidence without changing normal production posture.
- Preserve existing test IDs, command handlers, local-first behavior, and the sample-free event model.

## Implementation Plan

- [x] Add a lazy factory boundary that returns no command array until the palette surface is active.
- [x] Gate pin normalization and derived filtering so the inactive lifecycle cannot clear session state.
- [x] Add pure inactive/active factory evidence and renderer source-contract checks.
- [x] Preserve live Electron search, execution, pin/recent, audience route, and mode evidence.
- [x] Run focused and full QA, then a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and inspect the production chunk report without claiming bundle-size reduction.

## Review Plan

Review starts after QA. It checks inactive factory suppression, first-open completeness, keyboard behavior, pin/recent retention, launch-smoke opt-in, command and route preservation, render-loop safety, and project/audio/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Materialize the full Quick Actions graph only while the palette is open or the explicit launch-smoke route audit is active. | The 24k-line command module currently constructs its full callback-rich action array on every workstation render even though the palette normally returns `null`; ordinary composition edits should not pay that repeated cost. |
| 2026-07-13 | Keep the module statically bundled in this plan. | The command factory shares many workstation helpers and route callbacks; demand construction is a bounded, measurable render-path improvement, while safe module-level lazy loading needs a separate architecture plan and bundle baseline. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree after three recent reviews repeated the startup-performance residual risk. |
| 2026-07-13 | repo_cartographer | Audit found `createQuickActions(...)` runs unconditionally in `App` and feeds an effect keyed by a newly created action array on every render, while the closed `QuickActions` component immediately returns `null`. |
| 2026-07-13 | harness_builder | Added a stable inactive array and lazy factory contract; renderer evidence proves zero inactive factory calls and complete active materialization. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer/workflow/persona smokes, production build, native project I/O, live Electron launch smoke, and diff checks passed. |
| 2026-07-13 | review_judge | Post-QA review approved demand materialization with no blocking findings and confirmed command, route, project, audio, and export behavior remains intact. |

## Completion Notes

- The closed production palette now returns one stable empty command array without invoking `createQuickActions`.
- Button, keyboard, and Command Reference entry paths set the palette open before the next render, which materializes the current complete command graph.
- Pin normalization only runs while the command graph is available, preserving session pins and recents across close/reopen cycles.
- Explicit launch-smoke mode keeps the full graph available for the existing exhaustive route audit.
- Review: `docs/reviews/plan-1432-quick-actions-demand-materialization-review.md`.
