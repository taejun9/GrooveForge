# plan-485-guide-suggestion-pin

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add an explicit Pin/Unpin control to the Quick Actions guide suggestion card so users can keep `guide-quick-start` in Pinned Commands without scrolling to the command list.

## Non-Goals

- Do not auto-pin, default-pin, persist, rank, reorder, or auto-run any command.
- Do not change Quick Actions filtering, Spotlight Enter target, Recent Commands, existing pinned-command behavior, project schema, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
- Do not add onboarding overlays, tutorials, command chains, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Quick Actions guide suggestion card and existing pin handler wiring.
- `src/styles.css`: guide suggestion layout.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current guide suggestion and pinned-command behavior.
- [x] Add an explicit Pin/Unpin button to the guide suggestion card using the existing `onTogglePin` handler.
- [x] Keep run behavior, Spotlight Enter behavior, filtered list order, and pinned storage unchanged.
- [x] Update docs and harness expectations for the explicit suggestion pin control.
- [x] Run QA, review, complete plan, and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should confirm the suggestion Pin/Unpin button calls only the existing pin toggle path after explicit click and does not change defaults, ordering, persistence, command execution, or project data.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add explicit Pin/Unpin to the guide suggestion card instead of default-pinning `guide-quick-start`. | Producers get faster repeated access while Pinned Commands remain user-controlled and session-only. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make the Guide Quick Start suggestion easier to pin without changing default command behavior. |
| 2026-06-20 | repo_cartographer | Added explicit Pin/Unpin control to the Quick Actions Guide Quick Start suggestion card using existing pinned-command handling. |
| 2026-06-20 | harness_builder | Updated README, product, quality rules, and harness checks for the suggestion pin control and its UI-local constraints. |
| 2026-06-20 | quality_runner | Ran the required validation loop; all non-browser checks passed. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA and found no follow-up fixes. |

## QA Results

| command | result |
|---|---|
| `git diff --check` | passed |
| `python3 harness/scripts/run_qa.py` | passed |
| `python3 harness/scripts/run_quality_gate.py` | passed |
| `npm run typecheck` | passed |
| `npm run build` | passed with existing Vite large chunk warning |
| `npm run qa` | passed |
| `npm run verify` | passed with existing Vite large chunk warning; runtime smoke passed 14/14 blueprints and 14/14 style profiles |
| `npm run dev -- --host 127.0.0.1` | blocked by sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy |

## Review

- No blocking findings.
- The suggestion Pin/Unpin button is explicit and calls only `onTogglePin(guideSuggestionAction)`.
- No default pinned command, command ranking, filtered ordering, Spotlight Enter behavior, Recent Commands, run behavior, project schema, undo/redo history, playback, save/load, render/export, Handoff, local draft, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior changed.
- The responsive layout preserves fixed command button dimensions and collapses to one column on narrow screens.

## Completion Notes

plan-485 completed by adding explicit Guide Quick Start suggestion Pin/Unpin controls while preserving user-controlled, session-only Pinned Commands semantics.
