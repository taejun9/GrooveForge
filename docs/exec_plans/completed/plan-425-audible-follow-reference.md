# plan-425-audible-follow-reference

## Status

Completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Expose Audible Pattern Follow and Audible Arrangement Follow in Command Reference so beginners and producers can discover the edit-focus commands after opening Help or Quick Actions.

## Non-Goals

- No new playback, scheduler, render/export, save/load, project schema, sampling, imported audio, remote AI, accounts, analytics, or cloud sync behavior.
- No changes to Quick Actions execution, command ranking, keyboard shortcut handling, Pattern/arrangement data, playback loop scope, undo history, or result semantics.
- No tutorial overlay, onboarding flow, automatic follow mode, macros, or command chains.

## Context Map

- Command Reference surface: `src/ui/workstationShellPanels.tsx`
- Docs/static QA: `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-425-audible-follow-reference` and `.worktree/plan-425-audible-follow-reference` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Add Command Reference entries for Audible Pattern Follow and Audible Arrangement Follow.
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

QA completes before review starts. Review checks that the reference entries are discoverability-only, point to existing Quick Actions/readout commands, and do not alter command execution, playback, project data, export behavior, or the sample-free product spine.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add reference entries instead of another control surface. | The follow commands already exist; the next product gain is discoverability without adding workflow weight or automatic behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | repo_cartographer | Added discoverability-only Command Reference entries and updated docs/static QA expectations. |
| 2026-06-19 | quality_runner | Ran full QA set and confirmed all documented checks pass. |
| 2026-06-19 | review_judge | Reviewed diff for discoverability-only scope and found no blocking issues. |

## Completion Notes

- Added Audible Pattern Follow and Audible Arrangement Follow to Command Reference.
- Updated product docs and quality/static QA expectations so the command map remains current.
- No playback, command execution, project data, export, sampling, imported audio, remote AI, accounts, analytics, or cloud behavior changed.
