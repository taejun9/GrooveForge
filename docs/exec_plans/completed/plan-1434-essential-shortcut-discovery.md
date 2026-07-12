# plan-1434-essential-shortcut-discovery

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the workstation's existing essential keyboard workflow discoverable and machine-readable directly from the controls that perform those actions, without adding toolbar density or changing shortcut behavior.

## Non-Goals

- Adding or remapping keyboard shortcuts.
- Adding visible shortcut chips that widen the transport at common desktop sizes.
- Changing playback, edit history, project I/O, pattern data, rendering, export, or project files.
- Splitting the static Quick Actions/helper bundles in this plan.

## Context Map

- `src/ui/App.tsx`: desktop shortcut handler and transport/project/pattern controls.
- `harness/scripts/run_renderer_smoke.mjs`: first-render semantic shortcut contract.
- `electron/main.ts`: live shortcut attributes, tooltip copy, and state transition evidence.
- `src/vite-env.d.ts`: typed live launch-smoke evidence.
- `harness/scripts/run_desktop_launch_smoke.mjs`: final live Electron assertions and report.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- `aria-keyshortcuts` values must describe the existing actual key handler, including Control and Meta alternatives.
- Tooltips must name the shortcut in plain text without replacing the action label.
- Play/Stop must expose its current pressed state.
- Pattern A/B/C must keep their existing selection, playback, and event-count semantics.
- Preserve local-first behavior and the sample-free event model.

## Implementation Plan

- [x] Add semantic shortcut metadata and shortcut-aware titles to Actions, Help, Play/Stop, Undo, Redo, Open, and Save.
- [x] Add `1`, `2`, and `3` shortcut metadata and titles to Pattern A/B/C tabs.
- [x] Add live pressed-state semantics to Play/Stop.
- [x] Extend renderer and live Electron evidence for the exact metadata, titles, and unchanged state transitions.
- [x] Run focused and full QA, then a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and inspect every declared key against `handleDesktopShortcut`.

## Review Plan

Review starts after QA. It checks ARIA token validity, actual-handler parity, tooltip clarity, Play pressed state, pattern tab semantics, disabled Undo/Redo behavior, narrow-layout density, and project/audio/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Use `aria-keyshortcuts` plus shortcut-aware native titles rather than visible keyboard chips. | Assistive technology and hover users gain direct discovery without making the already dense transport wrap earlier. |
| 2026-07-13 | Declare both Control and Meta alternatives for desktop command shortcuts. | GrooveForge uses `event.ctrlKey || event.metaKey`; metadata must match Windows/Linux and macOS behavior rather than documenting one platform only. |
| 2026-07-13 | Include Pattern A/B/C numeric shortcuts in the same plan. | Pattern switching is a core professional editing loop and the existing `1/2/3` handler is otherwise only discoverable in Command Reference. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit confirmed Command Reference documents the shortcuts, but their direct transport/project/pattern controls expose action-only titles and no `aria-keyshortcuts`. |
| 2026-07-13 | harness_builder | Renderer and Electron evidence now validates exact Control/Meta alternatives, Space, Pattern 1/2/3, shortcut-aware titles, and initial Play pressed state. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer/workflow/persona smokes, production build, live Electron launch, native project I/O, and diff checks passed. |
| 2026-07-13 | review_judge | Post-QA review matched every declared shortcut to `handleDesktopShortcut` and approved the semantics with no blocking findings. |

## Completion Notes

- Actions, Help, Play/Stop, Undo, Redo, Open, and Save expose their existing shortcuts through `aria-keyshortcuts` and native title hints.
- Control and Meta alternatives match the current cross-platform event handler.
- Pattern A/B/C exposes numeric shortcuts 1/2/3 without changing selection, playback-follow, or event-count behavior.
- Play/Stop exposes its current `aria-pressed` state in addition to its live label and icon.
- Review: `docs/reviews/plan-1434-essential-shortcut-discovery-review.md`.
