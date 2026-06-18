# plan-391-visible-previous-beat-duplicate

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue toward a desktop beat workstation that satisfies working producers while staying easy for beginners.

## Goal

Expose selected-event previous beat duplicate as visible note, drum, and chord editor controls. The existing Quick Actions commands are useful for fast command search, but beginners also need discoverable on-screen buttons when they are editing selected events directly.

## Non-Goals

- Do not add new pattern generation, hidden writing, macros, command chains, autoplay, or auto-export.
- Do not change existing next-beat duplicate or Quick Actions behavior.
- Do not change project schema, save/load, playback, render/export, mixer/master, or sampling scope.
- Do not introduce sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: visible `DrumStepInspector`, `NoteInspector`, and `ChordEditor` selected-event controls plus selected-event duplicate handlers.
- `src/ui/selectedEventQuickActions.ts`: existing previous-beat target derivation and command behavior.
- `docs/product/product.md`: direct selected-event composition feature contract.
- `docs/quality/rules.md`: selected event editing invariants.
- `harness/scripts/run_qa.py`: static expectations for UI controls and command behavior.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition; sampling remains optional extension scope only.
- Visible controls must route through the same explicit undoable selected-event duplicate paths as Quick Actions.

## Implementation Plan

- [x] Add previous-beat target derivation for visible selected note, drum, and chord editor controls.
- [x] Add visible buttons in `NoteInspector`, `DrumStepInspector`, and `ChordEditor` that call the existing duplicate-to-step handlers.
- [x] Disable buttons when no earlier valid 4-step anchor exists and keep labels/details compact.
- [x] Update product/quality docs and harness expectations for visible previous-beat duplicate controls.
- [x] Run QA before review, then move the plan to completed and create a review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server/browser check if the sandbox allows localhost binding.

## Review Plan

QA completes before review starts. Review will check that visible controls reuse existing selected-event handlers, preserve event fields and clipboards, stay scoped to selected Pattern A/B/C, keep previous-beat target derivation consistent with Quick Actions, and avoid playback/export/sampling scope changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add visible selected-event previous beat duplicate controls after Quick Actions support. | Command search is fast for producers, but on-screen controls improve beginner discoverability without changing the underlying edit model. |
| 2026-06-19 | Keep previous-beat buttons on the same selected-event edit rows and expand their CSS grids to the new button counts. | The controls should stay discoverable without wrapping into unintended rows or creating new command paths. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created from clean main in `codex/plan-391-visible-previous-beat-duplicate`. |
| 2026-06-19 | harness_builder | Added previous-beat duplicate target derivation and visible note, drum, and chord buttons routed through existing duplicate-to-step handlers. |
| 2026-06-19 | repo_cartographer | Updated README, product rules, quality rules, and QA static expectations for visible previous-beat duplicate controls. |
| 2026-06-19 | quality_runner | Ran diff check, project QA, typecheck, quality gate, runtime smoke, build, `npm run qa`, and `npm run verify`; all passed. Localhost dev server/browser check was blocked by `listen EPERM`, and escalated retry was rejected by environment policy. |
| 2026-06-19 | review_judge | Reviewed the diff after QA, found fixed CSS grid button-count mismatch, then reran QA and verify successfully. |

## Completion Notes

Visible selected note, drum, and chord editor rows now expose previous-beat duplicate buttons. The buttons are disabled when no earlier valid 4-step anchor exists and call the same undoable selected-event duplicate-to-step handlers used by Quick Actions. Product and quality docs now describe visible controls as well as command-palette commands. Browser verification remains blocked by local sandbox port binding restrictions, but static, type, runtime, build, and verify checks passed.
