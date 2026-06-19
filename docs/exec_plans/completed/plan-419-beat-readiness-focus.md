# plan-419-beat-readiness-focus

## Status

Completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Add Beat Readiness Focus controls and Quick Actions so users can jump from each readiness check directly to the relevant workstation area without mutating project data.

## Non-Goals

- No changes to readiness scoring thresholds, generated recommendations, project schema, save/load, undo history, playback, export, sampling, audio import, remote AI, accounts, analytics, or cloud sync.

## Context Map

- Beat Readiness UI: `src/ui/workstationShellPanels.tsx`
- Jump handlers and Quick Actions: `src/ui/App.tsx`
- Shared UI types: `src/ui/workstationUiModel.ts`
- Styles: `src/styles.css`
- Docs/static QA: `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-419-beat-readiness-focus` and `.worktree/plan-419-beat-readiness-focus` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Add Beat Readiness focus target types and mapping.
- [x] Add visible Focus controls on readiness cards.
- [x] Add current-card and direct-card Quick Actions that use the same jump path.
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

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add Beat Readiness Focus as navigation-only controls. | Turns passive readiness status into a fast next-step surface for beginners and a scan-to-panel route for producers without changing project data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added Beat Readiness Focus buttons, focus state, Quick Actions, result feedback, docs, and static QA expectations. |
| 2026-06-19 | quality_runner | QA passed: git diff --check, run_qa.py, run_quality_gate.py, npm run typecheck, npm run build, npm run qa, npm run verify. Dev server start was blocked by sandbox listen EPERM and escalated retry rejection. |
| 2026-06-19 | review_judge | Review found no blocking issues after narrowing Beat Readiness result lookup to avoid export analysis for unrelated Quick Actions. |

## Completion Notes

Beat Readiness now has navigation-only Focus controls, focused card state, Quick Actions current/direct readiness commands, and result feedback. Docs and static QA expectations describe the behavior as read-only direct-composition readiness navigation; sampling remains outside the core flow.
