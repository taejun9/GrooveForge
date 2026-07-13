# plan-1451-drum-grid-keyboard-navigation

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Turn the direct 4×16 drum sequencer into one efficient keyboard editing surface. Only one drum step should enter the page Tab order, arrow keys should move selection across steps and lanes without changing the beat, Home and End should move to the first and last step in the current lane, and Enter or Space should retain the existing undoable step toggle behavior. Every step must expose its active state with `aria-pressed`, and the grid must give a concise visible and accessible keyboard hint.

## Non-Goals

- Changing drum generation, groove presets, velocity, probability, microtiming, hat repeat, playback, render/export, or the selected-hit inspector.
- Adding automatic rhythm generation, hidden quantization, sampling, audio import, recording, remote AI, accounts, analytics, or cloud sync.
- Applying the same keyboard model to the 808, melody, chord, or arrangement grids in this plan.
- Changing project schema, save/load, undo history semantics, Quick Actions commands, or global keyboard shortcuts.

## Constraints

- QA completes before a separate review starts.
- Directional navigation is selection-only and must not add an undo entry or change active drum events.
- ArrowLeft/ArrowRight are bounded within the current 16-step lane; ArrowUp/ArrowDown are bounded across Kick, Clap, Hat, and Perc at the current step.
- Home/End move to step 1/16 in the current lane.
- The selected cell is the only cell with `tabIndex=0`; before any explicit selection, Kick step 1 is the entry cell.
- Pointer selection and the existing two-click active-hit removal behavior remain unchanged.
- Enter and Space continue through the button click path so toggles stay undoable and share existing status, selection, and event-data behavior; the focused step consumes Space so it cannot also trigger the global Play/Stop shortcut.
- Renderer evidence covers every bounded Arrow/Home/End transition; production Electron evidence covers representative native Arrow movement, roving Tab and focus/selection parity, non-mutating navigation, `aria-pressed`, Enter/Space toggle, unchanged playback, and native-menu Undo restoration.

## Implementation Plan

- [x] Add a bounded drum-grid keyboard navigation helper and focus handler.
- [x] Apply roving `tabIndex`, explicit pressed state, and concise keyboard guidance to the 4×16 grid.
- [x] Add renderer evidence for source contracts and server-rendered semantics.
- [x] Add native Electron keyboard evidence for movement, non-mutation, toggle, and Undo restoration.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Make the direct drum grid the next completion target instead of adding another readout or route surface. | Live 1280×720 and 1180×720 audits showed the beginner starter lands correctly, the professional layout stays overflow-free, and direct edit controls are visually strong. The remaining keyboard path still exposes 64 independent Tab stops, no arrow-grid movement contract, and no explicit pressed semantics on active steps, which slows working producers and leaves keyboard/screen-reader users without a clear sequencer state model. |
| 2026-07-13 | Keep navigation bounded and mutation-free; retain native Enter/Space activation. | Bounded movement is predictable for first-time users, avoids surprising row wrapping, and lets the existing button click handler remain the single undoable event mutation path. |
| 2026-07-13 | Split exhaustive boundary proof from representative native proof. | Pure helper and renderer coverage deterministically prove every Arrow/Home/End boundary, while the production Electron smoke proves the real native Arrow, Enter/Space, menu Undo, focus, pressed state, and playback paths without repeating expensive root renders for every already-covered boundary. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | repo_cartographer | Live browser audit verified zero horizontal overflow at 1280×720 and 1180×720, exact beginner landing focus on `workflow-target-compose`, a visible persistent command dock during deep editing, and the missing drum-grid roving focus and pressed-state contracts. |
| 2026-07-13 | harness_builder | Initial live keyboard verification proved bounded arrow/Home/End movement and unchanged event counts. It also exposed that Space activated the step and bubbled into global Play/Stop; the step activation path now consumes Enter/Space before forwarding one click, preserving undoable editing without transport side effects. |
| 2026-07-13 | harness_builder | Native drum evidence was separated from the existing 280-second modal collector so neither consumes the other's bounded budget. Early per-key full-DOM and single-read retries exposed renderer scheduling limits; the final collector instead uses compact launch-smoke-only IPC snapshots with per-key backpressure and representative native coverage. |
| 2026-07-13 | harness_builder | The first single-read native retries revealed that background Electron could pause nested animation-frame completion. Snapshot recording and final collection now use bounded timers, avoiding visibility-dependent collection without changing the native input or asserted UI state. |
| 2026-07-13 | harness_builder | The dedicated drum collector now runs immediately after the first production DOM gate, before exhaustive Quick Actions and starter-project mutations, then preserves its result for the later combined keyboard/focus evidence. This keeps the direct-edit proof isolated from unrelated renderer load and reports its exact failing phase. |
| 2026-07-13 | harness_builder | Final native evidence uses a launch-smoke-only preload IPC, capture-phase post-commit snapshots, and per-key backpressure. The representative sequence proves ArrowRight selection/roving focus without event mutation, one-hit Enter and Space toggles, stopped playback, and two native-menu Undo restorations; it then restores the initial chord-card UI selection so existing keyboard evidence remains isolated. |
| 2026-07-13 | quality_runner | Production Electron launch smoke passed with 64 pressed-state drum buttons, one roving Tab stop, bounded helper coverage, representative native navigation, Enter/Space playback guard, Undo restoration, existing chord-card keyboard switching, modal focus, Command Reference, and 2880×1856 visual evidence. |
| 2026-07-13 | quality_runner | `npm run qa` and the complete `npm run verify` chain passed, including source, packaged, ad-hoc signed, DMG, PKG payload, simulated install, project I/O, persona, privacy, and release-evidence paths. Live browser checks at 1280×720 and 1180×720 remained overflow-free. |
| 2026-07-13 | review_judge | Post-QA review found one evidence-depth gap: the helper contract claimed every bounded transition while the renderer smoke sampled representative edges. The smoke now checks all 64 cells across all six navigation keys (384 transitions); the focused renderer rerun passed. No remaining code, privacy, accessibility, or regression findings were identified. |
