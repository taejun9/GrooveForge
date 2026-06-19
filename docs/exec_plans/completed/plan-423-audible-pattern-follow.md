# plan-423-audible-pattern-follow

## Status

Completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Add an explicit audible Pattern follow path so users can switch the selected editing Pattern to the currently heard Pattern from the Pattern Playback Readout and Quick Actions when Song or Block playback is on a different Pattern.

## Non-Goals

- No audio engine, scheduler, render/export, save/load, project schema, sampling, imported audio, remote AI, accounts, analytics, or cloud sync changes.
- No changes to Pattern A/B/C event data, arrangement block assignments, playback start/stop, loop scope, Pattern Compare, Playing Pattern Tabs, or Pattern-aware editor playheads.
- No automatic follow mode, autoplay, command chains, hidden generation, or automatic editing while playback moves.

## Context Map

- Pattern Playback Readout and selected Pattern handler: `src/ui/App.tsx`
- Quick Actions and result feedback: `src/ui/App.tsx`
- Styles: `src/styles.css`
- Docs/static QA: `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-423-audible-pattern-follow` and `.worktree/plan-423-audible-pattern-follow` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Add a visible Pattern Playback Readout follow control that selects the currently heard Pattern only after an explicit click.
- [x] Add a Quick Actions audible Pattern follow command with local result feedback.
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

## QA Results

| date | command | result |
|---|---|---|
| 2026-06-19 | `git diff --check` | Pass |
| 2026-06-19 | `python3 harness/scripts/run_qa.py` | Pass |
| 2026-06-19 | `python3 harness/scripts/run_quality_gate.py` | Pass |
| 2026-06-19 | `npm run typecheck` | Pass |
| 2026-06-19 | `npm run build` | Pass; existing Vite chunk-size warning remains |
| 2026-06-19 | `npm run qa` | Pass |
| 2026-06-19 | `npm run verify` | Pass; runtime smoke passed for 14/14 sample-free Beat Blueprints and 14/14 supported style profiles, with existing Vite chunk-size warning |
| 2026-06-19 | Browser smoke | Not run; in-app Browser tools were not exposed in this session |

## Review Plan

QA completes before review starts. Review checks that audible Pattern follow is explicit, UI-local except for selected editing Pattern state, does not mutate Pattern or arrangement musical data, does not autoplay, preserves realtime playback/readout behavior, and introduces no sampling/remote/cloud scope.

## Review Results

No blocking findings. Audible Pattern Follow derives from realtime playback snapshots and selected Pattern state, routes through the existing selected Pattern view update path, remains an explicit one-shot user action, preserves Pattern/arrangement/export data, and does not introduce autoplay, automatic follow mode, sampling, remote AI, accounts, analytics, or cloud sync. Residual risk is limited to unavailable browser smoke.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add one-shot follow, not automatic follow mode. | Producers need fast edit alignment to the heard Pattern, while beginners should not have selection jumping automatically during playback. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added Pattern Playback Readout follow button, Quick Actions command, local result feedback, docs, and static QA expectations. |
| 2026-06-19 | quality_runner | Ran CLI QA set; all commands passed. Browser smoke was unavailable because in-app Browser tools were not exposed. |
| 2026-06-19 | review_judge | Reviewed after QA with no blocking findings; residual risk limited to unavailable browser smoke. |

## Completion Notes

Audible Pattern Follow is implemented as an explicit one-shot Pattern Playback Readout button and Quick Actions command. When Song or Block playback is hearing a different Pattern than the one being edited, users can switch edit focus to the audible Pattern without starting playback, stopping playback, changing loop scope, writing undo history, mutating Pattern events, changing arrangement assignments, or affecting save/load/export behavior.

Docs and static QA expectations now lock this as a direct-composition playback/editing clarity feature, not an automatic follow mode, hidden generator, sampling workflow, or remote/cloud feature.
