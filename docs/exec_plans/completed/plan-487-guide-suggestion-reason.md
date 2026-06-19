# plan-487-guide-suggestion-reason

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add a short display-only reason line to the Quick Actions Guide Quick Start suggestion card so beginners understand why the suggested next beat-making command is relevant and producers can scan the current session rationale before running it.

## Non-Goals

- Do not change Guide Quick Start target selection, source metadata, pin-state metadata, Quick Actions filtering, Spotlight Enter target, command order, Pinned Commands behavior, Recent Commands, project schema, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
- Do not auto-run, auto-pin, persist, rank, reorder, or chain any command.
- Do not add onboarding overlays, tutorials, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Quick Actions guide suggestion card rendering.
- `src/styles.css`: guide suggestion metadata layout and responsive behavior.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current guide suggestion action detail and Guide Quick Start derived summaries.
- [x] Add a UI-local reason line derived from the current `guide-quick-start` Quick Action detail without changing selection or execution.
- [x] Keep Run and Pin/Unpin behavior routed through existing handlers.
- [x] Update docs and harness expectations for the reason line.
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

QA completes before review starts. Review should confirm the reason line is display-only, derived from current Quick Action detail, and does not change command selection, execution, ordering, persistence, or project data.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a compact reason line to the existing suggestion card instead of adding a new panel. | The suggestion card is already where users decide whether to run or pin Guide Quick Start, so the rationale should stay close without creating onboarding flow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make the Guide Quick Start suggestion explain its current rationale without changing command behavior. |
| 2026-06-20 | repo_cartographer | Added a display-only `Why now` reason line to the Quick Actions Guide Quick Start suggestion card. |
| 2026-06-20 | harness_builder | Updated README, product docs, quality rules, and harness checks for reason-line boundaries. |
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
- The suggestion reason line is display-only and derived from the current `guide-quick-start` Quick Action detail text.
- The reason line leaves Guide Quick Start target selection, source metadata, pin-state metadata, Run behavior, and Pin/Unpin behavior unchanged.
- The two-line CSS treatment prevents the extra rationale text from expanding or overlapping the compact Quick Actions card.
- No command execution, Quick Actions filtering/order, Spotlight Enter target, Recent Commands, command ranking, project schema, undo/redo history, playback, save/load, render/export, Handoff, local draft, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior changed.

## Completion Notes

plan-487 completed by making the Quick Actions Guide Quick Start suggestion explain why the current guide target is relevant before the user runs or pins it.
