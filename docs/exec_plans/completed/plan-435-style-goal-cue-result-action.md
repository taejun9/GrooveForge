# plan-435-style-goal-cue-result-action

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue toward a completed GrooveForge desktop app that can satisfy working producers such as 그냥노창 or 그루비룸 while staying easy for a first-time composer.

## Goal

Add an explicit action button to Style Goal Cue Result so users can move from a cued audition loop directly into the matching Style Goal Action without hunting for the card button again.

## Non-Goals

- Do not change Style Goal scoring, Style Goal Cue derivation, Composer Action derivation, Composer Action execution, Style Goal Action Result semantics, or style profile definitions.
- Do not run actions automatically after cueing; the action must require an explicit click.
- Do not change project schema, musical event data contracts, arrangement data contracts, mixer/master data contracts, render/export behavior, save/load behavior, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Style Inspector, Style Goal Cue Result strip, matching Composer Action lookup, action execution handler.
- `src/styles.css`: Style Goal Cue Result action button layout.
- `README.md`: public feature summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: QA boundary for explicit cue-result action behavior.
- `harness/scripts/run_qa.py`: static QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-435-style-goal-cue-result-action` and `.worktree/plan-435-style-goal-cue-result-action`.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional.

## Implementation Plan

- [x] Add a matching Style Goal Action button to Style Goal Cue Result.
- [x] Disable the result action when no matching Composer Action is available.
- [x] Route result action clicks through the existing Style Goal Action / Composer Action handler.
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

QA completes before review starts. Review should verify that the Cue Result action is explicit, disabled when unavailable, routes only through the existing Composer Action handler, does not auto-run after cueing, and preserves Style Goal Cue Result, Style Goal Action Result, project schema, save/load, playback, export, sampling, imported audio, remote AI, account, analytics, and cloud boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add a direct action button to Cue Result instead of adding another command family. | The matching action already exists on cards and in Quick Actions; the gap is a local flow bridge from audition feedback to explicit writing action. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added the Cue Result action button, routed it through the existing Composer Action handler, and updated docs/static QA expectations for explicit matching-action feedback. |
| 2026-06-19 | quality_runner | QA passed: git diff --check, python3 harness/scripts/run_qa.py, python3 harness/scripts/run_quality_gate.py, npm run typecheck, npm run build, npm run qa, and npm run verify. |

## Completion Notes

Completed. Style Goal Cue Result now exposes an explicit matching action button that is disabled when no matching Composer Action exists and routes successful clicks through the existing Composer Action handler. README, product docs, quality rules, and static QA expectations now describe and validate the matching-action feedback.
