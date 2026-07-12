# plan-1429-chord-card-density

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make chord events easy to scan by keeping every event compact until selected, while preserving the complete professional event editor on the active chord.

## Non-Goals

- Removing Step, Root, Quality, Voicing, Length, Velocity, Chance, audition, clipboard, duplicate, movement, or delete controls.
- Changing chord event data, playback, synthesis, save/load, rendering, exports, presets, or harmony generation.
- Adding piano-roll drag editing, multi-select, cloud behavior, imported audio, or sampling workflows.

## Context Map

- `src/ui/workstationComposePanels.tsx`: chord event card structure and selected-event editor.
- `src/styles.css`: compact card, expanded selected card, and responsive layout.
- `src/ui/App.tsx`: selected chord state and live Electron evidence hook.
- `src/vite-env.d.ts`: typed launch-smoke evidence.
- `electron/main.ts`: production renderer hierarchy evidence.
- `harness/scripts/run_renderer_smoke.mjs`: source-rendered compact/expanded contract.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live selected-card expansion evidence.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Every chord remains visible and selectable without opening a secondary panel.
- The selected chord exposes every existing direct-edit field and keeps its test IDs.
- Compact cards expose enough musical context to compare step, chord, voicing, length, velocity, and chance.
- Preserve keyboard focus, delete behavior, selection behavior, local-first boundaries, and the sample-free event model.

## Implementation Plan

- [x] Add a compact per-chord summary with edit-state context.
- [x] Group detailed fields into a selected-only editor while retaining the existing inputs and handlers.
- [x] Let the selected card span the editor width and keep unselected cards compact.
- [x] Add renderer and live Electron assertions for one expanded selected card and compact peers.
- [x] Run focused and full QA, then a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and compare all prior chord field/action test IDs.

## Review Plan

Review starts after QA. It checks scan clarity, selected-card discoverability, keyboard selection, full expert control preservation, narrow-width layout, playback/selection state coexistence, and project/audio/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Expand only the selected chord event instead of adding a separate inspector panel. | The existing selection state already defines the active editing target, keeps edits in musical context, and avoids another disconnected surface. |
| 2026-07-13 | Keep all detailed controls mounted but hide the unselected editors with layout CSS. | Existing handlers, field test IDs, and form behavior remain intact while keyboard navigation skips collapsed controls. |
| 2026-07-13 | Add explicit Enter and Space selection to each focusable chord card. | Keyboard activation should not depend only on focus-event behavior, and the same selection path remains available to pointer users. |
| 2026-07-13 | Collect keyboard transition evidence in the existing state-changing launch-smoke hook, not the initial DOM reader. | Initial DOM collection must remain a deterministic pure read in a hidden Electron window; the palette hook already uses synchronous React commits for interaction evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree after the ready-to-use review follow-up audit. |
| 2026-07-13 | repo_cartographer | Audit confirmed every chord card simultaneously exposes seven edit groups; plan-1421 had already identified this as the remaining Instrument-panel density risk. |
| 2026-07-13 | harness_builder | Renderer and live Electron evidence require exactly one visible selected editor, compact peers, hidden peer editors, and Enter/Space selection plus restoration. |
| 2026-07-13 | review_judge | Review strengthened keyboard evidence after hidden-window focus alone proved indirect; explicit key handlers and synchronous interaction evidence now pass. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer/workflow/persona smokes, production build, native project I/O, live Electron launch smoke, and diff checks passed. |

## Completion Notes

- Every chord remains visible with chord name, step, voicing, length, velocity, chance, and edit-state context.
- Exactly one selected chord exposes the complete Step, Root, Quality, Voicing, Length, Velocity, and Chance editor.
- Pointer, focus, Enter, and Space routes reuse the existing chord selection handler; no chord data or audio behavior changed.
- At 620px and below the selected editor becomes one column while compact summaries retain three musical metrics.
- Review: `docs/reviews/plan-1429-chord-card-density-review.md`.
