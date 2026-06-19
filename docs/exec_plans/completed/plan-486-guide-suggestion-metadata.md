# plan-486-guide-suggestion-metadata

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add explicit source and pin-state metadata to the Quick Actions Guide Quick Start suggestion card so users can see whether the suggested command will route through Path, Session, or Workflow before running or pinning it.

## Non-Goals

- Do not change Guide Quick Start target selection, Quick Actions filtering, Spotlight Enter target, command order, Pinned Commands behavior, Recent Commands, project schema, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
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

- [x] Inspect current guide suggestion card and pinned metadata.
- [x] Add UI-local source and pin-state metadata derived from the current `guide-quick-start` Quick Action and pinned ids.
- [x] Keep Run and Pin/Unpin behavior routed through existing handlers.
- [x] Update docs and harness expectations for the metadata.
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

QA completes before review starts. Review should confirm metadata is display-only, derived from existing Quick Action detail and pinned ids, and does not change command execution, ordering, persistence, or project data.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Show source and pin-state metadata in the suggestion card rather than changing command title or ranking. | The user should know the command target before running it while preserving existing Quick Actions semantics. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make Guide Quick Start suggestion routing clearer without changing command behavior. |
| 2026-06-20 | repo_cartographer | Added display-only source and pin-state metadata to the Quick Actions Guide Quick Start suggestion card. |
| 2026-06-20 | harness_builder | Updated README, product docs, quality rules, and harness checks for suggestion metadata boundaries. |
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
- The suggestion source badge is display-only and is derived from the current `guide-quick-start` Quick Action detail text.
- The suggestion pin-state badge is display-only and is derived from the current pinned action ids.
- Run and Pin/Unpin controls still route through the existing guide suggestion run and pinned-command handlers.
- No command execution, Quick Actions filtering/order, Spotlight Enter target, Recent Commands, command ranking, project schema, undo/redo history, playback, save/load, render/export, Handoff, local draft, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior changed.

## Completion Notes

plan-486 completed by making the Quick Actions Guide Quick Start suggestion card show its source and current pin state without changing command behavior or project data.
