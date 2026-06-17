# plan-291-pattern-cue-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose Pattern A/B/C cueing through Quick Actions so users can prepare Pattern-loop audition from command search using the existing Pattern Compare Cue behavior.

## Non-Goals

- Do not start playback automatically, change Pattern A/B/C event data, change selected arrangement block Pattern assignment, change Pattern Use behavior, alter render/export, mixer/master, project schema, or Pattern Compare derivation.
- Do not add hidden generation, command chains, auto-arrangement, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or plugin hosting.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: existing `cuePattern` handler, Pattern Compare Cue buttons, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary.
- `docs/product/product.md`: Pattern Compare and Quick Actions product behavior.
- `docs/quality/rules.md`: guardrails for Pattern Compare Cue and Pattern-loop audition.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-291-pattern-cue-quick-actions` and `.worktree/plan-291-pattern-cue-quick-actions` for git repository work.

## Implementation Plan

- [x] Inspect existing Pattern Compare Cue and Quick Actions wiring.
- [x] Add Pattern Cue Quick Actions that route through `cuePattern`.
- [x] Add local result metrics and follow-up copy for Pattern-loop audition setup commands.
- [x] Update durable docs and QA expectations to keep Pattern Cue scoped to selected-pattern preview state and loop scope.
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
- Browser smoke if environment allows localhost: open the workstation, run Quick Actions Pattern Cue commands, confirm selected Pattern and loop scope move to Pattern audition without autoplay, no Pattern event or arrangement mutation, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Pattern Cue commands reuse the existing Pattern Compare Cue path, switch only selected-pattern preview state plus loop scope, reset selected note/drum/chord focus consistently with cue buttons, preserve Pattern A/B/C event data, selected-block Pattern assignment, arrangement, playback start/stop, save/load, export semantics, Quick Actions search/results, and avoid sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Pattern Cue commands after Pattern Switch and Pattern Use. | Switch edits a variation, Use places it in arrangement, and Cue prepares fast audition of a variation without autoplay or data mutation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Pattern Compare has Cue buttons and an existing `cuePattern` handler but Quick Actions lacks Pattern Cue commands. |
| 2026-06-18 | harness_builder | Added Pattern Cue Quick Actions through the existing `cuePattern` path, local result feedback, docs, quality guardrails, and QA expectations. |
| 2026-06-18 | quality_runner | Initial `run_qa.py` and `npm run typecheck` passed before full QA. |
| 2026-06-18 | quality_runner | `npm run verify`, `npm run qa`, and `git diff --check` passed. Browser smoke was attempted, but localhost dev server startup failed with sandbox `listen EPERM`; escalated retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Reviewed diff after QA; no follow-up findings. Pattern Cue Quick Actions reuse `cuePattern`, preserve Pattern data and arrangement assignment, and add only local result feedback plus guardrails. |

## Completion Notes

Pattern A/B/C cue commands are available from Quick Actions and route through the existing Pattern Compare Cue handler. They prepare Pattern-loop audition without autoplay or undo history, keep Pattern event data and arrangement assignment unchanged, and report a local Pattern cue result plus follow-up.

Validation passed:

- `npm run verify`
- `npm run qa`
- `git diff --check`

Browser smoke was not completed because Vite could not listen on `127.0.0.1:5315` inside the sandbox (`listen EPERM`), and the escalated localhost dev-server retry was rejected by environment policy.
