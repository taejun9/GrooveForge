# plan-429-style-goal-actions

## Status

Completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Connect Style Goal Progress cards to the matching existing Composer Action so users can explicitly fix weak direct-composition goals from the Style Inspector without introducing hidden generation or sampling-first workflow.

## Non-Goals

- No new music-generation algorithms, style profile changes, Beat Blueprint changes, playback, scheduler, render/export, save/load, project schema, sampling, imported audio, remote AI, accounts, analytics, or cloud sync behavior.
- No changes to Composer Action command semantics, action ranking, undo behavior, action result derivation, Quick Actions execution, or style selection behavior.
- No automatic fixing, command chains, autoplay, auto-export, tutorial overlay, or onboarding flow.

## Context Map

- Style Inspector UI and action wiring: `src/ui/App.tsx`
- UI model types: `src/ui/workstationUiModel.ts`
- Styling: `src/styles.css`
- Docs/static QA: `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-429-style-goal-actions` and `.worktree/plan-429-style-goal-actions` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Pass existing Composer Actions into Style Inspector without changing action derivation.
- [x] Render explicit action controls on Style Goal Progress cards only when a matching Composer Action exists.
- [x] Keep focus controls and action controls visually distinct, accessible, and compact.
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

QA completes before review starts. Review checks that Style Goal actions reuse only existing Composer Actions, require explicit user clicks, preserve focus/read-only derivation, keep result state UI-local, and avoid style profile, generated event, playback, export, project schema, and sampling changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Reuse existing Composer Actions instead of adding new goal-fix logic. | Style goals and Composer Actions already share direct-composition areas; reusing the established handler preserves undo, result, and QA boundaries. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Wired Style Goal Progress cards to matching existing Composer Actions with compact explicit action buttons. |
| 2026-06-19 | quality_runner | Ran static QA, quality gate, typecheck, build, npm qa, and full verify. |
| 2026-06-19 | review_judge | Reviewed the explicit-action scope; no blocking findings. |

## Completion Notes

Style Goal Progress cards now show explicit goal-action controls when a matching existing Composer Action is available. The controls reuse the existing Composer Actions summary and `runComposerAction` handler, so goal actions keep the same undoable edit paths and result feedback as the main Composer Actions panel. Style goal focus remains separate from action execution, and no project schema, playback, export, style profile, generation, sampling, imported audio, remote AI, account, analytics, or cloud behavior changed.
