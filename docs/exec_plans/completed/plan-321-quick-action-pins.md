# plan-321-quick-action-pins

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Add UI-local Quick Actions Pinned Commands so users can pin, unpin, inspect, and explicitly run their most-used beat-making commands without changing command ranking, project data, saved files, or any command handler semantics.

## Non-Goals

- Do not persist pinned commands to project files, localStorage, analytics, or cloud state.
- Do not add macros, command chains, auto-run behavior, global OS shortcuts, sampling, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- Do not change existing Quick Action ids, command ordering, search matching, scope filter counts, Spotlight Enter behavior, Recent Commands semantics, or any underlying command handler.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Quick Action state, command palette UI, visible command derivation, command execution, result strip, recent commands.
- `README.md`: Quick Actions feature summary.
- `docs/product/product.md`: product behavior and MVP scope.
- `docs/quality/rules.md`: guardrails for command palette features.
- `harness/scripts/run_qa.py`: static expectations for code/docs alignment.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Use `codex/plan-321-quick-action-pins` and `.worktree/plan-321-quick-action-pins` for repository work.

## Implementation Plan

- [x] Inspect existing Quick Actions state, Recent Commands, Spotlight, and command execution paths.
- [x] Add bounded UI-local pinned command state that stores only action ids and prunes missing commands.
- [x] Add pin/unpin controls on visible command rows plus a Pinned Commands row that reruns current command definitions through the existing handler.
- [x] Update docs and QA expectations to define the feature as local, explicit, bounded, and non-persistent.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open Quick Actions, pin/unpin commands, rerun a pinned command, and confirm no auto-run, persistence, ranking, search, scope, or project-data mutation behavior changes.

## Review Plan

QA completes before review starts. Review checks that pins are UI-local and bounded, pin/unpin never runs commands, pinned reruns use current Quick Action definitions and existing handlers only after explicit clicks, and the feature preserves search/filter/Spotlight/Recent/result behavior, project files, undo history, playback, save/load, and export semantics.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add UI-local pinned Quick Actions before deeper new creation engines. | The command palette is now broad; pinned commands improve pro speed and beginner repeatability while reusing existing safe explicit command paths. |
| 2026-06-18 | Keep pins session-only instead of project/localStorage persistence. | This provides fast command reuse without altering saved beat files, adding user settings scope, or creating hidden long-term state. |
| 2026-06-18 | Record Browser smoke as blocked by localhost policy after static/build/runtime QA passed. | Vite failed with `listen EPERM` on `127.0.0.1:5345`, and the required escalated retry was rejected by the environment policy. |

## QA Results

| date | command | result |
|---|---|---|
| 2026-06-18 | `python3 harness/scripts/run_qa.py` | passed |
| 2026-06-18 | `python3 harness/scripts/run_quality_gate.py` | passed |
| 2026-06-18 | `npm run typecheck` | passed |
| 2026-06-18 | `npm run build` | passed with existing Vite large chunk warning |
| 2026-06-18 | `npm run qa` | passed |
| 2026-06-18 | `npm run verify` | passed with existing Vite large chunk warning |
| 2026-06-18 | `git diff --check` | passed |
| 2026-06-18 | `npm run dev -- --host 127.0.0.1 --port 5345` | blocked by `listen EPERM`; escalated retry rejected by environment policy |

## Review Results

No blocking findings. Pinned Commands store only bounded UI-local action ids, pin/unpin never runs a command, pinned command cards rerun current Quick Action definitions only after explicit clicks, and search, scope counts, Spotlight Enter behavior, Recent Commands, result strips, keyboard shortcuts, project files, undo history, playback, save/load, and export semantics are preserved.

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created on a dedicated worktree after main was clean at `08f88f9`. |
| 2026-06-18 | harness_builder | Added bounded session-only Quick Action pins, visible pin/unpin controls, pinned command row, and harness expectations. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, and quality rules to define Pinned Commands as explicit, local, bounded, and non-persistent. |
| 2026-06-18 | quality_runner | Static QA, typecheck, build, verify, and diff checks passed; browser smoke was blocked by localhost policy. |
| 2026-06-18 | review_judge | Reviewed post-QA changes with no blocking findings. |
