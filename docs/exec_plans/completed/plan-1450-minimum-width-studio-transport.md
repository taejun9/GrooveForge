# plan-1450-minimum-width-studio-transport

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Preserve professional workspace height at the actual 1180px minimum window. Studio mode should keep Session Context and Exports compact at widths up to 1220px, including when entering Studio or resizing an already-open Studio workspace, while retaining the existing wide-window auto-expand behavior and manual disclosure controls.

## Non-Goals

- Changing which advanced compose, sound, arrangement, mix, master, review, or delivery panels Studio mode opens.
- Removing Session Context or Exports, changing their controls, or preventing a user from opening them manually at a compact width.
- Changing project schema, mode persistence, playback, save/load, exports, project data, privacy, remote behavior, or sampling scope.

## Constraints

- QA completes before a separate review starts.
- The compact transport breakpoint stays aligned with the existing 901–1220px layout contract.
- Entering Studio at 1180px keeps both transport disclosures closed and the transport header materially shorter than the expanded posture.
- Entering Studio above 1220px retains the existing automatic expansion of both transport disclosures.
- Resizing an already-expanded Studio workspace into the compact range closes both disclosures once; users may then reopen either disclosure manually.
- Guided mode remains compact at every width, and switching back from Studio resets both disclosures closed.
- Renderer and production Electron evidence cover compact entry, wide entry, resize collapse, manual reopen, zero horizontal overflow, and essential command visibility.

## Implementation Plan

- [x] Centralize the compact transport viewport decision at the existing 1220px breakpoint.
- [x] Make mode-aware transport disclosure expansion responsive without changing other Studio panels.
- [x] Collapse expanded Studio transport disclosures when crossing into the compact range while preserving manual reopening.
- [x] Add renderer and native Electron evidence for wide/compact entry, resize collapse, manual reopen, height, and overflow.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Keep Studio auto-expansion above 1220px but compact only the two transport disclosures at 901–1220px. | Live 1180×720 inspection measured a 315px Guided header and an approximately 555px Studio header because Session Context and Exports opened together. The producer route already lands directly on Review Queue, so keeping these secondary transport groups compact restores about 240px of workspace without hiding or removing their toggles. |
| 2026-07-13 | Align all launch-bearing package parent timeouts at 540 seconds above the app's 520-second launch bound. | Full verify and a standalone package retry both reached the stale 480-second parent limit before the now-longer structured app result. Package, ad-hoc, PKG-payload, and simulated-install parents all launch the same smoke and need the same bounded margin. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | repo_cartographer | Live 1280×720 beginner and producer starts both landed on the promised focused workspace targets with zero horizontal overflow; at 1180×720, switching the same producer project between Guided and Studio isolated the header expansion to the two Studio transport disclosures. |
| 2026-07-13 | harness_builder | Added the shared 1220px responsive disclosure decision, compact-range resize collapse, manual reopen behavior, launch-smoke control, native evidence, and aligned 540-second launch-bearing package bounds. |
| 2026-07-13 | quality_runner | Live browser verification passed at 1180px. Native Electron measured a 456.4921875px compact Studio transport versus 695.4921875px with Exports manually expanded, with zero horizontal overflow, wide auto-expansion, resize collapse, compact entry, and individual manual reopen all ready. |
| 2026-07-13 | quality_runner | The first full verify exposed stale 480-second package parent limits after the app collector had grown to 520 seconds. After aligning all four launch-bearing parents at 540 seconds, standalone package smoke passed and the complete `npm run verify` suite finished with exit code 0 across renderer, typecheck, build, native app, packaged app, signed app, DMG, PKG payload, simulated install, project roundtrips, persona, and release-evidence checks. The interactive release setup refresh was submitted with four empty values and correctly recorded a value-free blocked external-distribution state without modifying local env or using the network. |
| 2026-07-13 | review_judge | Separate post-QA review passed with no blocking, high, medium, low, or follow-up findings. Responsive state ownership stays UI-only, listeners and smoke hooks clean up, manual disclosure authority remains intact, native evidence restores its window/mode state, and launch-bearing parent bounds remain above the app collector. |
| 2026-07-13 | plan_keeper | All implementation, QA, and review criteria are complete; move this plan to `docs/exec_plans/completed/` with the review mirror retained in `docs/reviews/`. |
