# plan-1430-arrangement-block-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the selected arrangement block editor understandable at a glance and reliable at narrow widths by labeling its musical control groups and adapting the layout without removing professional structure controls.

## Non-Goals

- Removing section, pattern, track mute, clipboard, bars, split, energy, move, duplicate, merge, or delete controls.
- Changing arrangement data, playback, history, project files, rendering, exports, templates, or analysis.
- Adding timeline drag/drop, cloud collaboration, imported audio, or sampling workflows.

## Context Map

- `src/ui/App.tsx`: selected-block editor markup and existing handlers.
- `src/styles.css`: group hierarchy and responsive layout.
- `electron/main.ts`: production renderer arrangement evidence.
- `harness/scripts/run_renderer_smoke.mjs`: first-render label and hierarchy contract.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live group visibility and narrow-layout evidence.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Keep every existing arrangement action and test ID.
- Pattern and track buttons need visible beginner-readable group labels while retaining compact producer scanning.
- At 620px and below essential controls must use one column without horizontal overflow.
- Preserve local-first, sample-free, event-based project behavior.

## Implementation Plan

- [x] Add visible group headings and live context for pattern choice and per-block track state.
- [x] Group bars, split point, and energy as block-shape controls without changing handlers.
- [x] Make the selected-block editor single-column at narrow width while retaining two-column tablet and full desktop layouts.
- [x] Extend renderer and live Electron evidence for labels, hierarchy, and responsive layout.
- [x] Run focused and full QA, then a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and compare all prior arrangement editor test IDs.

## Review Plan

Review starts after QA. It checks beginner label clarity, producer scan density, selected-block context, narrow-width behavior, keyboard controls, disabled-state explanations, action preservation, and arrangement/audio/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Improve the existing selected-block editor instead of adding another inspector. | The current timeline selection is already the authoritative editing context and should remain the single direct-edit surface. |
| 2026-07-13 | Use visible group headings for Pattern and Track State. | The current A/B/C and mute buttons expose behavior only through aria labels and tooltips, which is insufficient for first-time visual understanding. |
| 2026-07-13 | Group Bars, Split after, and Energy under Block shape. | These controls collectively define section duration and intensity and should scan as one musical task instead of unrelated numeric inputs. |
| 2026-07-13 | Use one field column and two structure-action columns at 620px and below. | The former two-field/six-action layout could force cramped controls or overflow on very narrow windows. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit confirmed the selected-block editor drops to two columns but never one, and its Pattern and Track Mute groups have no visible labels. |
| 2026-07-13 | harness_builder | Renderer evidence now checks visible group order and the 620px CSS contract; live Electron evidence requires all three groups to be visible before optional arrangement tools. |
| 2026-07-13 | review_judge | Review added an explicit Split ready / 1 bar cannot split cue so the disabled split state has a visible reason. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer/workflow/persona smokes, production build, native project I/O, live Electron launch smoke, and diff checks passed. |

## Completion Notes

- Pattern shows the selected A/B/C slot and its editable event count.
- Track state shows All playing or the current muted-track count above the existing per-block mute buttons.
- Block shape unifies Bars, Split after, Energy, and split availability without changing any input behavior.
- Tablet layouts use two editor columns and three structure-action columns; 620px-and-below layouts use one editor column and two action columns.
- Review: `docs/reviews/plan-1430-arrangement-block-clarity-review.md`.
