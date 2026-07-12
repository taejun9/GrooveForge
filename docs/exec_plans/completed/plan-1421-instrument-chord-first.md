# plan-1421-instrument-chord-first

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make direct chord-event creation and editing the first Instrument-panel workflow while keeping complete sound-design and harmony-move tooling immediately available without forcing beginners through dense expert controls.

## Non-Goals

- Removing sound presets, drum-kit controls, timbre controls, snapshots, chord presets, harmony pads, rhythm pads, voicing pads, or event inspectors.
- Changing chord-event data, synthesis, playback, rendering, exports, project files, or style profiles.
- Redesigning Arrangement, Mixer, Master, or Delivery panels.
- Adding sampling, cloud services, accounts, analytics, payments, or external distribution work.

## Context Map

- `src/ui/App.tsx`: Instrument-panel hierarchy and audience mode.
- `src/ui/workstationComposePanels.tsx`: Chord Editor and Sound Designer surfaces.
- `src/styles.css`: Instrument, chord, and disclosure layout.
- `electron/main.ts`: live desktop hierarchy evidence.
- `harness/scripts/run_renderer_smoke.mjs`: first-render hierarchy assertions.
- `harness/scripts/run_desktop_launch_smoke.mjs`: packaged desktop evidence assertions.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Preserve direct, event-based, sample-free, local-first composition.
- Preserve every existing expert control and make disclosure state keyboard accessible.

## Implementation Plan

- [x] Put Chord Editor immediately after the Instrument panel title.
- [x] Put chord-event cards and essential selection controls before generative harmony tools.
- [x] Group Sound Designer and Harmony Moves into keyboard-accessible disclosures.
- [x] Keep expert surfaces expanded by default in Studio and compact by default in Guided mode.
- [x] Add renderer and live desktop hierarchy evidence.
- [x] Run focused QA and a separate post-QA review.

## QA Plan

- Run `npm run qa` and `npm run typecheck`.
- Run `npm run renderer:smoke`, `npm run workflow:smoke`, and `npm run persona:smoke`.
- Run `npm run build`, `npm run desktop:launch-smoke`, and `npm run desktop:project-io-smoke`.
- Run `git diff --check`.

## Review Plan

Review starts after QA. It checks direct chord discoverability, professional control preservation, disclosure semantics, audience-mode defaults, result visibility, responsive behavior, and event/playback/export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Use direct chord events as the Instrument panel's first editing surface. | Editable musical events are the shared novice/professional workflow; tone shaping supports those events rather than preceding them. |
| 2026-07-13 | Keep advanced disclosures compact in Guided and expanded in Studio. | Beginners get a readable first path while working composers retain immediate access without losing any controls. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found device cards and the complete Sound Designer before chords, plus harmony generators before chord-event cards. |
| 2026-07-13 | harness_builder | Reordered direct chord editing, added audience-mode disclosures and auto-reveal handlers, and extended renderer/live Electron evidence. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer, workflow, persona, build, live Electron hierarchy/interaction/visual, and native project I/O checks passed. |
| 2026-07-13 | review_judge | Separate post-QA diff review found no blocker; direct events lead the panel, disclosure state follows audience mode, targeted actions reveal hidden results, and all prior expert controls remain present. |

## Completion Notes

The Instrument panel now opens on editable chord events rather than device summaries and the full Sound Designer. Selected-chord function, audition, movement, duplication, inversion, clipboard, and detailed event cards stay in the direct path. Progression presets, reharmonization pads, chord rhythm, and voicing sit afterward in Harmony Moves; devices, kits, tone shaping, and snapshots sit afterward in Sound Design.

Guided mode keeps both advanced areas compact. Studio mode expands both through a shared mode handler, and sound/harmony Quick Actions or apply actions reveal the relevant area before presenting their result. No chord, sound, playback, project, render, export, style, or file-format data behavior changed.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, and `git diff --check` passed. The build retains the existing nonfatal frontend chunk-size warning. External distribution was not exercised or claimed.
