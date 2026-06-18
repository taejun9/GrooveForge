# plan-392-visible-next-beat-duplicate

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue toward a desktop beat workstation that satisfies working producers while staying easy for beginners.

## Goal

Expose selected-event next beat duplicate as visible note, drum, and chord editor controls. Quick Actions already provide beat-grid duplicate commands, but the direct editing panels still only show a generic next-empty duplicate plus the newly visible previous-beat duplicate. The visible editor should make both forward and backward beat-grid repetition discoverable.

## Non-Goals

- Do not add new generation, hidden writing, macros, command chains, autoplay, or auto-export.
- Do not change existing Quick Actions command behavior.
- Do not change project schema, save/load, playback, render/export, mixer/master, or sampling scope.
- Do not introduce sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: selected note, drum, and chord state plus duplicate-to-step handlers.
- `src/ui/workstationComposePanels.tsx`: visible `DrumStepInspector`, `NoteInspector`, and `ChordEditor` controls.
- `src/styles.css`: action-row grid sizing for the selected-event button rows.
- `docs/product/product.md`: direct selected-event composition feature contract.
- `docs/quality/rules.md`: selected event editing invariants.
- `harness/scripts/run_qa.py`: static expectations for visible controls and command behavior.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition; sampling remains optional extension scope only.
- Visible next-beat controls must route through the same explicit undoable selected-event duplicate paths as Quick Actions.

## Implementation Plan

- [x] Add next-beat target derivation for visible selected note, drum, and chord editor controls.
- [x] Add visible next-beat buttons in `NoteInspector`, `DrumStepInspector`, and `ChordEditor` that call the existing duplicate-to-step handlers.
- [x] Keep previous-beat and next-beat labels compact and update CSS grid columns for the new button counts.
- [x] Update product/quality docs and harness expectations for visible next-beat duplicate controls.
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

QA completes before review starts. Review will check that visible controls reuse existing selected-event handlers, preserve event fields and clipboards, stay scoped to selected Pattern A/B/C, keep next-beat target derivation consistent with Quick Actions, and avoid playback/export/sampling scope changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add visible selected-event next beat duplicate controls after previous-beat controls. | The visible editor should support common beat-grid repetition in both directions without requiring command search. |
| 2026-06-19 | Use compact Prev/Next labels and existing duplicate-to-step handlers. | The controls need to fit dense editor rows while preserving the same undoable selected-event edit semantics as Quick Actions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created from clean main in `codex/plan-392-visible-next-beat-duplicate`. |
| 2026-06-19 | harness_builder | Added selected note, drum, and chord next-beat target derivation plus visible Next beat buttons routed through existing duplicate-to-step handlers. |
| 2026-06-19 | repo_cartographer | Updated README, product rules, quality rules, CSS expectations, and QA static checks for visible next/previous beat duplicate controls. |
| 2026-06-19 | quality_runner | Ran diff check, project QA, typecheck, quality gate, runtime smoke, build, `npm run qa`, and `npm run verify`; all passed. Localhost dev server/browser check was blocked by `listen EPERM`, and escalated retry was rejected by environment policy. |
| 2026-06-19 | review_judge | Reviewed the diff after QA and found no remaining blocking issues. |

## Completion Notes

Visible selected note, drum, and chord editor rows now expose both previous-beat and next-beat duplicate buttons. The next buttons are disabled when no later valid 4-step anchor exists and call the same undoable selected-event duplicate-to-step handlers used by Quick Actions. Product and quality docs now describe visible next/previous beat-grid duplicate controls. Browser verification remains blocked by local sandbox port binding restrictions, but static, type, runtime, build, and verify checks passed.
