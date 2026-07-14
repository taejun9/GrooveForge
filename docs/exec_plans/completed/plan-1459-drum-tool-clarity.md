# plan-1459-drum-tool-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make all five selected-drum-hit clipboard and beat-copy controls immediately understandable and comfortably operable without sacrificing direct professional editing. First-time composers should not need to decode `Aud`, `Prev`, or `Next`, while working composers retain one-click audition, copy, paste-to-next-empty-step, and previous/next-beat duplication.

## Evidence and Motivation

A live 1280×720 Studio audit found five controls in a 415px drum inspector row. The controls fit only because three visible labels are abbreviated, every control is 30px high, and none exposes an explicit action-specific accessible name. `Prev` and `Next` omit that they duplicate a hit to an empty beat-grid slot, while `Paste` omits its next-empty-step destination. Complete visible labels, five stable accessible names, and 48px control height can make the same direct actions understandable without changing their behavior or order.

## Non-Goals

- Changing drum audition, clipboard, duplication, selection, dynamics, timing, probability, hat repeat, undo, playback, render, MIDI, or export behavior.
- Changing drum data, project schema, the drum grid, Groove presets, Quick Actions commands, or any callback availability rule.
- Adding instruments, plugin hosting, imported audio, sampling, accounts, analytics, cloud sync, or network services.

## Constraints

- QA completes before a separate review starts.
- All five controls expose complete visible labels and five stable, unique action-specific accessible names.
- Existing icons, titles, disabled logic, callbacks, action order, clipboard behavior, and project mutations remain unchanged.
- The 415px drum inspector presents readable, contained controls with at least 48px height and no drum-toolbar overflow.
- Renderer and production Electron evidence prevent abbreviated labels, missing names, undersized controls, or overflow from returning.

## Implementation Plan

- [x] Add complete action labels and stable unique accessible names to all five selected-drum controls.
- [x] Add component-local readable label treatment and a comfortable minimum control height while preserving the five-column professional scan.
- [x] Add renderer and production Electron evidence for count, naming, readability, sizing, and containment.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run Browser, Electron, full QA, and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make selected-drum tool clarity the next completion target. | Five core drum-hit actions rely on abbreviated or incomplete visible copy, expose no explicit accessible names, and use only 30px-high controls. |
| 2026-07-14 | Preserve the existing five-column order while allowing complete labels to wrap inside 48px controls. | The 415px inspector already gives each action about 79px, enough for two-line complete labels without adding interaction depth or slowing the producer scan. |
| 2026-07-14 | Select Kick 1 inside the launch-smoke-only evidence collector before measuring the Beginner toolbar. | The normal Beginner starter intentionally clears selection; smoke evidence needs an explicit active hit to verify the selected-hit tools without changing product behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-14 | repo_cartographer | Browser audit measured a 415.26px five-column row, five 79px by 30px controls, zero explicit accessible names, and abbreviated or destination-incomplete labels `Aud`, `Copy`, `Paste`, `Prev`, and `Next`. |
| 2026-07-14 | quality_runner | First corrected browser measurement found all five labels readable and names unique with zero overflow, then caught a two-line `Previous beat` label making its button taller and top-offset from its peers; the row was changed to stretch all five controls to one aligned height. |
| 2026-07-14 | quality_runner | Final 1280×720 Browser evidence measured a 415.26px row, five 79px-wide controls at one aligned 52.39px height, five readable labels, five unique names, five columns, one row, and zero internal overflow; Next beat duplicated Kick 1 to Kick 5, Undo removed Kick 5, and browser console errors were zero. |
| 2026-07-14 | quality_runner | Standalone production Electron passed the new 5/5 readable, uniquely named, contained five-column selected-drum contract alongside all prior note, chord, mixer, arrangement, starter, keyboard, project-state, and visual evidence. |
| 2026-07-14 | quality_runner | Full `npm run verify` passed source, renderer, beginner/producer workflow, runtime, local delivery, production Electron, native/packaged/PKG/install project I/O, ad-hoc signing, DMG/PKG, privacy, and release-proof paths with the expected value-free external/private release blocker preserved. |
| 2026-07-14 | review_judge | Separate post-QA review found that the production contract said an existing Beginner starter hit was selected, while the evidence collector measured the toolbar immediately after starter creation reset selection; the collector now explicitly selects active Kick 1 and asserts the Kick 1 readout before accepting the same layout evidence. |
| 2026-07-14 | quality_runner | Post-review `npm run typecheck`, `npm run renderer:smoke`, and `npm run build` passed. The first Electron rerun correctly rejected a stale pre-review bundle that lacked the new selected-hit field; after rebuilding, standalone production Electron passed with the existing Beginner Pattern focus and selected Kick 1 evidence together. |
| 2026-07-14 | review_judge | Review approved with no remaining blocking, major, or moderate findings: callbacks, titles, disabled rules, order, mutations, and normal starter behavior remain unchanged while the Browser, renderer, and production Electron contracts cover the completed labels and layout. |
| 2026-07-14 | plan_keeper | Implementation, QA, review, and completion evidence finished; moved the plan to `docs/exec_plans/completed/` and created its review mirror. |
