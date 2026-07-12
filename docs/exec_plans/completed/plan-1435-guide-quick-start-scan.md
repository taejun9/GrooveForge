# plan-1435-guide-quick-start-scan

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Keep the single recommended Guide Quick Start decision immediately actionable while moving its long progress diagnostics and alternate routes into one compact, native, on-demand disclosure.

## Non-Goals

- Removing Guide Quick Start priority, completion score, bottleneck, breakdown, context, alternate routes, or result feedback.
- Hiding the current recommended decision or its Run action.
- Changing readiness calculations, route selection, project state, playback, exports, or persistence.
- Deferring the entire Guide & Review Center or changing the launchpad choices.

## Context Map

- `src/ui/workstationGuidancePanels.tsx`: Guide Quick Start hierarchy and route actions.
- `src/styles.css`: compact disclosure summary, expanded content, and responsive behavior.
- `harness/scripts/run_renderer_smoke.mjs`: first-render ordering and hidden-layout contract.
- `electron/main.ts`: live initial compactness and native open/close interaction evidence.
- `harness/scripts/run_desktop_launch_smoke.mjs`: final Electron assertions and report.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Guide Quick Start heading, decision readout, and decision action remain outside the disclosure.
- The disclosure summary must show completion and bottleneck context while closed.
- Native pointer and keyboard disclosure behavior must remain available without custom state synchronization.
- All existing test IDs, handlers, results, route targets, local-first behavior, and sample-free project semantics remain intact.

## Implementation Plan

- [x] Add a native closed-by-default `Progress & routes` disclosure after the direct decision.
- [x] Move priority, completion, bottleneck, breakdown, context, and alternate route buttons into its content without changing handlers or IDs.
- [x] Add compact summary styling, chevron state, focus visibility, and narrow wrapping.
- [x] Extend renderer and Electron evidence for ordering, initial hidden layout, manual open/close, and content preservation.
- [x] Run focused and full QA, then a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and compare all prior Guide Quick Start test IDs and route handlers.

## Review Plan

Review starts after QA. It checks decision visibility, summary usefulness, native pointer/keyboard semantics, open/close restoration, hidden content layout, result visibility, route preservation, responsive wrapping, and project/audio/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Keep the recommended decision direct and group every diagnostic or alternate route below it. | A beginner needs one clear next action; completion analysis and route choice are useful supporting evidence rather than equal first-read priorities. |
| 2026-07-13 | Use an uncontrolled native `details` element. | Native disclosure gives immediate pointer and keyboard behavior, preserves a user's manual choice across ordinary rerenders, and avoids custom state synchronization. |
| 2026-07-13 | Put completion score and bottleneck in the closed summary. | Users retain awareness of overall posture and the lowest lane without paying the vertical cost of all detailed cards. |
| 2026-07-13 | Explicitly hide the details content when `open` is absent. | The expanded content needs `display: grid`; an explicit closed selector prevents that author rule from weakening the native collapsed layout contract. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found the direct decision followed by seven always-visible supporting surfaces: priority, completion, bottleneck, three-score breakdown, context cards, and three alternate route buttons. |
| 2026-07-13 | harness_builder | Added renderer ordering and CSS-contract checks plus live Electron evidence for compact initial layout and native open/close restoration. |
| 2026-07-13 | quality_runner | Focused, full, workflow, persona, build, desktop launch, project I/O, and whitespace validation passed. |
| 2026-07-13 | review_judge | Separate post-QA review found no remaining blocker; direct decision/result visibility and all supporting IDs, handlers, and routes are preserved. |

## Completion Notes

Guide Quick Start now presents one direct recommended action, followed by a compact native disclosure whose closed summary retains completion and bottleneck context. Detailed diagnostics and alternate paths remain available on demand, while result feedback stays direct. Renderer and live Electron evidence cover ordering, initial hidden layout, native activation, open/close restoration, and content preservation.
