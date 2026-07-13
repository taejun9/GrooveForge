# plan-1445-minimum-window-transport

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the actual 1180px minimum desktop window fully usable without horizontal overflow by adding an intermediate transport layout that preserves setup, both audience choices, and every direct transport/project action.

## Non-Goals

- Lowering the BrowserWindow minimum size or changing the 1221px+ compact desktop layout.
- Removing, shortening, or hiding launchpad, transport, project, or disclosure actions.
- Changing starter creation, playback, shortcuts, project data, save/load, render/export, or mobile layout.

## Constraints

- QA completes before a separate review starts.
- The target range is the reachable 901–1220px desktop interval and includes the application minimum width of 1180px.
- At the resized production Electron window, document horizontal overflow is zero and every required direct action fits within the viewport.
- Beginner and producer choices remain side by side; mobile at 620px and below stays stacked.
- The normal 1440px Electron smoke remains unchanged after resize evidence is collected and the window is restored.

## Implementation Plan

- [x] Add a named three-row intermediate transport grid for the reachable 901–1220px range.
- [x] Keep setup fields and horizontal audience choices compact without clipping.
- [x] Reflow command groups and disclosures without hiding actions.
- [x] Add production Electron resize evidence at the real minimum width.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Test the actual BrowserWindow minimum width instead of an arbitrary tablet width. | GrooveForge enforces `minWidth: 1180`; this is the reachable edge users can resize to and the missing range begins below 1221px. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | repo_cartographer | Source audit found `minWidth: 1180`, desktop compact rules starting at 1221px, mobile stacking ending at 620px, and no transport contract for the reachable 1180–1220px gap. |
| 2026-07-13 | harness_builder | Added an intermediate brand/setup, launch, and command grid plus a production Electron preflight that resizes to 1180×800, records geometry, and restores 1440×960. |
| 2026-07-13 | quality_runner | Production Electron measured a 1180px viewport, 456.49px transport, zero horizontal overflow, side-by-side starter choices, fitted setup, and all required action/disclosure rects inside the viewport. |
| 2026-07-13 | review_judge | Review expanded the required rect list to Session Context and Exports; the first rerun exposed a mistyped export test id, which was corrected before the final full Electron pass. |
| 2026-07-13 | quality_runner | Runtime 30/30 roundtrips, 14/14 styles, both workflows/personas, build, bundle, normal/minimum Electron launch, native project I/O, renderer, typecheck, QA, and diff checks passed. |
| 2026-07-13 | review_judge | Separate post-QA review approved the final minimum-window contract with no remaining blockers. |
