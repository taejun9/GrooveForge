# plan-294-arrangement-block-cue-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct arrangement block cueing through Quick Actions so users can prepare Block-loop audition for any current song-form block using existing selected-block navigation plus transport loop behavior.

## Non-Goals

- Do not start playback automatically, change arrangement blocks, mutate Pattern A/B/C event data, create undo history, change selected-block edit tools, alter render/export, mixer/master, project schema, or Song Form Overview derivation.
- Do not add hidden generation, command chains, auto-arrangement, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or plugin hosting.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: existing `selectArrangementBlock`, `selectTransportLoopScope`, Section Locator cue behavior, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary.
- `docs/product/product.md`: Arrangement and Quick Actions product behavior.
- `docs/quality/rules.md`: arrangement block navigation and cue guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-294-arrangement-block-cue-quick-actions` and `.worktree/plan-294-arrangement-block-cue-quick-actions` for git repository work.

## Implementation Plan

- [x] Inspect existing selected-block navigation, Block loop selection, and Quick Actions wiring.
- [x] Add an explicit arrangement block cue handler that reuses selected-block navigation and Block loop scope while playback is stopped.
- [x] Add Arrangement Block Cue Quick Actions with local result metrics and follow-up copy.
- [x] Update durable docs and QA expectations to keep block cueing scoped to selected-block navigation plus Block loop scope.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run Quick Actions Arrangement Block Cue commands, confirm selected arrangement block, selected Pattern, and Block loop scope move to the target block without autoplay, no arrangement or Pattern event mutation, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Arrangement Block Cue commands use the existing selected-block navigation path plus Block loop scope, switch only selected arrangement block, selected Pattern preview state, and loop scope while playback is stopped, preserve arrangement blocks, Pattern A/B/C event data, playback start/stop, save/load, export semantics, Quick Actions search/results, and avoid sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add one Quick Action cue command per current arrangement block. | Block Jump moves editing focus, while Block Cue prepares audition for the exact block a producer or beginner wants to hear next. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Quick Actions can jump to blocks, but only the selected block or Section Locator pads can prepare Block-loop audition. |
| 2026-06-18 | harness_builder | Added Quick Actions Arrangement Block Cue commands, result metric/follow-up copy, documentation, and QA expectations. |
| 2026-06-18 | quality_runner | Initial `python3 harness/scripts/run_qa.py`, `npm run typecheck`, and `git diff --check` passed. |
| 2026-06-18 | quality_runner | Full `npm run verify` and `npm run qa` passed; browser smoke was blocked because sandbox localhost listen failed with `EPERM` and the required escalation was rejected by environment policy. |
| 2026-06-18 | review_judge | Review found no code issues; Cue uses existing selected-block navigation and Block loop selection without autoplay, undo history, or arrangement/Pattern event mutation. |

## Completion Notes

Implemented Quick Actions Arrangement Block Cue commands for every current arrangement block. Commands are disabled while playback is running, otherwise they select the target arrangement block, select its assigned Pattern through the existing navigation path, switch the transport to Block loop scope, and show local Quick Actions result/follow-up feedback without mutating arrangement or Pattern event data.

QA passed:

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- `npm run qa`

Browser smoke was not completed because the sandbox rejected localhost server startup with `listen EPERM: operation not permitted 127.0.0.1:5318`, and the required escalated retry was rejected by environment policy. No workaround was attempted.
