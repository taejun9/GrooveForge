# plan-1422-arrangement-timeline-first

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the audible block timeline and selected-block structure editor the primary Arrangement workflow while preserving templates, pattern chains, arrangement analysis, and producer move tools in audience-aware on-demand surfaces.

## Non-Goals

- Removing templates, arc pads, section locators, pattern chains, focus tools, mute maps, transition maps, block moves, or priority readouts.
- Changing arrangement data, playback, section semantics, rendering, exports, project files, or style profiles.
- Redesigning Compose, Instrument, Mixer, Master, or Delivery panels.
- Adding sampling, cloud services, accounts, analytics, payments, or external distribution work.

## Context Map

- `src/ui/App.tsx`: Arrangement hierarchy, state, and action handlers.
- `src/styles.css`: arrangement editor and disclosure layout.
- `electron/main.ts`: live desktop hierarchy evidence.
- `harness/scripts/run_renderer_smoke.mjs`: first-render hierarchy assertions.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live audience-mode and DOM assertions.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Preserve direct, event-based, sample-free, local-first composition.
- Preserve every existing expert control, its test ID, and keyboard disclosure behavior.

## Implementation Plan

- [x] Put playback context, block timeline, and selected-block editor immediately after the Arrangement title.
- [x] Put section, pattern, mutes, bars, energy, clipboard, and structural actions before optional block-move analysis.
- [x] Group producer block moves and arrangement-building/analysis tools into accessible disclosures.
- [x] Keep advanced surfaces compact in Guided and expanded in Studio, with targeted actions revealing their destination.
- [x] Extend renderer and live Electron hierarchy/mode evidence.
- [x] Run focused QA and a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check`.

## Review Plan

Review starts after QA. It checks timeline discoverability, direct edit order, audience-mode defaults, hidden-result reveal, accessibility, professional-tool preservation, and arrangement/playback/export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Lead Arrangement with the audible timeline and selected block. | Both audiences need to see and edit the song form before choosing generators or analysis tools. |
| 2026-07-13 | Separate Block Moves from broader Arrangement Tools. | A selected-block producer operation and a song-form generator answer different questions and should not compete with essential fields. |
| 2026-07-13 | Keep both disclosures compact in Guided and expanded in Studio. | Beginners get a legible first path while professional producers retain immediate access to the complete toolset. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found seven generator/analysis surfaces before the block timeline and priority analysis before essential selected-block structure controls. |
| 2026-07-13 | harness_builder | Reordered the direct timeline/editor path, added Block Moves and Arrangement Tools disclosures, wired targeted reveal, and extended renderer/live Electron evidence. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer, workflow, persona, build, live Electron hierarchy/mode/visual, and native project I/O checks passed. |
| 2026-07-13 | review_judge | Separate post-QA diff review found no blocker; all prior Arrangement controls remain present, the two disclosures span their intended layouts, and targeted actions reveal hidden destinations. |

## Completion Notes

Arrangement now begins with audible playback context, the block timeline, and the selected-block editor. Section, pattern, block mutes, clipboard, bars, split point, energy, move/duplicate/split/merge/delete controls, and direct result feedback remain in the primary path. Producer presets and priority previews follow in Block Moves; templates, energy arcs, section cues, pattern chains, focus shaping, mute maps, and transition maps follow in Arrangement Tools.

Guided mode keeps both advanced areas compact. Studio mode expands both through the shared mode-aware panel handler. Quick Actions and apply/focus/cue operations targeting those tools open the relevant disclosure, and no prior Arrangement test-ID surface was removed.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, and `git diff --check` passed. The build retains the existing nonfatal frontend chunk-size warning. External distribution was not exercised or claimed.
