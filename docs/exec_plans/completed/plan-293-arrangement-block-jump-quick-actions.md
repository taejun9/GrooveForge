# plan-293-arrangement-block-jump-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct arrangement block navigation through Quick Actions so users can jump command search to any current song-form block using the existing arrangement block selection behavior.

## Non-Goals

- Do not start playback automatically, change arrangement blocks, mutate Pattern A/B/C event data, create undo history, change selected-block edit tools, alter render/export, mixer/master, project schema, or Song Form Overview derivation.
- Do not add hidden generation, command chains, auto-arrangement, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or plugin hosting.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: existing `selectArrangementBlock`, Arrangement Track and Song Form Overview selection, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary.
- `docs/product/product.md`: Arrangement and Quick Actions product behavior.
- `docs/quality/rules.md`: Song Form Overview and selected-block navigation guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-293-arrangement-block-jump-quick-actions` and `.worktree/plan-293-arrangement-block-jump-quick-actions` for git repository work.

## Implementation Plan

- [x] Inspect existing arrangement block selection and Quick Actions wiring.
- [x] Add Arrangement Block Jump Quick Actions that route through `selectArrangementBlock`.
- [x] Add local result metrics and follow-up copy for block navigation commands.
- [x] Update durable docs and QA expectations to keep block jumps scoped to selected-block navigation plus selected Pattern preview state.
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
- Browser smoke if environment allows localhost: open the workstation, run Quick Actions Arrangement Block Jump commands, confirm selected arrangement block and selected Pattern move to the target block without autoplay, no arrangement or Pattern event mutation, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Arrangement Block Jump commands reuse the existing selected-block navigation path, switch only selected arrangement block plus selected Pattern preview state, preserve arrangement blocks, Pattern A/B/C event data, playback start/stop, save/load, export semantics, Quick Actions search/results, and avoid sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add one Quick Action per current arrangement block. | Producers can jump quickly across dense song forms, and beginners can navigate sections from command search without changing arrangement data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Arrangement Track and Song Form Overview already select blocks but Quick Actions lacks direct per-block navigation commands. |
| 2026-06-18 | harness_builder | Added Arrangement Block Jump Quick Actions through the existing `selectArrangementBlock` path, local result feedback, docs, quality guardrails, and QA expectations. |
| 2026-06-18 | quality_runner | Initial `run_qa.py`, `npm run typecheck`, and `git diff --check` passed before full QA. |
| 2026-06-18 | quality_runner | `npm run verify`, `npm run qa`, and `git diff --check` passed. Browser smoke was attempted, but localhost dev server startup failed with sandbox `listen EPERM`; escalated retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Reviewed diff after QA; no follow-up findings. Arrangement Block Jump Quick Actions reuse `selectArrangementBlock`, preserve arrangement and Pattern event data, and add only local result feedback plus guardrails. |

## Completion Notes

Arrangement Block Jump commands are available from Quick Actions for every current arrangement block and route through the existing selected-block navigation handler. They select the target block and its assigned Pattern for editing/audition without autoplay, undo history, arrangement mutation, Pattern event mutation, or export changes.

Validation passed:

- `npm run verify`
- `npm run qa`
- `git diff --check`

Browser smoke was not completed because Vite could not listen on `127.0.0.1:5317` inside the sandbox (`listen EPERM`), and the escalated localhost dev-server retry was rejected by environment policy.
