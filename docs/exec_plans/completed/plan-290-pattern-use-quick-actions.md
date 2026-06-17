# plan-290-pattern-use-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose Pattern A/B/C selected-block assignment through Quick Actions so users can place variations into the arrangement from command search using the existing Pattern Compare Use behavior.

## Non-Goals

- Do not change Pattern A/B/C musical event data, Pattern Compare derivation, Pattern Switch behavior, arrangement block copy/paste/split/merge semantics, playback scheduling, render/export, mixer/master, or project schema.
- Do not add hidden generation, command chains, autoplay, auto-arrangement, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or plugin hosting.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: existing `usePatternInSelectedBlock` handler, Pattern Compare Use buttons, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary.
- `docs/product/product.md`: Pattern Compare and Quick Actions product behavior.
- `docs/quality/rules.md`: guardrails for Pattern Compare Use and arrangement Pattern assignment.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-290-pattern-use-quick-actions` and `.worktree/plan-290-pattern-use-quick-actions` for git repository work.

## Implementation Plan

- [x] Inspect existing Pattern Compare Use and Quick Actions wiring.
- [x] Add Pattern Use Quick Actions that route through `usePatternInSelectedBlock`.
- [x] Add local result metrics and follow-up copy for selected-block Pattern assignment commands.
- [x] Update durable docs and QA expectations to keep the command scoped to selected arrangement block assignment.
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
- Browser smoke if environment allows localhost: open the workstation, run Quick Actions Pattern Use commands, confirm only the selected arrangement block Pattern assignment and edit Pattern change, no Pattern event mutation, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Pattern Use commands reuse the existing selected-block Pattern assignment path, keep the mutation limited to the selected arrangement block and selected edit Pattern, preserve Pattern A/B/C event data, arrangement length, muted tracks, playback/export semantics, Quick Actions search/results, and avoid sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Pattern Use commands after Pattern Switch commands. | Pattern Switch moves edit focus; Pattern Use completes the next arrangement step by placing a chosen variation into the selected block through the existing explicit Use path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Pattern Compare has Use buttons and an existing handler but Quick Actions lacks selected-block Pattern assignment commands. |
| 2026-06-18 | harness_builder | Added Pattern Use Quick Actions through the existing `usePatternInSelectedBlock` path, no-op disabling, local result feedback, docs, quality guardrails, and QA expectations. |
| 2026-06-18 | quality_runner | Initial `run_qa.py` and `npm run typecheck` passed before full QA. |
| 2026-06-18 | quality_runner | Full QA passed: `run_qa.py`, `run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Browser smoke was blocked by sandbox `listen EPERM` on `127.0.0.1:5314`; escalated dev-server retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Reviewed Pattern Use command wiring, no-op disabling, result feedback, docs, and QA expectations; no findings. |

## Completion Notes

Completed. Quick Actions now expose Pattern A/B/C selected-block assignment commands that route through `usePatternInSelectedBlock`, disable no-op assignments, report local arrangement-pattern metrics, and offer follow-up cues without changing Pattern event data, arrangement length, muted tracks, playback, mixer/master, save/load, export, or sampling scope.
