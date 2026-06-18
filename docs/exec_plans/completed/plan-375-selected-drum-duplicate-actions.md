# plan-375-selected-drum-duplicate-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action for duplicating the active selected drum hit into the copied lane's next empty step inside the selected Pattern A/B/C slot, preserving its velocity, probability, microtiming, and hat repeat data where applicable.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new audio engines.
- No whole-lane cloning, pattern fill generation, drum randomization, quantize pass, lane remapping, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing selected-drum step move, copy, paste, delete, audition, velocity, chance, timing, hat-repeat, or reset behavior.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected drum Quick Action definitions.
- `src/ui/App.tsx`: selected drum copy/paste/delete handlers, current-pattern updates, Quick Actions wiring, and selected drum state.
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
- Keep selected drum duplication scoped to the selected Pattern A/B/C slot.
- Disable duplication when no active selected drum hit exists or no same-lane empty target step exists.
- Preserve selected hit velocity, probability, timing, and hat repeat state on the duplicate.
- Keep the duplicate hit selected after a successful duplicate.

## Implementation Plan

- [x] Inspect selected drum copy/paste helpers and action result paths.
- [x] Add selected drum duplicate handler in `App.tsx`.
- [x] Add selected-drum duplicate Quick Action.
- [x] Wire new action through `createQuickActions` and `createSelectedEventQuickActions`.
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
- Blocked: Vite dev-server visual check. Sandbox returned `listen EPERM: operation not permitted 127.0.0.1:5182`, and the escalated localhost retry was rejected by policy.

## Review Plan

QA completes before review starts. Review checks that selected drum duplication is explicit, selected-pattern scoped, collision-safe, preserves per-hit dynamics/pocket fields, keeps the duplicate selected and undoable, and adds no sampling or remote scope.

## Review Results

- Findings: none.
- Verified selected-drum duplicate is disabled for inactive selections and no-empty-step lanes.
- Verified the duplicate handler routes through `updateCurrentPattern`, writes only the selected Pattern A/B/C slot, preserves velocity/probability/microtiming/hat-repeat values, keeps the duplicate selected, leaves the UI-local drum clipboard unchanged, and introduces no sampling or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected drum duplicate after step-move actions. | Repeating a kick, clap, hat, or perc hit is a common direct beat-writing move; note, chord, and arrangement blocks already expose duplicate commands. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected drum duplicate Quick Action. |
| 2026-06-19 | harness_builder | Added selected drum duplicate Quick Action using the same-lane next-empty step path while preserving hit pocket fields and leaving the drum clipboard unchanged. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for selected-drum duplicate commands. |
| 2026-06-19 | quality_runner | Ran static QA, quality gate, diff check, typecheck, runtime smoke, build, qa, and verify successfully; browser visual check was blocked by localhost policy. |
| 2026-06-19 | review_judge | Reviewed selected drum duplicate behavior after QA; no findings. |
