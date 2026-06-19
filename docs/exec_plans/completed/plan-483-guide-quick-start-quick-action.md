# plan-483-guide-quick-start-quick-action

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add a Guide Quick Start Quick Action that runs the same current top-of-workstation guide target from the command palette, so beginners can use the visible strip and producers can use Cmd/Ctrl+K without learning separate commands.

## Non-Goals

- Do not change First Beat Path, Session Pass, Workflow Navigator, command ranking outside the new Guide Quick Start action, project schema, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
- Do not persist Guide Quick Start result state or create command chains, macros, auto-run behavior, tutorial overlays, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add sample browsing, chopping, sampler setup, imported audio, or sampling-first onboarding to the primary start path.

## Context Map

- `src/ui/App.tsx`: Quick Actions construction, command result metadata, and command result follow-up copy.
- `src/ui/workstationShellPanels.tsx`: Command Reference Guide section.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect the existing Guide Quick Start, Quick Actions, command result, and Command Reference patterns.
- [x] Add a single `guide-quick-start` Quick Action that chooses Path, Session, or Workflow from existing derived summaries and routes through existing handlers.
- [x] Add command result metadata/follow-up copy and Command Reference coverage for the new action.
- [x] Update docs and harness expectations for command-palette access to Guide Quick Start.
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

QA completes before review starts. Review should confirm the new Quick Action chooses one existing Guide Quick Start target, routes through existing First Beat Path, Session Pass, or Workflow Spotlight handlers, reports local result metadata, and does not mutate project data beyond the existing handler behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add one command-palette Guide Quick Start entry instead of duplicating all three visible strip buttons. | The visible strip already exposes Path, Session, and Workflow lanes; the command palette should provide a fast unified entry for producers while keeping beginner-facing UI simple. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to add command-palette access to the current Guide Quick Start target without changing project data or sampling scope. |
| 2026-06-20 | repo_cartographer | Added a Guide Quick Start Quick Action that selects the highest-priority Path, Session, or Workflow target from existing summaries. |
| 2026-06-20 | harness_builder | Updated Command Reference coverage, product docs, quality rules, and harness checks for the new `guide-quick-start` action. |
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
- The new `guide-quick-start` Quick Action derives its target only from existing First Beat Path, Session Pass, and Workflow Spotlight summaries.
- The action routes only through existing First Beat Path jump, Session Pass focus, and Workflow Spotlight focus handlers.
- Quick Action Result metadata marks the command as focus-only and reports local Guide Quick Start detail rather than implying a project edit.
- Command Reference, README, product docs, quality rules, and harness expectations now cover the command-palette path.
- No project schema, undo/redo history, playback, save/load, render/export, Handoff, local draft, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior changed.

## Completion Notes

plan-483 completed by adding command-palette access to the current Guide Quick Start target while preserving the existing direct beat-composition-first workflow and sampling-secondary boundary.
