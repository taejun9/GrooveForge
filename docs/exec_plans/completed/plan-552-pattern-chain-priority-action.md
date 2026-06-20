# plan-552-pattern-chain-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Pattern Chain Priority Readout so the currently recommended chain or expand move can be run directly from the arrangement panel through the existing Pattern Chain apply/expand handlers and local Result feedback.

## Non-Goals

- Do not change Pattern Chain preset definitions, expand arrangement generation, Pattern A/B/C event data, playback scheduling, export, project schema, or undo semantics.
- Do not auto-run the priority recommendation.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, analytics, or tutorial overlays.
- Do not persist Pattern Chain Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Pattern Chain preview, priority readout, apply/expand handlers, Quick Actions, and Result feedback.
- `src/styles.css` owns Pattern Chain row and priority readout layout.
- `README.md` and `docs/product/product.md` describe the arrangement surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Pattern Chain guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Pattern Chain apply or expand handlers.

## Implementation Plan

- [x] Add a visible action button to the Pattern Chain Priority Readout.
- [x] Route chain recommendations through `applyPatternChain` and expand recommendations through `expandPatternChain`.
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
| 2026-06-20 | review_judge | No findings. The visible Pattern Chain Priority action routes through only the existing Pattern Chain apply or Chain Expand handlers, disables when the preview is aligned, preserves local Pattern Chain Result feedback, and does not touch Pattern A/B/C event data, project schema, playback, export, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Pattern Chain Priority action. | Beginners need a recommended structure move that is directly actionable from the readout, while producers can still use direct chain presets, expand, or Quick Actions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 551 completed plans, no active plans, and the next regular progress report is due at plan-560 completion. |
| 2026-06-20 | harness_builder | Added the visible Pattern Chain Priority action button, existing apply/expand routing, responsive button styling, docs updates, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed the documented QA commands; Browser tooling was unavailable, so dev-server verification used local HTTP response checks. |
