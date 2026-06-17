# plan-227-beat-spine-actions

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat-making mini DAW that can satisfy working producers while staying approachable for beginners. Keep sampling secondary and make direct beat composition easier to act on.

## Goal

Add explicit Beat Spine action buttons that turn weak direct-composition axes into existing undoable local actions: Drums, 808/Bass, Harmony, Melody, Sound, Arrange, and Finish. The feature should keep Beat Spine readable as a diagnostic surface while letting users apply the most relevant existing beat-making move without hunting through deeper panels.

## Non-Goals

- No new generation engine, hidden automation, remote AI, sampling, imported audio, sampler devices, audio clips, plugin hosting, accounts, analytics, or cloud sync.
- No project schema changes, saved UI state, playback scheduling changes, render/export changes, or command ranking changes.
- No replacement of Composer Actions, Layer Starter Pads, Sound Designer, Pattern Chain, Master Finish, or manual editing controls.

## Context Map

- `src/ui/App.tsx`: Beat Spine, Layer Starter, Sound Preset, Pattern Chain, Master Finish, and existing undoable action handlers.
- `src/styles.css`: Beat Spine card layout and responsive rules.
- `README.md`: public feature list.
- `docs/product/product.md`: durable product behavior definition.
- `docs/quality/rules.md`: feature-specific quality gate wording.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-227-beat-spine-actions` and `.worktree/plan-227-beat-spine-actions` for git repository work.
- Keep the UI centered on direct beat creation; visible app copy should lead with beat-making axes, not sampling guardrail language.

## Implementation Plan

- [x] Re-check existing action handlers and choose the smallest safe reuse path per Beat Spine axis.
- [x] Extend Beat Spine card data with optional action labels/details and action ids.
- [x] Render separate Jump and Apply controls so navigation and mutation stay explicit.
- [x] Route Apply only to existing local undoable handlers and show project status through those handlers.
- [x] Update docs, quality gates, and static QA expectations.
- [x] Run QA, review, complete the plan, merge, push, and clean up.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser/dev-server smoke if the environment permits local server binding.

## Review Plan

QA completes before review starts. Review checks explicit action boundaries, reuse of existing undoable handlers, no schema/playback/export drift, direct beat-making clarity, no sampling-first drift, and responsive layout containment.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Build Beat Spine Actions by reusing existing handlers instead of adding new generation logic. | Beginners need a clear next action and producers need speed, but the app should keep every mutation explicit, local, undoable, and editable. |
| 2026-06-17 | Keep Setup as Jump-only and make all other Beat Spine axes explicit Apply actions. | Setup has no matching mutating beat-writing action, while Drums, 808/Bass, Harmony, Melody, Sound, Arrange, and Finish can safely reuse existing handlers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created after confirming Beat Spine is currently diagnostic-only and existing handlers can cover direct beat axes. |
| 2026-06-17 | harness_builder | Added Beat Spine action metadata, separate Jump/Apply buttons, and action routing through Layer Starter, Sound Preset, Pattern Chain, and Master Finish handlers. |
| 2026-06-17 | harness_builder | Updated README, product docs, quality rules, and static QA expectations for explicit Beat Spine Apply controls. |
| 2026-06-17 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify`. |
| 2026-06-17 | quality_runner | Browser/dev-server smoke could not run because the sandbox blocked Vite binding to `127.0.0.1:5173` with `listen EPERM`; escalated retry was rejected by environment policy. |
| 2026-06-17 | review_judge | Reviewed action boundaries, existing undoable handler reuse, Jump/Apply separation, no schema/playback/export drift, and no sampling-first drift. |

## Completion Notes

Implemented Beat Spine Apply controls while preserving explicit Jump navigation. Setup remains Jump-only; Drums, 808/Bass, Harmony, Melody, Sound, Arrange, and Finish Apply controls call existing undoable Layer Starter, Sound Preset, Pattern Chain, and Master Finish handlers. The work updates product docs, quality rules, and static QA expectations without adding sampling, imported audio, sampler devices, audio clips, project schema changes, playback changes, render/export changes, or remote services.

Browser smoke could not run because `npm run dev -- --host 127.0.0.1` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; the escalated retry was rejected by environment policy, so no browser workaround was used.
