# plan-1452-note-grid-keyboard-navigation

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Turn the direct 808 and Synth piano rolls into two efficient keyboard editing surfaces. Each instrument grid should contribute exactly one cell to the page Tab order, Arrow keys should move spatially across steps and rendered pitch rows without changing note events, Home and End should move to the first and last step in the current pitch row, and Enter or Space should retain the existing undoable note-toggle behavior. Every note cell must keep its explicit pressed state, and each grid must give concise visible and accessible keyboard guidance.

## Non-Goals

- Changing scale-lock derivation, pitch-lane generation, keyboard/MIDI capture, note length, glide, velocity, probability, playback, render/export, or the selected-note inspector.
- Changing drum-grid or chord-editor keyboard behavior.
- Adding note generation, recording, imported audio, sampling, remote AI, accounts, analytics, or cloud sync.
- Changing project schema, save/load, undo history semantics, Quick Actions commands, or global keyboard shortcuts.

## Constraints

- QA completes before a separate review starts.
- The 808 and Synth grids remain separate Tab stops so users can move between instruments with Tab while arrows stay inside the current instrument.
- Directional navigation is selection-only and must not add an undo entry or change active note events.
- ArrowLeft/ArrowRight are bounded within the current 16-step row; ArrowUp/ArrowDown follow the rendered top-to-bottom pitch order and stay bounded at the highest and lowest visible pitches.
- Home/End move to step 1/16 in the current pitch row.
- Each grid has one `tabIndex=0` cell. A selected note owns its track's Tab stop; otherwise that grid enters at its visually top-left cell.
- Pointer selection and the existing two-click active-note removal behavior remain unchanged.
- Enter and Space continue through the existing button click path so note toggles stay undoable and share current selection, status, event-data, and inspector behavior; the focused cell consumes Space so it cannot also trigger global Play/Stop.
- Renderer evidence covers every cell across all Arrow/Home/End transitions for representative dynamic pitch sets and verifies server-rendered pressed/Tab/help semantics. Production Electron evidence covers representative native movement, selection/focus parity, non-mutation, Enter/Space toggle, unchanged playback, and native-menu Undo restoration.

## Implementation Plan

- [x] Add a bounded note-grid keyboard navigation helper and selection-only focus handler.
- [x] Apply one roving `tabIndex`, explicit group naming, and concise keyboard guidance to each piano roll.
- [x] Add exhaustive renderer evidence for dynamic pitch sets and server-rendered semantics.
- [x] Add representative native Electron keyboard evidence for movement, non-mutation, toggle, playback guard, and Undo restoration.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make the direct 808/Synth piano rolls the next completion target. | Live DOM evidence found 144 808 cells and 160 Synth cells—304 buttons total—all in the page Tab order. This is now the largest direct-composition keyboard bottleneck and affects both first-time comprehension and professional editing speed. |
| 2026-07-14 | Keep one Tab stop per instrument instead of one across both piano rolls. | Tab remains a clear instrument-level transition while bounded arrows preserve spatial editing inside the selected 808 or Synth grid. |
| 2026-07-14 | Use rendered pitch order as the navigation authority. | Pitch rows are dynamic because scale lanes merge with used notes. Following the exact rendered order keeps ArrowUp/ArrowDown visually predictable without changing pitch derivation or project data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-14 | repo_cartographer | Local browser audit measured 144 808 cells and 160 Synth cells with 144/160 Tab stops respectively; both grids already expose correct `aria-pressed` state, so the change can stay focused on efficient focus navigation and guidance. |
| 2026-07-14 | harness_builder | The 808 and Synth grids now expose one roving Tab stop each, follow the exact rendered top-to-bottom pitch order for bounded spatial arrows, keep Home/End row-local, and consume Enter/Space before forwarding one existing undoable click. Selection-only movement clears drum/chord selection without changing note events or history. |
| 2026-07-14 | quality_runner | Renderer smoke passed with 144/160 rendered note cells, two total Tab entries, pressed/group/help semantics, activation-key separation, and all 1,824 transitions across representative 9-row 808 and 10-row Synth pitch sets. |
| 2026-07-14 | quality_runner | Live 1280×720 browser evidence proved zero horizontal overflow, visible guidance, one Tab entry per grid, spatial focus/selection parity, unchanged event counts during navigation, one-hit Enter/Space toggles, Undo restoration, and stopped playback. |
| 2026-07-14 | quality_runner | Production Electron launch smoke passed with 144 808 cells, 160 Synth cells, one native Tab entry per grid, representative Right/Down movement, non-mutating selection, Enter/Space playback guard, two native-menu Undo restorations, and all existing launch, modal, starter, layout, and 2880×1856 visual evidence. |
| 2026-07-14 | quality_runner | Full `npm run verify` passed across source, packaged, ad-hoc signed, PKG payload, and installed-app paths while retaining the expected external signing/notarization/distribution blockers. |
| 2026-07-14 | review_judge | Separate post-QA review found no blocking, major, or moderate findings. Dynamic pitch-order movement, one-Tab-stop semantics, activation isolation, undo restoration, launch-smoke-only IPC exposure, and listener cleanup match the plan contracts. |
