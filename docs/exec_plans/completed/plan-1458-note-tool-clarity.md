# plan-1458-note-tool-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make all ten selected-note editing controls immediately understandable and reliably readable without sacrificing direct professional editing. First-time composers should not need to infer direction from arrows or decode `Oct`, `Dup`, and `Aud`, while working composers retain one-click step, pitch, octave, duplicate, beat-copy, and audition actions.

## Evidence and Motivation

A live 1280×720 Studio audit found ten selected-note controls compressed into a single 399px row. Every button was only 35px wide and every visible label was clipped. The controls exposed zero explicit accessible names and only seven unique names because left/right Step, up/down Pitch, and up/down Octave pairs collapsed to the same text. Direction and complete meaning existed only in arrow icons and hover titles. A five-column, two-row narrow layout gives each control about 76px plus a two-line label option without changing the underlying actions.

## Non-Goals

- Changing note movement, pitch, octave, duplication, audition, selection, undo, playback, render, MIDI, or export behavior.
- Changing note data, project schema, Keyboard Capture, the note grid, note clipboard, selected-note sliders, or Quick Actions commands.
- Adding instruments, plugin hosting, imported audio, sampling, accounts, analytics, cloud sync, or network services.

## Constraints

- QA completes before a separate review starts.
- All ten controls expose complete visible labels and ten stable, unique action-specific accessible names.
- Existing icons, titles, disabled logic, callbacks, action order, and project mutations remain unchanged.
- The 399px note inspector presents a readable five-column, two-row toolbar with labels contained inside at least 48px-high controls and no note-toolbar or document horizontal overflow.
- Genuinely wide note inspectors retain the established one-row professional scan.
- Renderer and production Electron evidence prevent clipped or duplicate names from returning.

## Implementation Plan

- [x] Add complete action labels and stable unique accessible names to all ten selected-note controls.
- [x] Add component-local narrow layout and readable label treatment while preserving the wide one-row scan.
- [x] Add renderer and production Electron evidence for count, naming, readability, layout, and containment.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run Browser, Electron, full QA, and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make selected-note tool clarity the next completion target. | Ten core Studio note edits are all visually clipped and three directional pairs collapse to duplicate names. |
| 2026-07-14 | Use a component-local five-column, two-row narrow layout with complete labels. | The current 399px inspector cannot support ten complete one-line controls, while five columns preserve compact direct access and give labels enough width when wrapping at word boundaries. |
| 2026-07-14 | Raise only the production launch-smoke watchdogs from roughly 11 minutes to 15 minutes. | The growing end-to-end desktop evidence suite passed once independently but twice reached the old outer limit during its unchanged final Command Reference collection; the longer test-only window prevents false negatives without changing application behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-14 | repo_cartographer | Browser audit measured ten 35px controls in one 399px row, 10/10 clipped labels, zero explicit accessible names, only seven unique names, and zero group overflow because the ambiguous text itself was ellipsized. |
| 2026-07-14 | quality_runner | Browser and standalone production Electron evidence passed; full verify reached the old launch-smoke watchdog only after all earlier quality, workflow, persona, runtime, local package, type, build, bundle, desktop entry, and crash-regression checks passed. |
| 2026-07-14 | harness_builder | Replaced all ten abbreviated labels with complete action text, added ten stable accessible names, and introduced a component-local 5×2 layout below 780px while preserving the existing one-row wide layout, icons, titles, disabled logic, callbacks, and action order. |
| 2026-07-14 | quality_runner | Browser at 1280×720 measured a 399.48px note toolbar with 10/10 readable and contained controls, ten unique accessible names, five columns, two rows, 48px minimum height, and zero internal overflow; Step right moved 808 G1.4 to G1.5 and Step left restored G1.4 with no browser console errors. |
| 2026-07-14 | quality_runner | Standalone production Electron passed the new 10/10 readable, uniquely named, contained five-by-two selected-note contract alongside all existing starter, keyboard, layout, project-state, and visual evidence. |
| 2026-07-14 | quality_runner | The first full verify reached the old launch-smoke watchdog during its unchanged final Command Reference collection. After raising only the launch-smoke watchdogs to 15 minutes, full `npm run verify` passed source, runtime, local delivery, production Electron, packaged app, ad-hoc signature, DMG, PKG payload, simulated install, project I/O, persona, privacy, and release-evidence paths with the expected value-free external/private release blocker preserved. |
| 2026-07-14 | review_judge | Separate post-QA review found no functional or evidence defects; it narrowed the timeout change by restoring the project-I/O watchdog to its prior value, after which diff check, TypeScript, and renderer smoke passed. |
| 2026-07-14 | plan_keeper | Completion summary refresh passed after moving the plan and review, updating the current 1451–1460 window to 8/10 while preserving the existing value-free external/private release blocker. |
