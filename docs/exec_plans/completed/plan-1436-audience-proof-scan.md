# plan-1436-audience-proof-scan

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Keep Audience Session mode choice, immediate route actions, and starter creation direct while grouping repeated acceptance, completion, and delivery proof diagnostics into one compact native disclosure with useful closed-state context.

## Non-Goals

- Hiding the active audience lane, Next Step actions, Enter Guided/Studio actions, or Build Starter controls.
- Removing acceptance, proof handoff, completion checkpoint, delivery snapshot, or delivery proof bridge evidence.
- Changing audience selection, starter generation, project data, playback, export, package, persistence, or route handlers.
- Moving sampling, remote services, accounts, or external distribution into the core workflow.

## Context Map

- `src/ui/workstationGuidancePanels.tsx`: Audience Session hierarchy and existing proof surfaces.
- `src/styles.css`: compact proof disclosure, summary context, expanded content, and responsive behavior.
- `harness/scripts/run_renderer_smoke.mjs`: source ordering and closed-layout contract.
- `electron/main.ts`: live initial compactness and native open/close interaction evidence.
- `harness/scripts/run_desktop_launch_smoke.mjs`: final Electron assertions and report.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Heading, active lane, Next Step rail, audience action cards, and result feedback remain outside the disclosure.
- The closed summary identifies both lane coverage and the active lane's readiness posture.
- Use native pointer and keyboard disclosure behavior without custom React state synchronization.
- Preserve every existing proof test ID, content row, route handler, and local-first/sample-free project invariant.

## Implementation Plan

- [x] Add a native closed-by-default `Session proof` disclosure after the direct Next Step rail.
- [x] Move acceptance, proof handoff, completion checkpoints, delivery snapshot, and delivery proof bridge into its content without changing IDs or derivation.
- [x] Keep audience action/starter cards and result feedback direct below the disclosure.
- [x] Add compact summary, chevron, focus, explicit closed-layout, and narrow wrapping styles.
- [x] Extend renderer and Electron evidence for ordering, hidden initial layout, native open/close restoration, and preserved proof rows.
- [x] Run focused and full QA, then a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and compare all existing Audience Session proof IDs and audience/starter handlers.

## Review Plan

Review starts only after QA. It checks direct audience actions, summary usefulness, native pointer/keyboard semantics, initial hidden layout, open/close restoration, proof preservation, result visibility, responsive wrapping, and project/audio/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Keep route and starter actions direct; compact only read-only proof diagnostics. | Beginners still need an obvious next action, while professionals can reach Studio immediately without reading duplicated acceptance and delivery evidence. |
| 2026-07-13 | Use one uncontrolled native `details` element for all five proof groups. | The evidence has one shared purpose and native disclosure preserves pointer/keyboard behavior without state synchronization. |
| 2026-07-13 | Show both-lane coverage plus the active readiness posture in the closed summary. | Users can understand what is available and whether their active lane needs attention before expanding. |
| 2026-07-13 | Require every proof row to have visible layout while the disclosure is open. | DOM presence alone is weaker than proving the ten acceptance, completion, and delivery rows actually render after native activation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found five always-visible read-only proof groups between the direct Next Step rail and the two audience action/starter cards. |
| 2026-07-13 | repo_cartographer | In-app browser preview could not initialize a local tab; the audit fell back to source hierarchy and the established live Electron launch evidence path without changing code. |
| 2026-07-13 | harness_builder | Added renderer ordering/CSS contracts and live Electron evidence for direct actions, compact initial proof, native open/close restoration, and 10/10 visible proof rows. |
| 2026-07-13 | quality_runner | Type, renderer, base QA, workflow, persona, runtime, production build, desktop launch, native project I/O, and whitespace validation passed. |
| 2026-07-13 | review_judge | Separate post-QA review strengthened row evidence from DOM presence to visible layout and found no remaining blocker. |

## Completion Notes

Audience Session now keeps the active lane, both Next Step actions, Enter Guided/Studio actions, Build Starter controls, and result feedback direct. Five repeated acceptance, completion, and delivery proof groups start compact behind an informative native disclosure and remain fully available on demand. Live Electron evidence proves the disclosure starts closed, opens and closes natively, restores compact layout, and visibly renders all ten proof rows when expanded.
