# plan-522-guide-quick-start-context-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Guide Quick Start Context Readout that shows the current Path, Session, and Workflow lanes side by side so beginners can understand the next beat-making route and producers can scan session posture without opening separate panels.

## Non-Goals

- Do not change First Beat Path, Session Pass, Workflow Spotlight scoring, ordering, actions, or Quick Actions routing.
- Do not mutate project data, undo history, playback, save/load, export, Handoff, local drafts, or command execution.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, onboarding overlays, macros, auto-run, or tutorials.

## Context Map

- `src/ui/workstationGuidancePanels.tsx` renders `GuideQuickStart`, its Decision Readout, explicit Path/Session/Workflow actions, and clicked-lane Result feedback.
- `src/styles.css` contains Guide Quick Start layout, responsive styling, and tone variants.
- `README.md` and `docs/product/product.md` describe Guide Quick Start as UI-local guidance for beginners and producers.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Guide Quick Start derivation and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Context Readout derived only from existing First Beat Path, Session Pass, and Workflow Spotlight visible state.

## Implementation Plan

- [x] Add a typed Guide Quick Start context summary for Path, Session, and Workflow.
- [x] Render a compact read-only context strip with stable test ids and tone classes.
- [x] Add responsive CSS that keeps compact text contained.
- [x] Update README, product docs, quality rules, and QA token expectations.

## QA Plan

- [x] `git diff --check`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run build`
- [x] `npm run qa`
- [x] `npm run verify`
- [x] Dev server smoke attempt and escalated retry if sandbox blocks binding.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a Guide Quick Start Context Readout instead of changing guide actions. | Users need faster orientation across Path, Session, and Workflow, but action behavior should remain explicit and stable. |
| 2026-06-20 | Treat dev-server binding as environment-blocked after policy rejection. | `npm run dev -- --host 127.0.0.1` failed with `listen EPERM`; escalated retry was rejected by the current environment, and no workaround was attempted. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 521 completed plans, no active plans, and next 10-plan progress report due at plan-530. |
| 2026-06-20 | repo_cartographer | Added Guide Quick Start Context Readout code, CSS, docs, and harness tokens as a UI-local read-only surface. |
| 2026-06-20 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify` passed. |
| 2026-06-20 | quality_runner | Dev server smoke remained blocked by sandbox policy: direct run failed with `listen EPERM`, escalated retry was rejected, and no workaround was used. |
| 2026-06-20 | review_judge | Reviewed Guide Quick Start context derivation, render path, docs, and QA guardrails; no blocking findings. |

## Completion Notes

Guide Quick Start now shows a UI-local Context Readout for Path, Session, and Workflow lanes derived from existing guide state. QA completed with all non-server validations passing. Dev server binding is environment-blocked and documented.
