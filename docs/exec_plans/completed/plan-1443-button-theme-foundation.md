# plan-1443-button-theme-foundation

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Eliminate browser-native light button chrome across the local workstation by establishing a safe dark-theme button foundation with readable default, hover, focus-visible, and disabled states, while preserving every component-specific visual hierarchy and existing explicit action path.

## Non-Goals

- Changing button labels, command ids, ordering, disclosure, or click behavior.
- Changing project data, undo/redo, playback, MIDI, render/export, local drafts, or save/load.
- Redesigning specialist control states that already override the base foundation.
- Adding imported audio, sampling-first behavior, remote AI, accounts, analytics, or cloud behavior.

## Context Map

- `src/styles.css`: global form-control reset and component-specific button systems.
- `src/ui/App.tsx`: Groove presets, clipboards, stem audition, mix snapshots, brief starters, and review actions.
- `harness/scripts/run_renderer_smoke.mjs`: source/style contract for first render.
- `electron/main.ts` and `harness/scripts/run_desktop_launch_smoke.mjs`: production computed-style evidence.
- `docs/product/product.md`, `docs/architecture/product-architecture.md`, and `docs/quality/rules.md`: durable workstation UI contract.

## Constraints

- QA completes before a separate review starts.
- The base selector remains lower-specificity than component selectors.
- Every rendered button must override native appearance and expose a non-native background, border, radius, readable foreground, focus-visible outline, and disabled posture.
- Existing specialist selected, active, danger, icon, segmented, and transport styles must continue to win.
- No automatic action, project mutation, playback, export, or remote behavior may be introduced.

## Implementation Plan

- [x] Add a low-specificity dark button foundation with hover, focus-visible, and disabled states.
- [x] Add renderer and production Electron evidence that representative formerly-native controls inherit the foundation.
- [x] Verify specialist controls retain their computed selected/active styling and behavior.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run focused/full QA and desktop evidence, then perform a separate review.

## QA Plan

- Run `npm run renderer:smoke`, `npm run typecheck`, and `npm run qa`.
- Run `npm run harness:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run quick-actions:bundle-smoke`, `npm run desktop:launch-smoke`, and `npm run desktop:project-io-smoke`.
- Run `git diff --check`; inspect live browser default/hover/focus/disabled states and scan all rendered buttons for native light surfaces.

## Review Plan

Review starts only after QA. It checks selector specificity, dark-theme consistency, keyboard focus, disabled posture, representative first-viewport and deep-workflow controls, existing specialist styles, behavior preservation, and project invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Fix the recurrence at the low-specificity button foundation rather than patching each component. | Live browser evidence found 47 native-light buttons across first-viewport and deep workflow surfaces; repeated component patches would leave the defect easy to reintroduce. |
| 2026-07-13 | Keep component-specific state systems authoritative over the shared base. | Specialist transport, segmented, selected, active, warning, and action treatments carry semantic hierarchy that a foundation must not flatten. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | quality_runner | Live 1280×720 browser scan found five native-white buttons in the active editing viewport and 47 across the rendered workstation; computed backgrounds were `rgb(239, 239, 239)` with black text and border. |
| 2026-07-13 | harness_builder | Added a zero-specificity `:where(button)` foundation and renderer/Electron evidence covering representative inherited, disabled, and specialist controls. |
| 2026-07-13 | quality_runner | Live browser scanned 990 rendered buttons with zero native appearances or white native surfaces; six representative controls inherited dark surfaces, focus showed a 2px cyan outline with 2px offset, and Play/Swing specialist colors remained intact. |
| 2026-07-13 | quality_runner | The first Electron run exposed TypeScript-only predicate syntax inside a renderer JavaScript string; replaced it with `filter(Boolean)`, rebuilt, and the full production Electron rerun passed with six representatives and zero native surfaces. |
| 2026-07-13 | review_judge | Separate post-QA review approved the low-specificity foundation with no remaining blockers; button behavior, project data, audio, export, privacy, and sampling boundaries remain intact. |
