# plan-1427-transport-essentials

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make play, loop, click, command help, edit recovery, and project file actions the clear top-bar essentials while preserving tempo/context diagnostics and professional exports in audience-aware secondary groups.

## Non-Goals

- Removing any transport, tempo, status, undo/redo, project, Quick Actions, Help, or export action.
- Changing shortcuts, musical input, playback, scheduling, rendering, export bytes, project files, or schema.
- Moving direct beat composition behind setup, sampling, or diagnostics.
- Adding remote services, accounts, analytics, payments, uploads, or external distribution work.

## Context Map

- `src/ui/App.tsx`: transport command hierarchy, disclosure state, and mode behavior.
- `src/styles.css`: essential groups, disclosures, and responsive layout.
- `src/vite-env.d.ts`: typed mode evidence.
- `electron/main.ts`: live hierarchy, audience defaults, and visibility evidence.
- `harness/scripts/run_renderer_smoke.mjs`: first-render essential-before-helper assertions.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live Guided/Studio disclosure and DOM evidence.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Preserve every existing command and test ID.
- Play and project safety actions remain directly available in both modes.
- Exports remain explicit local user actions.

## Implementation Plan

- [x] Group status, position, loop scope, metronome, and Play as direct transport essentials.
- [x] Keep Actions, Help, Undo, Redo, Open, and Save directly available as project essentials.
- [x] Group Tap Tempo plus edit/input posture into Session Context.
- [x] Group WAV, stems, MIDI, sheet, and bundle into Exports.
- [x] Collapse both secondary groups in Guided and expand them in Studio through the shared mode handler.
- [x] Extend renderer and live Electron evidence, then run focused QA and a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, and `npm run delivery:bundle-zip-smoke`.
- Run `git diff --check` and compare prior top-bar test IDs.

## Review Plan

Review starts after QA. It checks play prominence, project safety access, disclosure semantics, mode defaults, export reachability, hidden-result behavior, keyboard focus, responsive layout, and command/export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Keep Play, loop, click, Actions, Help, Undo/Redo, Open, and Save direct. | These are core session and recovery controls for both audiences. |
| 2026-07-13 | Separate Session Context from Exports. | Tempo/edit/input diagnostics and file delivery are different jobs and should not share an ambiguous overflow menu. |
| 2026-07-13 | Collapse secondary groups in Guided and expand them in Studio. | Beginners receive a readable top bar while producers retain immediate full-session access. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found roughly twenty status, transport, edit, file, and export elements competing inside one command strip. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer, workflow, persona, build, live Electron hierarchy/mode/visual, native project I/O, delivery ZIP, and diff checks passed. |
| 2026-07-13 | review_judge | Separate post-QA review found no blockers; direct Play/project safety, native summary keyboard behavior, responsive layout, and all existing command/export IDs remain intact. |

## Completion Notes

The command strip now presents status and position, loop scope, click, Quick Actions, Help, and the primary Play control as direct transport essentials. Undo, Redo, Open, and Save remain direct project-safety controls. None of these require opening a helper surface.

Tap Tempo, its readout, edit history, and keyboard capture posture are grouped under Session Context. Mix WAV, stem WAVs, MIDI, Handoff Sheet, and Delivery Bundle are grouped under Exports. Both use native details/summary semantics with controlled state, visible labels, concise scope copy, and chevrons. Guided starts compact; Studio expands both through the shared audience-mode handler and returning to Guided collapses them again.

At narrow widths the transport and project essentials become two-column button grids, playback scope spans the row, status cards stack to full width, and the helper groups occupy full width. No keyboard bindings, musical capture behavior, playback, project data, rendering, export bytes, or filenames changed.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, `npm run delivery:bundle-zip-smoke`, and `git diff --check` passed. The build retains the existing nonfatal frontend chunk-size warning. External distribution was not exercised or claimed.
