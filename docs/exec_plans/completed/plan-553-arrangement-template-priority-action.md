# plan-553-arrangement-template-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Arrangement Template Priority Readout so the currently recommended arrangement template can be applied directly from the arrangement panel through the existing Arrangement Template apply handler and local Result feedback.

## Non-Goals

- Do not change Arrangement Template definitions, arrangement generation, Pattern A/B/C event data, playback scheduling, export, project schema, or undo semantics.
- Do not auto-run the priority recommendation.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, analytics, or tutorial overlays.
- Do not persist Arrangement Template Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Arrangement Template preview, priority readout, apply handler, and Result feedback.
- `src/styles.css` owns Arrangement Template priority readout layout.
- `README.md` and `docs/product/product.md` describe the arrangement surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Arrangement Template guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Arrangement Template apply handler.

## Implementation Plan

- [x] Add a visible action button to the Arrangement Template Priority Readout.
- [x] Route template recommendations through `applyArrangementTemplate`.
- [x] Disable the button when the priority is already aligned.
- [x] Update responsive styling and stable QA tokens.
- [x] Update README, product docs, quality rules, and QA expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt and Browser preview if tooling is available.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-20 | `git diff --check` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with the existing Vite large chunk warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 supported style profiles. |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox run failed with `listen EPERM`; escalated run started Vite at `http://127.0.0.1:5173/`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox curl could not reach the escalated server; escalated curl returned `HTTP/1.1 200 OK`. Browser control tooling was unavailable in this session. Dev server was stopped. |

## Review Plan

QA completes before review starts.

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Arrangement Template Priority action routes only through the existing Arrangement Template apply handler, disables when the preview is aligned, preserves local Arrangement Template Result feedback, and does not touch Pattern A/B/C event data, project schema, playback, export, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Arrangement Template Priority action. | Beginners need the recommended song structure template to be directly actionable from the readout, while producers can still use direct template buttons and Quick Actions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 552 completed plans, no active plans, and the next regular progress report is due at plan-560 completion. |
| 2026-06-20 | harness_builder | Added the visible Arrangement Template Priority action button, existing apply routing, responsive button styling, docs updates, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed the documented QA commands; Browser tooling was unavailable, so dev-server verification used local HTTP response checks. |
