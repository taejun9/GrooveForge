# plan-1442-swing-feel-pad-legibility

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make every Swing Feel pad immediately legible and stateful in the first drum-editing viewport: dark-theme surfaces with clear label/value/detail hierarchy, visible hover/focus/selected states, and truthful pressed semantics while preserving the existing undoable swing workflow.

## Non-Goals

- Changing swing target values, style defaults, playback timing, rendering, MIDI, or humanize behavior.
- Adding new groove presets, quantization, timing extraction, audio analysis, or auto-application.
- Changing project schema, save/load, local drafts, undo/redo, Quick Actions command ids, or result metrics.
- Adding sampling, imported audio, remote AI, accounts, analytics, or cloud behavior.

## Context Map

- `src/ui/App.tsx`: Swing Feel pad markup, selected derivation, and explicit apply handler.
- `src/styles.css`: missing native-button reset for `.swing-feel-row` and responsive pad grid.
- `harness/scripts/run_renderer_smoke.mjs`: first-render markup/style/source contracts.
- `electron/main.ts` and `harness/scripts/run_desktop_launch_smoke.mjs`: production computed-style, selection, and accessibility evidence.
- `docs/product/product.md`, `docs/architecture/product-architecture.md`, and `docs/quality/rules.md`: setup control behavior and non-mutation boundaries.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- All five pads must override browser-native light button backgrounds and expose readable label, percentage, and detail text.
- Exactly the current swing target must expose `aria-pressed="true"` and a selected visual state.
- Focus-visible must be distinguishable without relying on color alone; hover must not mask the selected state.
- Visible clicks and Quick Actions keep using the existing `applySwingFeelPad` undoable project update path.

## Implementation Plan

- [x] Add explicit pressed semantics and stable context for all five Swing Feel pads.
- [x] Add complete dark-theme base, hover, focus-visible, selected, and text-hierarchy styling.
- [x] Add renderer and production Electron evidence for exact computed backgrounds, text contrast posture, focus contract, and one selected pad.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run focused/full QA and desktop evidence, then perform a separate review.

## QA Plan

- Run `npm run renderer:smoke`, `npm run typecheck`, and `npm run qa`.
- Run `npm run harness:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run quick-actions:bundle-smoke`, `npm run desktop:launch-smoke`, and `npm run desktop:project-io-smoke`.
- Run `git diff --check`; inspect live browser computed styles, selected state, focus ring, and before/after swing result.

## Review Plan

Review starts only after QA. It checks first-viewport readability, native-style override, selection/focus semantics, responsive layout, existing swing mutation/undo behavior, and preservation of all project invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Treat the Swing Feel issue as a control-system defect, not a one-off color tweak. | Live browser evidence showed missing base button styling and missing pressed semantics; base, hierarchy, selection, hover, focus, and accessibility states must be fixed together. |
| 2026-07-13 | Retain five direct buttons and add `aria-pressed` instead of converting to a radio group. | The controls are explicit action presets that also reapply the current value through the existing command path; pressed buttons preserve current behavior while exposing the selected target. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | quality_runner | Live in-app browser measured native button backgrounds at `rgb(239, 239, 239)`, label color at `rgba(244, 239, 231, 0.62)`, and no `aria-pressed`, matching the white-pad visual failure in the first drum-editing viewport. |
| 2026-07-13 | harness_builder | Added complete dark button states, truthful pressed semantics, renderer contracts, and production Electron computed-style evidence without changing the existing swing mutation path. |
| 2026-07-13 | quality_runner | Live browser confirmed all five pads use `appearance: none`, readable dark surfaces, exactly one selected Style target, Tight click updates 16% to 6%, and keyboard focus shows a 2px cyan outline. Full QA, build, workflow/persona, desktop launch, and native project I/O checks passed. |
| 2026-07-13 | review_judge | Separate post-QA review approved the change with no remaining blockers; timing targets, undoable mutation, project schema, playback, render/export, privacy, and sampling boundaries remain intact. |
