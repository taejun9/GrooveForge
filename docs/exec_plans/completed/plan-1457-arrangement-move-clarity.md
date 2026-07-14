# plan-1457-arrangement-move-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the two primary arrangement move controls immediately distinguishable by sight and assistive technology while preserving the direct professional edit workflow. First-time composers should see which direction each action moves the selected block, and keyboard or screen-reader users should encounter two stable, unique action names.

## Evidence and Motivation

A live 1280×720 browser audit found that `arrangement-move-left` and `arrangement-move-right` each have 121px of width and no internal clipping, but both expose the same visible and accessible name, `Move`. Their direction is available only through the arrow icon and hover title. The other four arrangement structure actions are already uniquely named. The available width is sufficient for complete `Move left` and `Move right` labels without changing the six-action layout.

## Non-Goals

- Changing arrangement order, duplicate, split, merge, delete, selection, undo, playback, render, or export behavior.
- Redesigning the arrangement editor, changing its six-action grid, or adding new arrangement commands.
- Changing project data, project schema, audio behavior, sampling scope, accounts, analytics, cloud sync, or network services.

## Constraints

- QA completes before a separate review starts.
- Both move controls show complete directional labels and expose unique selected-block-specific accessible names.
- Existing titles, disabled logic, click handlers, icons, action order, and project mutations remain unchanged.
- Labels remain readable and contained at the supported 1280px desktop audit width and responsive layouts introduce no document overflow.
- Renderer and production Electron evidence prevent both controls from collapsing back to the same name.

## Implementation Plan

- [x] Add complete directional labels and stable unique accessible names to the two arrangement move controls.
- [x] Add renderer and production Electron evidence for directional naming and containment.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run Browser, Electron, full QA, and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make arrangement move clarity the next completion target. | Two adjacent core edit controls currently collapse to the same `Move` name even though their 121px buttons have enough room for explicit directions. |
| 2026-07-14 | Keep the existing six-action layout and clarify only the two move controls. | The problem is semantic ambiguity rather than insufficient space or an arrangement workflow defect. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-14 | repo_cartographer | Browser audit measured two 121px move buttons with no clipping, zero explicit accessible names, and only one shared visible/accessibility label, while the four neighboring arrangement actions were unique. |
| 2026-07-14 | harness_builder | Added complete `Move left`/`Move right` labels, two selected-block-specific accessible names, renderer locks, and production starter-landing evidence without changing existing titles, disabled logic, icons, handlers, or the six-action layout. |
| 2026-07-14 | quality_runner | Renderer smoke and TypeScript checks passed. The first standalone Electron attempt correctly stopped because the production build was absent; `npm run build` passed, and the sandboxed retry correctly stopped at the macOS GUI preflight before the approved unsandboxed rerun. |
| 2026-07-14 | quality_runner | Browser re-audit at 1280×720 measured 121px controls with readable 67px/77px labels, two unique selected-block names, zero group/document overflow, working right/left movement with restoration, and unchanged titles/disabled posture. |
| 2026-07-14 | quality_runner | Standalone production Electron launch smoke passed the new 2/2 readable, uniquely named, contained arrangement-move contract plus all existing first-run, keyboard, layout, project-state, and visual evidence. |
| 2026-07-14 | quality_runner | Full `npm run verify` passed source, runtime, local delivery, production Electron, packaged app, ad-hoc signature, DMG, PKG payload, simulated install, project I/O, persona, privacy, and release-evidence paths. Empty wizard responses preserved the expected value-free external/private release blocker without recording credentials or distribution metadata. |
| 2026-07-14 | review_judge | Separate post-QA review approved the change with no blocking, major, or moderate findings. |
| 2026-07-14 | plan_keeper | Completion summary refresh passed after moving the plan and review, updating the current 1451–1460 window to 7/10 while preserving the existing external/private release blocker. |
