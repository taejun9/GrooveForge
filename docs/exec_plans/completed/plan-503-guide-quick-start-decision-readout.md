# plan-503-guide-quick-start-decision-readout

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Add a read-only Guide Quick Start Decision Readout that explains the current best next guide lane from First Beat Path, Session Pass, and Workflow Spotlight so beginners understand what to press next and producers can scan the session target faster.

## Non-Goals

- Do not change First Beat Path, Session Pass, Workflow Navigator, Workflow Spotlight, Quick Actions, pinned commands, or result handler behavior.
- Do not change guide scoring, project schema, saved project files, undo history, playback, render/export, Handoff, local draft recovery, or command filtering/order.
- Do not add tutorials, onboarding overlays, command chains, auto-run, autoplay, auto-pin, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not persist the decision readout in project data, localStorage, or exported files.

## Context Map

- `src/ui/workstationGuidancePanels.tsx`: Guide Quick Start component, local clicked-lane results, and derived guide summaries.
- `src/styles.css`: Guide Quick Start layout and responsive CSS.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA boundaries for direct beat-making guide flow.
- `harness/scripts/run_qa.py`: executable documentation/source/style expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Guide Quick Start data flow, rendering, CSS, docs, and harness checks.
- [x] Derive a UI-local decision readout from existing path/session/workflow summaries without new handlers or persisted state.
- [x] Render the compact readout in Guide Quick Start above the three existing action buttons.
- [x] Style the readout for desktop and mobile layouts without creating nested cards.
- [x] Update docs and harness expectations.
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

QA completes before review starts. Review should confirm the readout is read-only, derived only from existing First Beat Path, Session Pass, Workflow Spotlight, and visible Workflow Navigator state, preserves all existing guide and Quick Actions behavior, and does not introduce sampling, imported audio, remote AI, schema, playback, or export changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a Guide Quick Start decision readout instead of another guide action. | The top guide surface should explain the next direct beat-making target while preserving explicit user-triggered actions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make the top guide target clearer for beginners and faster to scan for producers. |
| 2026-06-20 | harness_builder | Added a UI-local Guide Quick Start decision readout, responsive styling, and matching docs/harness checks. |
| 2026-06-20 | quality_runner | QA passed; local dev server preview is blocked by sandbox localhost listen policy. |
| 2026-06-20 | review_judge | Review found no follow-up changes before completion. |

## QA Results

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large chunk warning.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 style profiles.
- `npm run dev -- --host 127.0.0.1` was blocked by `listen EPERM: operation not permitted 127.0.0.1:5173`; escalated retry was rejected by the environment policy, so no browser preview was performed.

## Review

Review confirmed the decision readout is read-only, derived from existing First Beat Path, Session Pass, Workflow Spotlight, and visible Workflow Navigator state, and follows the same highest-risk lane priority as the `guide-quick-start` Quick Action target. Existing Path, Session, Workflow, Quick Action, suggestion card, and pinned-command execution paths are unchanged. The change does not alter project schema, undo history, playback, render/export, Handoff, local draft recovery, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Completion Notes

Added a compact Guide Quick Start Decision Readout that explains the current highest-priority guide lane before the user chooses a Path, Session, or Workflow action. Updated docs and harness expectations so the top guide surface remains a local direct beat-making aid rather than an onboarding overlay or command chain.
