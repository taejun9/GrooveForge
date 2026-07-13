# plan-1444-compact-transport-launchpad

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Use the desktop first-run viewport efficiently by arranging brand, project choices, setup fields, and direct transport actions into a compact two-row workstation header that keeps both audience entry points intact and brings Workflow Navigator into the initial 1280×720 view.

## Non-Goals

- Removing or auto-collapsing the first-run launchpad before an explicit action.
- Changing starter creation, setup values, transport, project I/O, keyboard shortcuts, or disclosure behavior.
- Redesigning mobile layout, project schema, playback, render/export, or local drafts.
- Adding imported audio, sampling-first setup, remote AI, accounts, analytics, or cloud behavior.

## Constraints

- QA completes before a separate review starts.
- At 1280×720, all three launchpad actions and direct Play, Save, Actions, Help, Open, Undo, and Redo controls remain visible.
- Workflow Navigator starts inside the viewport; project setup fields remain readable without horizontal clipping.
- Beginner and producer starter actions retain focus/scroll landing behavior.
- Mobile restores the existing single-column stacking model.

## Implementation Plan

- [x] Add desktop grid areas for brand, setup, launchpad, and command strip.
- [x] Convert the open launchpad to a compact horizontal decision surface on desktop.
- [x] Compact command groups without hiding direct controls or disclosures.
- [x] Add renderer and production Electron geometry evidence.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and desktop evidence, then perform a separate review.

## QA Plan

- Run renderer, typecheck, QA, runtime, workflow, persona, build, bundle, desktop launch, project I/O, and diff checks.
- Live-browser measure header/navigator/pattern geometry at 1280×720 and verify both starter landings.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Preserve every direct action and improve layout rather than collapsing beginner or professional controls. | Both audiences need immediate entry; the defect is unused desktop space, not excessive capability. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | quality_runner | Live 1280×720 evidence measured a 424px transport header, setup controls floating at y=200, Workflow Navigator starting at y=752, and Pattern editor at y=883. |
| 2026-07-13 | harness_builder | Added desktop-only named grid areas, one-row setup fields, horizontal audience choices, compact four-column command groups, and renderer/Electron geometry evidence. |
| 2026-07-13 | quality_runner | Live 1280×720 evidence measured a 284.49px header, setup at y=31, Workflow Navigator at y=612, all required actions visible, beginner Pattern landing at y=148, and producer Review Queue landing at y=148. |
| 2026-07-13 | quality_runner | Strengthened Electron evidence to reset to top origin before capturing initial geometry; production Electron confirmed the same 284.49px header and y=612.59 Navigator rather than a later sticky position. |
| 2026-07-13 | quality_runner | Full runtime, workflow, persona, build, bundle, Electron launch, native project I/O, renderer, typecheck, QA, and diff checks passed. A bundle check initially raced the parallel build and passed when rerun after build completion. |
| 2026-07-13 | review_judge | Separate post-QA review approved the layout with no remaining blockers; mobile, starter behavior, project state, audio, export, privacy, and sampling boundaries remain intact. |
