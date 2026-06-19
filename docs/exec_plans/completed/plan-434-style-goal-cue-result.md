# plan-434-style-goal-cue-result

## Status

active

## Owner

project_lead / harness_builder

## User Request

Continue toward a completed GrooveForge desktop app that can satisfy working producers such as 그냥노창 or 그루비룸 while staying easy for a first-time composer.

## Goal

Add a UI-local Style Goal Cue Result so explicit Style Goal Cue clicks and commands leave clear feedback about the cued loop, what to audition, and when to run the matching Style Goal Action.

## Non-Goals

- Do not change Style Goal scoring, goal derivation, Composer Action derivation, Composer Action execution, Style Goal Action Result behavior, or style profile definitions.
- Do not start playback automatically.
- Do not change project schema, musical event data, arrangement data, mixer/master data, render/export behavior, save/load behavior, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Style Goal cue handler, Style Inspector props/rendering, result-strip state, Quick Actions result boundaries.
- `src/styles.css`: Style Goal Cue Result layout and tone styling.
- `README.md`: public feature summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: QA boundary for Style Goal Cue Result behavior.
- `harness/scripts/run_qa.py`: static QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-434-style-goal-cue-result` and `.worktree/plan-434-style-goal-cue-result`.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional.

## Implementation Plan

- [x] Add UI-local Style Goal Cue Result state and result creation.
- [x] Render the result inside Style Inspector after explicit cue clicks or commands.
- [x] Reset stale cue result on broader project/view changes while preserving cue feedback after cue actions.
- [x] Update README/product/quality docs and static QA expectations.
- [x] Run QA, review, complete plan, and mirror review.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should verify that Style Goal Cue Result is UI-local, appears only after explicit cue actions, reports the correct Pattern or Song loop, does not auto-play, does not mutate musical data or project schema, and preserves Composer Action, Style Goal Action Result, sampling, remote AI, account, analytics, cloud, save/load, and export boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add a result strip after Style Goal Cue rather than adding another writing action. | Cue setup is now explicit, but users need durable local feedback for what to audition before deciding whether to write more material. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added UI-local Style Goal Cue Result state, Style Inspector rendering, stale-result resets, docs, CSS, and static QA expectations. |
| 2026-06-19 | quality_runner | Ran `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, and `npm run verify`; all passed. |
| 2026-06-19 | review_judge | Reviewed cue result state, render placement, stale reset behavior, docs, and QA coverage; no blocking issues found. |

## Completion Notes

Completed. Style Goal Cue clicks and commands now leave a UI-local result in Style Inspector with the cued Pattern or Song loop, audition cue, and next-check guidance. The result clears on broader project/view or loop-scope changes and does not auto-play, write musical data, alter project schema, or affect export behavior.
