# plan-433-style-goal-cue

## Status

active

## Owner

project_lead / harness_builder

## User Request

Continue toward a completed GrooveForge desktop app that can satisfy working producers such as 그냥노창 or 그루비룸 while staying easy for a first-time composer.

## Goal

Add explicit Style Goal Cue controls and Quick Actions so users can set the correct audition loop for a Style Goal before applying a writing action: Pattern loop for drums, 808/bass, harmony, and melody goals, and Song loop for arrangement goals.

## Non-Goals

- Do not change Style Goal scoring, Style Profile definitions, Composer Action derivation, Composer Action execution, or Style Goal Action Result semantics.
- Do not start playback automatically; cue only prepares the existing loop scope after an explicit click or command.
- Do not change project schema, musical event data, arrangement data, mixer/master data, render/export behavior, save/load behavior, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Style Inspector UI, Style Goal cards, transport loop cue handlers, Quick Actions assembly, Quick Action result follow-up text.
- `src/ui/workstationUiModel.ts`: Style Goal card typing if the cue behavior needs typed surfaces.
- `README.md`: public feature summary.
- `docs/product/product.md`: durable product and command surface description.
- `docs/quality/rules.md`: QA boundary for Style Inspector/Style Goal behavior and Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations for UI strings, docs, and product boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-433-style-goal-cue` and `.worktree/plan-433-style-goal-cue` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional.

## Implementation Plan

- [x] Add visible Style Goal Cue controls to Style Goal cards.
- [x] Add direct Quick Actions Style Goal Cue commands for each Style Goal card.
- [x] Route cue actions only through existing Pattern/Song loop-scope behavior and disable while playing.
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

QA completes before review starts. Review should verify that Style Goal Cue is explicit, read/write scope is limited to existing selected Pattern and loop-scope UI state, commands are disabled while playback is running, cueing does not auto-play, and Composer Action, Style Goal, project schema, event data, playback rendering, export, sampling, remote AI, account, analytics, and cloud boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add cue controls before adding more writing actions. | Existing Style Goal cards tell users what to listen for, but the audition loop must still be set elsewhere; cueing closes a practical beginner/pro workflow gap without changing generation behavior. |
| 2026-06-19 | Pattern goals cue Pattern loop and Arrange goal cues Song loop. | Drums, 808/bass, harmony, and melody are Pattern-level writing checks, while arrangement is a song-form check. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added Style Goal Cue controls, direct cue Quick Actions, result metrics/follow-up text, Command Reference coverage, docs, and QA expectations. |
| 2026-06-19 | quality_runner | Ran `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, and `npm run verify`; all passed. |
| 2026-06-19 | review_judge | Reviewed cue routing, result classification, docs, and QA coverage; no blocking issues found. |

## Completion Notes

Completed. Style Goal cards now include explicit Cue controls, Quick Actions expose direct Style Goal Cue commands, and cue results are classified as UI-local cue commands. Pattern goals cue the selected Pattern loop; the arrangement goal cues the Song loop. Cue controls are disabled while playback is running and do not auto-play or change musical project data.
