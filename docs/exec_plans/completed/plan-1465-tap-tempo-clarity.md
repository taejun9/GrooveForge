# plan-1465-tap-tempo-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make Tap Tempo discoverable before opening Session Context and make its direct button explain the function, live tap posture, current or estimated BPM, and next action. First-time composers should not have to infer that `Tap` means repeated tempo entry; working composers should confirm whether they are starting, continuing, or have applied a tap pass without moving focus to a separate readout, while retaining the same explicit local pulse and delayed undoable BPM commit.

## Evidence and Motivation

Live Browser audit on clean `main` at `418092cd` found the closed 164px Session Context summary described only `Tempo, edit history, and input posture`, so Tap Tempo was not named before opening the secondary group. Once open at 1280×720, the native button measured 148px by 38px but exposed only visible/accessibility text `Tap`, no explicit accessible name, and a generic `Tap repeatedly to set the project BPM` title. The adjacent readout explained `Tap BPM / 82 BPM / 2+ taps`. After one explicit click, focus stayed on the same button and the readout changed to `1 tap / Keep tapping / 82 BPM now`, but the button name and title remained unchanged; project BPM stayed 82 and Undo remained disabled. Behavior and readout are correct, but discovery and the direct action itself do not communicate the live state.

## Non-Goals

- Changing `tapProjectTempo`, `performance.now`, tap-window filtering, maximum retained taps, BPM calculation, bounds, rounding, commit delay, timer ownership, project update, history wording, manual BPM entry, Tempo Nudge reset behavior, playback, metronome, loop scope, save/load, render, MIDI, or export.
- Promoting Session Context into the always-open essential command strip or changing Edit History, Keyboard Capture Posture, Quick Actions, or Command Reference execution.
- Adding audio input, beat detection, recording, count-in, time signatures, tempo automation, MIDI clock, press-and-hold, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Constraints

- QA completes before a separate review starts.
- Preserve the existing button id, native button, Gauge icon, click handler, focus behavior, local tap history, delayed commit timer, undoable BPM update, project status, reset paths, and adjacent Tap Tempo readout.
- The closed Session Context summary must name `Tap Tempo` in a contained readable line at 1280px and the supported 1180px minimum.
- The direct button must keep a complete visible `Tap Tempo` name and show a live second-line posture for start, one-tap continuation, pending estimate, and applied tempo states.
- Expose a unique state-aware accessible name and title that identify current project BPM, captured tap count or estimate, and the next explicit action without claiming an unapplied estimate is already committed.
- Keep the button at least 38px high, keyboard-focusable, readable, contained, and free of internal/document horizontal overflow without increasing the closed compact Transport height.
- Renderer and production Electron evidence cover summary discovery, visible copy, accessible name, title, state copy, dimensions, readability, focusability, and containment; Browser proves one-tap state/name/title/focus changes and retained no-commit posture.

## Implementation Plan

- [x] Add a UI-local Tap Tempo button presentation derived from mounted project BPM and existing tap state.
- [x] Replace ambiguous `Tap` copy with complete two-line `Tap Tempo` vocabulary and state-aware accessible naming while retaining the icon and handler.
- [x] Name Tap Tempo in the closed Session Context summary and add contained responsive styling.
- [x] Add renderer and production Electron regression evidence and update durable product, architecture, and quality contracts.
- [x] Run Browser, production Electron, full QA, full verify, separate post-QA review, completion docs, and the required merge/push/cleanup flow.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make Tap Tempo direct-control clarity the plan-1465 target. | A core tempo-entry path is hidden behind a generic summary and its 148px direct button exposes only `Tap`, even though the existing adjacent readout already has truthful state. |
| 2026-07-14 | Keep Session Context secondary but name `Tap Tempo` in its closed summary. | The established compact Transport intentionally keeps secondary tools collapsed, while explicit summary vocabulary makes the feature discoverable without increasing header height. |
| 2026-07-14 | Project existing tap state into button-local presentation rather than change the tap model. | The calculation, timer, commit, history, and readout behavior are correct; the missing layer is direct action and state legibility. |
| 2026-07-14 | Use `Tap Tempo · Undo/Keys` for the closed summary. | Browser measured the first complete phrase at 117px and the first shortened phrase at 109px inside a 104px text track; the compact vocabulary names all three tool groups without truncation. |
| 2026-07-14 | Approve the post-QA review with no blocking, major, or moderate findings. | Browser, production Electron, QA, and full verify independently confirmed the presentation-only boundary, contained layouts, and retained delayed commit behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main` at `418092cd`; the unrelated plan-085 worktree and its existing untracked active plan remain untouched. |
| 2026-07-14 | repo_cartographer | Browser at 1280×720 found the closed 164px Session Context summary omitted the `Tap Tempo` name. Once open, the 148px by 38px button exposed only `Tap`, no explicit accessible name, and a generic title; the separate 142px readout carried the actual `Tap BPM / 82 BPM / 2+ taps` state. |
| 2026-07-14 | quality_runner | One explicit click retained focus on `tap-tempo-button`, left project BPM at 82 and Undo disabled, and correctly changed the adjacent readout to `1 tap / Keep tapping / 82 BPM now`; the button itself remained `Tap` with the same generic title. |
| 2026-07-14 | quality_runner | The first implementation Browser pass found `Tap Tempo · history · input` measured 117px and `Tap Tempo · Undo · Keys` still measured 109px inside the closed summary's 104px text track. The summary was compacted to `Tap Tempo · Undo/Keys` before acceptance evidence continued. |
| 2026-07-14 | harness_builder | Added a UI-local presentation for start, one-tap continuation, pending estimate, and applied states; complete two-line button copy; state-aware accessible names/titles; contained styling; and renderer/Electron evidence without changing `tapProjectTempo`, calculation, timer, history, or the adjacent readout. |
| 2026-07-14 | quality_runner | A clean Browser rerun at 1280×720 measured the closed summary at 104/104px inside its 164×38px control, the open Tap Tempo button at 148×38px, readable 68/68px label/detail tracks, and zero internal/document overflow. After one tap the button showed `Tap again · 82 BPM`, retained focus, kept project BPM at 82, left Undo disabled, and exposed the exact one-tap name/title; the development server reported no console errors. |
| 2026-07-14 | quality_runner | Standalone and full-chain production Electron passes confirmed summary discovery, one complete focusable control, readable start/BPM detail, exact state-aware name/title, disclosure-state restoration, containment, and zero internal overflow. The supported 1180px window retained all direct actions with 456.4921875px header height and zero horizontal overflow. `git diff --check`, renderer smoke, typecheck, build, full QA, and full verify passed. |
| 2026-07-14 | review_judge | Separate post-QA review approved with no blocking, major, or moderate findings. Tap timestamps, filter window, retained tap cap, BPM bounds/rounding, delayed undoable commit, reset paths, project schema, playback, persistence, render, MIDI, export, and Quick Actions remain unchanged. |
