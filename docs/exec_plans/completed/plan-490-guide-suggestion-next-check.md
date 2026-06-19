# plan-490-guide-suggestion-next-check

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add a display-only after-run check line to the Quick Actions Guide Quick Start suggestion card so users know what to inspect immediately after running the suggested guide command.

## Non-Goals

- Do not change Guide Quick Start target selection, source metadata, target metadata, metric metadata, reason line, pin-state metadata, Quick Actions filtering, Spotlight Enter target, command order, Pinned Commands behavior, Recent Commands, project schema, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
- Do not auto-run, auto-pin, persist, rank, reorder, or chain any command.
- Do not add onboarding overlays, tutorials, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Quick Actions guide suggestion card rendering.
- `src/styles.css`: guide suggestion line layout and responsive behavior.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current guide suggestion source/detail derivation.
- [x] Add a UI-local after-run check line derived from the current `guide-quick-start` Quick Action detail without changing selection or execution.
- [x] Keep Run and Pin/Unpin behavior routed through existing handlers.
- [x] Update docs and harness expectations for the after-run check line.
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

QA completes before review starts. Review should confirm the after-run check line is display-only, derived from current Quick Action detail, and does not change command selection, execution, ordering, persistence, or project data.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add an after-run line to the existing suggestion card instead of adding a new guided flow. | The card is the decision point for the command, and the next check should stay visible without introducing onboarding or command chaining. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make Guide Quick Start suggestion execution feel predictable without changing behavior. |
| 2026-06-20 | repo_cartographer | Added a display-only after-run check line to the Quick Actions Guide Quick Start suggestion card. |
| 2026-06-20 | harness_builder | Updated README, product docs, quality rules, and harness checks for after-run check boundaries. |
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
- The suggestion after-run check line is display-only and derived from the current `guide-quick-start` Quick Action detail text.
- The after-run check line leaves Guide Quick Start target selection, source metadata, target metadata, metric metadata, reason line, pin-state metadata, Run behavior, and Pin/Unpin behavior unchanged.
- No command execution, Quick Actions filtering/order, Spotlight Enter target, Recent Commands, command ranking, project schema, undo/redo history, playback, save/load, render/export, Handoff, local draft, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior changed.

## Completion Notes

plan-490 completed by making the Quick Actions Guide Quick Start suggestion show what to inspect immediately after running the guide command.
