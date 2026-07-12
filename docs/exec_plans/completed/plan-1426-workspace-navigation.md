# plan-1426-workspace-navigation

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the Compose → Arrange → Mix → Deliver workflow map an always-available workstation control so first-time users understand the product flow and working composers can jump between major stages without opening guidance.

## Non-Goals

- Removing Workflow Navigator spotlight, readiness, result, Quick Actions, or Guide & Review Center content.
- Adding global keyboard shortcuts that could conflict with musical input or DAW conventions.
- Changing composition, arrangement, mix, master, export, project, playback, or render behavior.
- Adding sampling, remote services, accounts, analytics, payments, uploads, or external distribution work.

## Context Map

- `src/ui/App.tsx`: Workflow Navigator location and workstation panel targets.
- `src/ui/workstationGuidancePanels.tsx`: existing navigator semantics and controls.
- `src/styles.css`: top-level, sticky, and responsive navigation layout.
- `src/vite-env.d.ts`: typed live evidence contract.
- `electron/main.ts`: live outside-guide, visibility, order, and sticky evidence.
- `harness/scripts/run_renderer_smoke.mjs`: first-render source-order and hidden-parent assertions.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live hierarchy, jump target, and responsive evidence.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Preserve direct, event-based, sample-free, local-first composition.
- Preserve all existing Workflow Navigator actions and test IDs.
- Compose remains the first workflow stage and first-run product posture.

## Implementation Plan

- [x] Move the existing Workflow Navigator outside optional guidance and immediately before the workstation grid.
- [x] Keep the four-stage spotlight and jump actions compact, legible, and sticky on wide screens.
- [x] Disable sticky obstruction and stack controls cleanly on narrow screens.
- [x] Preserve targeted jump/result behavior and panel refs.
- [x] Extend renderer and live Electron evidence for outside-guide visibility, order, stickiness, and stage actions.
- [x] Run focused QA and a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and compare prior Workflow Navigator test IDs.

## Review Plan

Review starts after QA. It checks actual outside-guide visibility, composition-first order, sticky behavior, stage jump correctness, status/result preservation, keyboard focus, narrow-screen obstruction, and regressions to musical input or panel layout.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Promote the existing four-stage Workflow Navigator instead of creating another navigation model. | It already carries readiness, spotlight, result, and Quick Actions semantics; duplicating it would add conceptual weight. |
| 2026-07-13 | Keep Compose first and avoid new global shortcuts. | First-run flow must remain direct beat composition, and musical input should not inherit surprising navigation bindings. |
| 2026-07-13 | Use sticky navigation only on wider screens. | Producers gain rapid stage access without sacrificing narrow-screen working area. |
| 2026-07-13 | Verify Deliver jumps by viewport intersection while keeping Compose at exact top alignment. | Handoff Pack ends the document, so the browser cannot place its top at zero without artificial trailing space; successful navigation means the real target is visible. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found the complete four-stage navigator hidden inside the optional Guide & Review Center despite existing panel refs and jump behavior. |
| 2026-07-13 | quality_runner | First live run proved presence, visibility, outside-guide order, stickiness, four actions, and Compose alignment; corrected the Deliver assertion from impossible top alignment to real viewport visibility. |
| 2026-07-13 | quality_runner | Final QA, typecheck, renderer, workflow, persona, build, live Electron hierarchy/sticky/jump/visual, native project I/O, and diff checks passed. |
| 2026-07-13 | review_judge | Separate post-QA review found no blockers; one navigator instance, existing focus semantics, wide-only sticky behavior, and narrow-screen stacking remain intact. |

## Completion Notes

The existing Workflow Navigator now sits outside the optional Guide & Review Center, after global action feedback and immediately before the workstation grid. It keeps the current readiness spotlight, Compose/Arrange/Mix/Deliver status cards, direct jump actions, result strip, Quick Actions routes, and panel refs without adding another navigation model.

At viewport widths of 1221px and above the navigator is sticky at 12px with a restrained opaque blur and shadow. Existing responsive rules continue to switch it to two-column and then one-column layouts below that breakpoint, where sticky positioning is not applied. No global keyboard bindings were added, so drum, note, chord, and MIDI input behavior remains untouched.

Live Electron evidence requires the navigator to be present, actually visible, outside optional guidance, before the workstation, sticky at the desktop viewport, and to expose exactly four stage actions. It also clicks Deliver and requires the real Handoff Pack to enter the viewport, then clicks Compose and requires the pattern editor to align at the top. The initial assertion incorrectly required the document-ending Handoff Pack to align at zero; review corrected that impossible geometry to target visibility without weakening the user-facing requirement.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, and `git diff --check` passed. The build retains the existing nonfatal frontend chunk-size warning. External distribution was not exercised or claimed.
