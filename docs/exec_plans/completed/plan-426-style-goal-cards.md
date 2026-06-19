# plan-426-style-goal-cards

## Status

Completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Add read-only Style Goal Cards to the Style Inspector so users can see the selected style's direct-composition targets for drums, 808/bass, harmony, melody, and arrangement without starting from samples or hidden generation.

## Non-Goals

- No style profile changes, generated event changes, Beat Blueprint changes, playback, scheduler, render/export, save/load, project schema, sampling, imported audio, remote AI, accounts, analytics, or cloud sync behavior.
- No changes to Style Quick Picks, style selection, Composer Actions apply behavior, command execution, command ranking, keyboard shortcuts, undo history, or result semantics.
- No automatic style correction, hidden generation, macro chains, tutorial overlay, or onboarding flow.

## Context Map

- Style Inspector UI and summary: `src/ui/App.tsx`
- Style/types: `src/ui/workstationUiModel.ts`, `src/domain/workstation.ts`
- Docs/static QA: `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-426-style-goal-cards` and `.worktree/plan-426-style-goal-cards` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Add Style Goal Card model data derived from current style and existing composer-action style targets.
- [x] Render Style Goal Cards inside Style Inspector as read-only cards.
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

QA completes before review starts. Review checks that Style Goal Cards are read-only, derived from existing local style/composer-action posture, preserve direct-composition framing, and do not alter style selection, generated events, playback, project data, export behavior, or optional-sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add Style Goal Cards to Style Inspector instead of another action surface. | The product already has many writing actions; the next gain is making style targets visible for beginners and producers without adding hidden automation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | repo_cartographer | Added read-only Style Goal Cards from existing composer-action style goals/cues and updated docs/static QA expectations. |
| 2026-06-19 | quality_runner | Ran full QA set and confirmed all documented checks pass. |
| 2026-06-19 | review_judge | Reviewed Style Goal Cards as read-only UI derived from existing local style goals/cues and found no blocking issues. |

## Completion Notes

- Added read-only Style Goal Cards to Style Inspector for Drums, 808/Bass, Harmony, Melody, and Arrange targets.
- Reused existing composer-action style goals/cues so Style Inspector targets stay aligned with direct-composition actions.
- Updated docs and static QA expectations for the new read-only Style Goal Cards surface.
- No style selection, generated events, playback, project data, export, sampling, imported audio, remote AI, accounts, analytics, or cloud behavior changed.
