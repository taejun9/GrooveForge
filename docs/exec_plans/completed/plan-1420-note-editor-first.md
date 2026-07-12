# plan-1420-note-editor-first

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make direct 808 and melody note editing the primary path while keeping keyboard capture, MIDI input, and guided idea tools available in an on-demand surface that automatically reveals itself when input capture is active.

## Non-Goals

- Removing keyboard capture, MIDI input, bassline, glide, contour, motif, accent, or melody contour tools.
- Changing note data, scale locking, playback, rendering, exports, or file formats.
- Redesigning the Instrument, Arrangement, Mixer, or Master panels in this plan.
- External distribution, private release values, cloud services, or sampling-first work.

## Context Map

- `src/ui/App.tsx`: 808/Melody panel state and render order.
- `src/ui/workstationComposePanels.tsx`: keyboard and MIDI capture panels.
- `src/styles.css`: piano-panel and note-grid layout.
- `electron/main.ts`: live desktop hierarchy evidence.
- `harness/scripts/run_renderer_smoke.mjs`: first-render hierarchy regression checks.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live Electron evidence checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve event-based, sample-free, local-first direct composition.

## Implementation Plan

- [x] Group keyboard capture, MIDI input, and idea pads into Capture & Ideas.
- [x] Keep the 808 and Synth note grids immediately after the panel header and compact disclosure summary.
- [x] Automatically reveal Capture & Ideas whenever keyboard capture or MIDI listening is armed.
- [x] Add target/input status context, keyboard disclosure semantics, and responsive styling.
- [x] Extend server-render and live Electron evidence for the note-editor-first hierarchy.
- [x] Run focused QA, product verification in scope, and a separate review.

## QA Plan

- Run `npm run renderer:smoke`.
- Run `npm run workflow:smoke` and `npm run persona:smoke`.
- Run `npm run typecheck`, `npm run build`, and `npm run qa`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check`.
- Refresh the bounded 10-plan progress report after completion.

## Review Plan

QA completes before review starts. Review checks direct note discoverability, capture auto-reveal, advanced-tool preservation, accessibility, and beginner/producer regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-12 | Use one Capture & Ideas disclosure around input setup and generation helpers. | The note grids are the shared beginner/professional editing surface; capture and idea generation remain valuable but are contextual tools. |
| 2026-07-12 | Auto-open the disclosure when keyboard or MIDI capture is armed. | Active input state must never be hidden from a working composer. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-12 | project_lead | Plan created in the dedicated feature worktree. |
| 2026-07-12 | repo_cartographer | Source audit found capture setup and nine idea-pad groups before both note grids. |
| 2026-07-12 | harness_builder | Added Capture & Ideas, immediate keyboard/MIDI reveal handlers, responsive styling, and live layout evidence. |
| 2026-07-12 | quality_runner | QA, typecheck, renderer, workflow, persona, build, live Electron interaction/layout, visual, and native project I/O checks passed. |
| 2026-07-12 | review_judge | Separate post-QA diff review found no blocking issue; capture state is visible when active, all prior tools remain available, and launch evidence restores its test state. |

## Completion Notes

Grouped keyboard capture, Web MIDI input, bass moves, and melody starters into a keyboard-accessible, collapsed-by-default Capture & Ideas surface. The 808 and Synth note grids now form the default editing path. Arming keyboard capture or MIDI input opens the surface immediately through shared handlers used by both visible controls and Quick Actions.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, and `git diff --check` passed. Live Electron evidence confirms Capture & Ideas collapsed by default, auto-reveal on keyboard arm, state reset after proof, and note grids ordered after the compact disclosure. External distribution was not exercised or claimed.

The completed-plan source confirms the 10-number checkpoint from plan 1411 through plan 1420. The automated release-progress refresh was also attempted, but correctly stopped because ignored external-release source artifacts are absent in this worktree; no private-value, signing, notarization, upload, or network workflow was run to manufacture that unrelated evidence.
