# plan-525-guide-quick-start-priority-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Guide Quick Start Priority Readout so beginners can understand why the current path/session/workflow target is first and working producers can scan the next verification standard before jumping.

## Non-Goals

- Do not change Guide Quick Start click routing, Quick Actions routing, Session Pass focus, First Beat Path jump, Workflow Spotlight jump, or scoring.
- Do not mutate project data, undo history, playback, save/load, export, Handoff, local drafts, command execution, or pinned-command state from the readout.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, onboarding overlays, tutorials, macros, auto-run, or auto-pin.

## Context Map

- `src/ui/workstationGuidancePanels.tsx` renders Guide Quick Start, decision/context/action/result UI, and helper derivation.
- `src/styles.css` contains Guide Quick Start layout and responsive styling.
- `README.md` and `docs/product/product.md` describe Guide Quick Start as local guide/workflow entry point.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Guide Quick Start behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from existing First Beat Path, Session Pass, Workflow Spotlight, and Guide Quick Start decision/context state.

## Implementation Plan

- [x] Add a typed UI-local Guide Quick Start Priority summary.
- [x] Render the priority readout near the Guide Quick Start decision with stable test ids and no click handlers.
- [x] Add responsive CSS that keeps compact priority text contained.
- [x] Update README, product docs, quality rules, and QA token expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt and escalated retry if sandbox blocks binding.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Guide Quick Start Priority Readout. | The launch strip already chooses a lane, but users need a faster explanation of why that lane is first and what to verify after jumping. |
| 2026-06-20 | Do not work around dev-server sandbox denial. | `npm run dev -- --host 127.0.0.1` failed with `listen EPERM`, and the escalated retry was rejected by policy; all non-server QA passed. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 524 completed plans, no active plans, and next 10-plan progress report due at plan-530. |
| 2026-06-20 | project_lead | Implemented the UI-local Guide Quick Start Priority Readout from existing decision/path/session/workflow summaries, with no routing, command, or sampling scope added. |
| 2026-06-20 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify` passed. Dev server smoke was blocked by environment policy. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA and found no follow-up defects. |

## Completion Notes

Completed. Added a read-only Guide Quick Start Priority Readout, kept all jump/focus/Quick Actions behavior explicit and unchanged, updated documentation and QA expectations, passed required non-server QA, and recorded the environment policy block for dev-server smoke.
