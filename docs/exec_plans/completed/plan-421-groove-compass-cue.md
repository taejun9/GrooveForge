# plan-421-groove-compass-cue

## Status

Completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Add a Groove Compass Cue path so users can set the selected Pattern as the audition scope directly from Groove Compass and Quick Actions before judging or editing rhythm pocket.

## Non-Goals

- No autoplay, audio engine, scheduler, render/export, project schema, save/load, sampling, imported audio, remote AI, accounts, analytics, or cloud sync changes.
- No changes to Groove Compass scoring, card ordering, selected drum editing, Pattern data, arrangement data, or recommendation logic.
- No automatic groove fixing or hidden generation.

## Context Map

- Groove Compass UI and cue handler: `src/ui/App.tsx`
- Shared UI types and Quick Actions: `src/ui/workstationUiModel.ts`, `src/ui/App.tsx`
- Styles: `src/styles.css`
- Docs/static QA: `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-421-groove-compass-cue` and `.worktree/plan-421-groove-compass-cue` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Add a visible Groove Compass Cue control that routes to existing Pattern loop audition state.
- [x] Add a Groove Compass Cue Quick Action with local result feedback.
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
| 2026-06-19 | `npm run verify` | Pass; existing Vite chunk-size warning remains |
| 2026-06-19 | `npm run dev -- --port 5174` | Blocked by sandbox `listen EPERM`; escalation request rejected, so browser smoke was not run |

## Review Plan

QA completes before review starts. Review checks that cueing is UI-local, does not autoplay, mutates no Pattern/project musical data, uses existing loop-scope state, preserves Groove Compass derivation, and adds no sampling/remote/cloud scope.

## Review Results

No blocking findings. The cue path calls the existing selected Pattern cue flow, guards playback while running, keeps cue/result feedback UI-local, avoids Pattern/arrangement/export/schema edits, and preserves Groove Compass card derivation and focus behavior. Browser smoke remains the only residual gap because local port binding is blocked in this environment.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add cueing, not fixing, from Groove Compass. | Users need to hear the selected Pattern before editing pocket; cueing keeps the feature explicit and non-destructive. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added Groove Compass Cue button, Quick Action, result metric, follow-up guidance, styles, docs, and static QA expectations. |
| 2026-06-19 | quality_runner | Ran CLI QA set; all commands passed. Browser smoke could not run because localhost listen is blocked by sandbox policy. |
| 2026-06-19 | review_judge | Reviewed after QA with no blocking findings; residual risk limited to unavailable browser smoke. |

## Completion Notes

Groove Compass now has an explicit Cue path that sets the currently selected Pattern as the Pattern loop for rhythm-pocket audition from both the visible Groove Compass panel and Quick Actions. The cue path uses existing Pattern loop transport state, guards against cueing while playback is active, shows UI-local Quick Actions result feedback, and does not change Pattern events, arrangement data, export behavior, saved project schema, undo history, sampling/import support, remote AI, accounts, analytics, or cloud sync.

Docs and static QA expectations now record Groove Compass Cue as a composition-first audition helper, not a sampling workflow or automatic groove fixer.
