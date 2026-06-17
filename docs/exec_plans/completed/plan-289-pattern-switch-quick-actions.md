# plan-289-pattern-switch-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose Pattern A/B/C edit-focus switching through Quick Actions so users can jump between variations from command search without leaving the keyboard workflow.

## Non-Goals

- Do not change Pattern A/B/C musical event data, arrangement blocks, playback scheduling, render/export, save/load schema, mixer/master state, or Pattern Clone behavior.
- Do not add hidden generation, command chains, autoplay, auto-arrangement, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or plugin hosting.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: existing `selectPattern` handler, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary.
- `docs/product/product.md`: product behavior and Pattern editor/Quick Actions description.
- `docs/quality/rules.md`: guardrails for Pattern Switch and Quick Actions work.
- `harness/scripts/run_qa.py`: static expectations for the app, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-289-pattern-switch-quick-actions` and `.worktree/plan-289-pattern-switch-quick-actions` for git repository work.

## Implementation Plan

- [x] Inspect existing Pattern A/B/C selection and Quick Actions wiring.
- [x] Add Pattern Switch Quick Actions that route through the existing `selectPattern` handler.
- [x] Add local result metrics and follow-up copy for Pattern Switch commands.
- [x] Update durable docs and QA expectations to keep Pattern Switch scoped to edit focus.
- [x] Run QA, review, complete the plan, merge to main, push main, delete branch, and remove worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run Quick Actions Pattern A/B/C switch commands, confirm edit Pattern changes, Pattern data and playback/export semantics stay unchanged, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Pattern Switch commands reuse the existing pattern selection path, change only edit focus/selection affordances, reset selected note/drum/chord focus consistently with tab clicks, preserve Pattern A/B/C event data, arrangement, playback, save/load, export, Quick Actions search/results, and avoid sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Pattern Switch as command-palette access to existing edit-focus selection only. | The README already promises Pattern A/B/C switching in Quick Actions, and command access helps producers move quickly while beginners can discover variation slots without mutating music data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming docs mention Pattern A/B/C Quick Actions but no `pattern-switch` implementation exists. |
| 2026-06-18 | harness_builder | Added Pattern Switch Quick Actions through the existing `selectPattern` path, result metric/follow-up copy, docs, quality guardrails, and QA expectations. |
| 2026-06-18 | quality_runner | Initial `run_qa.py` and `npm run typecheck` passed before full QA. |
| 2026-06-18 | quality_runner | Full QA passed: `run_qa.py`, `run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Browser smoke was blocked by sandbox `listen EPERM` on `127.0.0.1:5313`; escalated dev-server retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Reviewed Pattern Switch command wiring, result feedback, docs, and QA expectations; no findings. |

## Completion Notes

Completed. Quick Actions now expose Pattern A/B/C edit-focus commands that route through the existing `selectPattern` handler, report local edit-pattern metrics, and offer follow-up cues without changing Pattern event data, arrangement, playback, mixer/master, save/load, export, or sampling scope.
