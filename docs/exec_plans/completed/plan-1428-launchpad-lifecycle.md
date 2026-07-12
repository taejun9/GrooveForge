# plan-1428-launchpad-lifecycle

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Keep the full first-run starter choices prominent before a project is chosen, then collapse them into a compact, reopenable project-start control after starter creation, file loading, import, or draft restoration.

## Non-Goals

- Removing beginner starter, producer starter, or Open Existing Project actions.
- Persisting launchpad UI state into project files or local storage.
- Changing starter contents, open/import parsing, draft data, playback, rendering, or exports.
- Adding onboarding accounts, remote templates, analytics, payments, or cloud behavior.

## Context Map

- `src/ui/App.tsx`: launchpad state, project-entry success paths, and live mode evidence.
- `src/styles.css`: open/compact disclosure and responsive layout.
- `src/vite-env.d.ts`: typed launchpad evidence.
- `electron/main.ts`: first-render visibility and hierarchy evidence.
- `harness/scripts/run_renderer_smoke.mjs`: initial-open and action-preservation assertions.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live initial, post-starter collapse, and manual reopen evidence.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Initial first-run surface must still show all three project-entry choices without extra clicks.
- Project-entry success may collapse the launchpad; cancellation and invalid files must not.
- Preserve all current launchpad test IDs and local-first behavior.

## Implementation Plan

- [x] Convert the full launchpad to a controlled native disclosure that starts open.
- [x] Add a compact summary that clearly communicates Start or Switch Project and current audience mode.
- [x] Collapse after successful starter creation, file open/import, or draft restore.
- [x] Preserve cancellation/error behavior and manual reopen/close.
- [x] Extend renderer and live Electron evidence for initial open, post-starter collapse, and manual reopen.
- [x] Run focused QA and a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and compare prior launchpad test IDs.

## Review Plan

Review starts after QA. It checks initial choice visibility, success-only collapse, cancellation/error preservation, manual keyboard reopen, current-mode context, responsive layout, project-entry regressions, and first-run clarity.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Start open and collapse only after a successful project-entry action. | Beginners need zero-friction choices; active sessions should reclaim header space without losing access. |
| 2026-07-13 | Keep launchpad state UI-local. | Whether a helper is open is not musical project data and should not affect save/load compatibility. |
| 2026-07-13 | Use native details/summary semantics with controlled state. | Pointer and keyboard activation stay understandable and consistent with other audience-aware helpers. |
| 2026-07-13 | Extend native project I/O smoke through the visible Open button after bridge roundtrip. | The prior smoke proved preload I/O but bypassed `handleOpenProject`, so it could not prove success-triggered launchpad collapse. |
| 2026-07-13 | Collapse after a valid starter or draft choice even when project data is identical. | UI lifecycle should follow the completed user choice, not whether the reducer produced a diff. |
| 2026-07-13 | Increase only the aggregate desktop launch-smoke timeout while retaining all per-step limits and assertions. | The former aggregate limit was shorter than the existing palette and Command Reference step maxima combined, causing a verified UI run to time out between stages. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found the full three-action first-run launchpad remains permanently expanded after starter, open/import, and draft-restore success. |
| 2026-07-13 | harness_builder | Native project I/O evidence now clicks the real top-bar Open action and requires launchpad collapse after the configured project loads. |
| 2026-07-13 | review_judge | Review found identical starter/draft selections could leave the launchpad open because `changed` was false; moved collapse to valid-choice completion while preserving cancel/error behavior. |
| 2026-07-13 | quality_runner | Full QA, typecheck, renderer/workflow/persona smokes, production build, native project I/O, live Electron launch smoke, and diff checks passed. |
| 2026-07-13 | review_judge | Post-QA review approved the launchpad lifecycle with no blocking findings; completion review recorded in `docs/reviews/plan-1428-launchpad-lifecycle-review.md`. |

## Completion Notes

- The three project-entry choices remain visible on first launch without an extra click.
- Successful starter selection, project open/import, and valid local-draft restoration collapse the launchpad; identical valid choices also collapse it.
- The compact summary shows the active project and Guided/Studio context and remains manually reopenable.
- Native project I/O smoke proves the visible Open action loads the configured project and collapses the launchpad.
- Review: `docs/reviews/plan-1428-launchpad-lifecycle-review.md`.
