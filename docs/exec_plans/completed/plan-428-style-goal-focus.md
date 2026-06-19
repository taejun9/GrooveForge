# plan-428-style-goal-focus

## Status

Completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Add UI-local Style Goal Focus controls so each Style Goal Progress card can jump to the matching Compose or Arrange panel without changing the beat.

## Non-Goals

- No style profile changes, generated event changes, Beat Blueprint changes, playback, scheduler, render/export, save/load, project schema, sampling, imported audio, remote AI, accounts, analytics, or cloud sync behavior.
- No changes to Style Quick Picks, style selection, Composer Actions apply behavior, command execution, command ranking, keyboard shortcuts, undo history, or result semantics.
- No automatic style correction, hidden generation, macro chains, tutorial overlay, or onboarding flow.

## Context Map

- Style Inspector UI and focus handler: `src/ui/App.tsx`
- Style/types: `src/ui/workstationUiModel.ts`
- Styling: `src/styles.css`
- Docs/static QA: `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-428-style-goal-focus` and `.worktree/plan-428-style-goal-focus` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Extend Style Goal Progress cards with focus ids and targets.
- [x] Render explicit focus controls for goal cards and include them in the Style Inspector focus readout.
- [x] Update docs and static QA expectations.
- [x] Run QA and review.
- [x] Move plan to completed and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Style Goal Focus is UI-local and read-only, routes only to existing Compose/Arrange panels, preserves Style Goal Progress derivation, and does not alter style selection, generated events, playback, project data, export behavior, or optional-sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add focus controls instead of apply buttons. | Users need a faster way to inspect the weak goal, but applying changes belongs to existing explicit Composer Actions and Layer Starter paths. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | repo_cartographer | Added UI-local focus ids and focus buttons for Style Goal Progress, plus docs/static QA coverage. |
| 2026-06-19 | quality_runner | Ran the full documented QA set for the plan. |
| 2026-06-19 | review_judge | Reviewed the focus-only scope; no blocking findings. |

## Completion Notes

Style Goal Progress cards now expose explicit focus controls that route drums, bass, harmony, and melody goals to Compose and arrangement progress to Arrange through the existing Style Inspector focus handler. Quick Actions now include direct goal focus commands through the same read-only Style Inspector path. No project data, style profile definitions, generated events, playback, export, save/load, sampling, imported audio, remote AI, account, analytics, or cloud behavior changed.
