# plan-431-style-goal-action-quick-actions

## Status

Completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Expose each Style Goal action as a direct Quick Actions command so users can search for a weak goal and run the matching existing Composer Action without hunting through the dense UI.

## Non-Goals

- No new Composer Action commands, action ranking changes, action derivation changes, generated event changes, style profile changes, Beat Blueprint changes, playback, scheduler, render/export, save/load, project schema, sampling, imported audio, remote AI, accounts, analytics, or cloud sync behavior.
- No automatic fixing, hidden generation, command chains, autoplay, auto-export, modal confirmation, tutorial overlay, or onboarding flow.
- No changes to Style Goal card button behavior or Composer Actions panel rendering.

## Context Map

- Quick Actions command assembly and result follow-up: `src/ui/App.tsx`
- Docs/static QA: `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-431-style-goal-action-quick-actions` and `.worktree/plan-431-style-goal-action-quick-actions` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Derive direct Style Goal Quick Actions from existing Style Goal cards and existing Composer Actions.
- [x] Route each command only through the existing Composer Action run handler.
- [x] Add Quick Action result follow-up copy for style-goal commands.
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

QA completes before review starts. Review checks that Style Goal Quick Actions derive only from existing Style Goal cards and Composer Actions, route through the existing Composer Action handler, preserve Style Goal card behavior, and avoid project schema, generated event, playback, export, and sampling changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add command-palette access to Style Goal actions without creating new action semantics. | Beginners can search goal language directly, while producers get faster command access; mutation remains in existing Composer Actions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added direct Quick Actions Style Goal commands that reuse existing Composer Actions. |
| 2026-06-19 | quality_runner | Ran the full documented QA set for the plan. |
| 2026-06-19 | review_judge | Reviewed command-only scope; no blocking findings. |

## Completion Notes

Style Goal actions are now searchable and runnable from Quick Actions as direct Style Goal commands. Each command is derived from the existing Style Goal card plus matching existing Composer Action, and routes only through the existing Composer Action run handler. Quick Action result follow-up copy points users back to the Style Goal Action Result and relevant audition loop. No Composer Action semantics, Style Goal card behavior, project schema, style profile definitions, generated events, playback, export, save/load, sampling, imported audio, remote AI, account, analytics, or cloud behavior changed.
