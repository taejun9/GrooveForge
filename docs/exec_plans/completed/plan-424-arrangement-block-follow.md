# plan-424-arrangement-block-follow

## Status

Completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Add an explicit audible arrangement block follow path so users can switch the selected arrangement block and edit Pattern to the currently heard block from Arrangement Playback Readout and Quick Actions during Song playback.

## Non-Goals

- No audio engine, scheduler, render/export, save/load, project schema, sampling, imported audio, remote AI, accounts, analytics, or cloud sync changes.
- No changes to arrangement block data, Pattern A/B/C event data, arrangement assignments, playback start/stop, loop scope, Arrangement Playback Readout derivation, Arrangement Playhead Highlighting, Section Locator Pads, or Song Form Overview.
- No automatic follow mode, autoplay, command chains, hidden generation, or automatic selection changes while playback moves.

## Context Map

- Arrangement Playback Readout and selected block handler: `src/ui/App.tsx`
- Quick Actions and result feedback: `src/ui/App.tsx`
- Styles: `src/styles.css`
- Docs/static QA: `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-424-arrangement-block-follow` and `.worktree/plan-424-arrangement-block-follow` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Add a visible Arrangement Playback Readout follow control that selects the currently heard block only after an explicit click.
- [x] Add a Quick Actions audible arrangement block follow command with local result feedback.
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

QA completes before review starts. Review checks that audible block follow is explicit, UI-local except for selected arrangement block and selected Pattern view state, does not mutate arrangement or Pattern data, does not autoplay, preserves realtime playback/readout behavior, and introduces no sampling/remote/cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add one-shot audible block follow, not automatic follow mode. | Producers need fast alignment to the heard song section, while beginners should not see block selection jump automatically during playback. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added explicit Arrangement Playback Readout follow control, Quick Actions command, local result feedback, docs, and static QA expectations. |
| 2026-06-19 | quality_runner | Ran full QA after review guard changes; all required checks passed. |
| 2026-06-19 | review_judge | Reviewed audible arrangement follow path; no blocking findings. |

## Completion Notes

Completed with an explicit Arrangement Playback Readout follow button and Quick Actions `arrangement-follow-audible` command. The feature changes only selected arrangement block and selected Pattern edit focus through the existing view-update path after explicit user action, keeps arrangement and Pattern event data unchanged, and preserves playback, loop scope, save/load, export, and sample-free product scope.
