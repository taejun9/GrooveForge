# plan-1463-metronome-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the essential Transport metronome control name its function, current On/Off state, and current BPM without opening Help, Quick Actions, or a tooltip. First-time composers should understand what `Click` means before activating it; working composers should confirm click posture at a glance while retaining the same one-click, undoable toggle.

## Evidence and Motivation

Live Browser audit on clean `main` at `0a7f30b7` found the metronome control rendered as `Click` with no explicit accessible name and no visible state or BPM. At 1280×720 it measured 79px by 38px inside a 340px command strip; at the supported 1180×720 minimum it measured 132.8px by 38px inside a contained 555px strip. Both layouts had zero internal and document horizontal overflow. The control already exposes boolean `aria-pressed`, selected styling, and a state-aware title, but Off/On is only visible through color or hover and `Click` does not identify the metronome for a first-time composer. Clicking it changed `aria-pressed` from false to true, changed the title from `Turn metronome on` to `Turn metronome off`, focused the same `Click` name, and enabled Undo.

## Non-Goals

- Changing `toggleMetronome`, project mutation, undo/redo, metronome scheduling, tempo, playback, loop scope, Tap Tempo, audio synthesis, save/load, render, MIDI, or export.
- Adding count-in, recording, time signatures, accent patterns, click sounds, click volume, shortcuts, automation, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Restructuring the full Transport command strip or changing other direct command buttons.

## Constraints

- QA completes before a separate review starts.
- Preserve the existing test id, click handler, boolean `aria-pressed`, selected class, title behavior, project update, undo entry, and one-click activation.
- Show a complete `Metronome` label plus live `Off/On · N BPM` detail without truncation at 1280px or the supported 1180px minimum.
- Expose a unique state-aware accessible name that identifies Metronome, current On/Off state, current BPM, and the next toggle action.
- Keep the control contained, keyboard-focusable, and free of internal or document horizontal overflow without making the compact Transport miss its existing launch-layout contracts.
- Renderer and production Electron evidence cover visible copy, accessible name, pressed state, title, dimensions, readability, focusability, and containment; Browser proves actual Off-to-On state/name/title/focus changes.

## Implementation Plan

- [x] Replace the ambiguous visible `Click` label with a compact two-line Metronome/state/BPM readout.
- [x] Add a state-aware accessible name while retaining the existing title, pressed state, handler, and project mutation path.
- [x] Add contained responsive styling that preserves compact Transport height and direct producer scanning.
- [x] Add renderer and production Electron regression evidence and update durable product, architecture, and quality contracts.
- [x] Run Browser at 1280px and 1180px, production Electron, full QA, and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make essential Metronome clarity the plan-1463 target. | The current direct control is space-contained but exposes only `Click`; neither audience can see its current state or tempo without color, hover, or separate command surfaces. |
| 2026-07-14 | Keep the existing undoable project toggle as the only behavior boundary. | The problem is presentation and state legibility, not metronome scheduling or persistence. |
| 2026-07-14 | Prefer complete `Metronome` vocabulary over the professional shorthand `Click`. | Beginners should not need prior studio jargon, while professionals still recognize the explicit term immediately. |
| 2026-07-14 | Use a compact two-line native button and remove the icon only from this control. | Complete vocabulary plus live state/BPM fit the existing direct action without increasing the 38px control or 298px compact Transport. |
| 2026-07-14 | Give the command-strip override a specific 4px inline padding and stretch its content track. | Browser measurement left roughly 10px of intrinsic text safety margin in the 79px compact control while preserving zero overflow. |
| 2026-07-14 | Derive live Electron evidence from the mounted BPM field and button pressed state. | Starter creation can replace the project after the evidence callback is created; measuring independent mounted controls avoids stale closure values and verifies the visible state is internally consistent. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main` at `0a7f30b7`; the unrelated plan-085 worktree and its existing untracked active plan remain untouched. |
| 2026-07-14 | repo_cartographer | Browser audit measured the control as 79px by 38px at 1280×720 and 132.8px by 38px at 1180×720, with zero strip/document overflow. It had visible/accessibility text `Click`, no explicit accessible name, no visible state/BPM, boolean pressed state, and a state-aware title. |
| 2026-07-14 | quality_runner | Browser activation proved the existing path: false became true, title changed from `Turn metronome on` to `Turn metronome off`, focus stayed on the ambiguous `Click` name, and Undo became available. |
| 2026-07-14 | harness_builder | Replaced `Click` with complete `Metronome` and live `Off/On · N BPM`, added the state/BPM/next-action accessible name, compact two-line styling, renderer assertions, nine live Electron evidence fields, and durable product/architecture/quality contracts. The original id, handler, pressed state, selected class, title, project mutation, and Undo path remain intact. |
| 2026-07-14 | quality_runner | Browser at 1280×720 measured a readable 79px by 38px control inside the unchanged 340px essential strip, a 69px content track with roughly 10px intrinsic text margin, zero button/document overflow, and the unchanged 298px header. At 1180×720 it measured 132.8px by 38px inside the unchanged 555px strip, zero overflow, and the established 456.5px minimum-window header. |
| 2026-07-14 | quality_runner | Browser interaction proved the visible `Off · 82 BPM` and accessible `Metronome off, 82 BPM. Turn on` state changed to `On · 82 BPM` and `Metronome on, 82 BPM. Turn off`; pressed/selected/title followed, focus remained on the same newly named button, Undo enabled, and Undo restored the Off state with Redo available. A clean fresh Browser session had no console errors. |
| 2026-07-14 | quality_runner | The first production Electron pass found the evidence callback comparing the live 86 BPM Beginner starter against its earlier 82 BPM closure. The evidence source was corrected to the mounted BPM input and button pressed state; typecheck, renderer smoke, and build passed again, and the repeated Electron run confirmed complete copy, state-aware name, pressed semantics, title, readability, focusability, containment, and zero internal overflow. |
| 2026-07-14 | quality_runner | `git diff --check`, `npm run typecheck`, `npm run renderer:smoke`, `npm run build`, standalone `npm run desktop:launch-smoke`, and `npm run qa` passed. Full `npm run verify` exited 0 after repeating renderer, workflow, persona, 14-style runtime, Electron, project I/O, app/DMG/PKG/install, local delivery, privacy, and release-readiness evidence. |
| 2026-07-14 | review_judge | Separate post-QA review found no blocking, major, or moderate issues. The change remains a presentation/accessibility projection over existing metronome and BPM state and preserves scheduler, history, persistence, render, MIDI, and export boundaries. |
