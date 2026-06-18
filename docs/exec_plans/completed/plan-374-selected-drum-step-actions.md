# plan-374-selected-drum-step-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add direct Quick Actions for moving the selected drum hit one step earlier or later inside the selected Pattern A/B/C slot, preserving the hit's velocity, probability, microtiming, and hat repeat data where applicable.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new audio engines.
- No drum fill generation, whole-pattern shift, quantize pass, lane remapping, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing drum velocity/chance/timing/hat-repeat/reset/copy/paste/delete/audition behavior.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected drum Quick Action definitions.
- `src/ui/App.tsx`: selected drum update handlers, current-pattern updates, Quick Actions wiring, and selected drum state.
- `src/domain/workstation.ts`: drum lane/step data and normalization helpers.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected drum edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected drum movement scoped to the selected Pattern A/B/C slot.
- Disable movement when no active selected drum hit exists, when the target step is outside the 16-step grid, or when the same lane already has an active hit at the target step.
- Preserve selected hit velocity, probability, timing, and hat repeat state; reset the source step's timing/probability/hat repeat to safe defaults after moving.
- Keep the moved hit selected after a successful move.

## Implementation Plan

- [x] Inspect selected drum update helpers and data fields.
- [x] Add selected drum step move handler in `App.tsx`.
- [x] Add selected-drum step left/right Quick Actions.
- [x] Wire new actions through `createQuickActions` and `createSelectedEventQuickActions`.
- [x] Update README, product docs, quality rules, and static QA expectations.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `git diff --check`
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Browser/dev-server visual check if the environment allows localhost.

## QA Results

- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `git diff --check`
- Passed: `npm run typecheck`
- Passed: `npm run harness:smoke`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Blocked: Vite dev-server visual check. Sandbox returned `listen EPERM: operation not permitted 127.0.0.1:5181`, the escalated localhost retry was rejected by policy, and Browser blocked the safer `file://` dist check by URL policy.

## Review Plan

QA completes before review starts. Review checks that selected drum step movement is explicit, selected-pattern scoped, collision-safe, preserves per-hit dynamics/pocket fields, keeps movement undoable, and adds no sampling or remote scope.

## Review Results

- Findings: none.
- Verified selected-drum step-left/step-right commands are disabled for inactive selections, grid edges, and occupied target steps.
- Verified the move handler routes through `updateCurrentPattern`, preserves velocity/probability/microtiming/hat-repeat values on the moved hit, resets source pocket defaults, keeps the moved hit selected, and introduces no sampling or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected drum step nudges after selected event recovery commands. | Moving a single drum hit is a frequent pocket correction for producers and a safer beginner workflow than deleting/recreating hits. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected drum hit step Quick Actions. |
| 2026-06-19 | harness_builder | Added selected drum hit step-left and step-right Quick Actions through a selected-pattern move handler that preserves hit pocket fields and blocks occupied target steps. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for selected-drum step-left/step-right commands. |
| 2026-06-19 | quality_runner | Ran static QA, quality gate, diff check, typecheck, runtime smoke, build, qa, and verify successfully; browser visual check was blocked by localhost/file URL policy. |
| 2026-06-19 | review_judge | Reviewed selected drum step move behavior after QA; no findings. |
