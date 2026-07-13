# plan-1440-first-run-project-ownership

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the first-run 8-bar foundation read as the user's editable project, not a disposable demo, while preserving an honest local-only safety posture and explicit durable-save workflow.

## Non-Goals

- Adding autosave, file versioning, cloud sync, accounts, analytics, or remote storage.
- Changing project schema, serialization, local draft format, save/open behavior, undo history, playback, render/export, or Handoff contents.
- Hiding the need to save a durable `.grooveforge.json` project file.
- Changing starter musical events, style, key, arrangement, mix/master posture, or audience starter routes.

## Context Map

- `src/ui/App.tsx`: initial project status, status transitions, first-screen Project Safety Readout rendering.
- `src/ui/workstationAppHelpers.tsx`: local/draft/file safety summary and durable-save wording.
- `harness/scripts/run_renderer_smoke.mjs`: exact first-render ownership and safety contracts.
- `harness/scripts/run_desktop_launch_smoke.mjs`: production Electron first-screen evidence.
- `docs/product/product.md`, `docs/architecture/product-architecture.md`, and `docs/quality/rules.md`: local-first project ownership and save-safety rules.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Initial status must identify an editable foundation without claiming the project is already durably saved.
- Project Safety Readout must keep explicit Save guidance and distinguish local drafts from durable files.
- Normal edits must still transition to `Unsaved changes`; successful save/open states must remain unchanged.

## Implementation Plan

- [x] Replace the misleading first-run `Demo project` identity with concise editable-foundation ownership copy.
- [x] Align initial Project Safety Readout detail with the editable foundation and explicit durable-save requirement.
- [x] Add renderer and production Electron evidence for the exact initial ownership/safety posture and edit transition.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run focused/full QA and desktop evidence, then perform a separate review.

## QA Plan

- Run `npm run renderer:smoke`, `npm run typecheck`, and `npm run qa`.
- Run `npm run harness:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run quick-actions:bundle-smoke`, `npm run desktop:launch-smoke`, and `npm run desktop:project-io-smoke`.
- Run `git diff --check`; inspect exact initial status, Project Safety Readout labels/title, edit transition, and existing save/open transitions.

## Review Plan

Review starts only after QA. It checks first-screen ownership clarity, truthful local/durable safety wording, status transitions, accessible production evidence, preservation of project-file and local-draft behavior, and all project invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Describe the initial project as an editable 8-bar foundation and keep Project Safety Readout in a warning posture until explicit save. | The musical data is a real editable project, but local first render is not yet a durable file; both facts must be visible without the disposable `Demo project` implication or an autosave claim. |
| 2026-07-13 | Run launch smoke in a process-unique in-memory Electron session and retain the first ownership snapshot across polling retries. | Production evidence must observe a clean first run without reading or clearing a user's persistent renderer-local draft, and later workflow-navigation clicks must not overwrite the initial-state proof. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree after live first-screen review exposed `Demo project` beside the new editable 8-bar foundation. |
| 2026-07-13 | harness_builder | Renderer evidence now locks exact first-run ownership/safety copy and the first-edit unsaved/draft transition; Electron evidence captures the untouched initial state in an isolated in-memory session before later workflow interactions. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer, runtime, workflow, persona, build, lazy bundle, production Electron launch, native project I/O, and whitespace checks passed. |
| 2026-07-13 | review_judge | Separate post-QA review found and corrected launch-evidence contamination from persistent local drafts and polling interactions, then approved the isolated first-state proof with no remaining blocker. |

## Completion Notes

GrooveForge now identifies its default composition as an `Editable 8-bar foundation` instead of a demo. The adjacent Project Safety Readout says `Editable now`, `Save to keep`, and `Local project only`, retaining a warning tone and durable `.grooveforge` save guidance until an explicit file exists. The first actual edit still transitions through `Unsaved changes`, arms the existing renderer-local draft safety net, and leaves saved/opened file and recovery branches unchanged. Renderer evidence locks those transitions, while production Electron evidence uses a process-unique in-memory session and retains the untouched first-state snapshot across later UI polling so it neither reads nor clears a user's persistent draft.
