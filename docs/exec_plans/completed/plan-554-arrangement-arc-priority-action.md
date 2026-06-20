# plan-554-arrangement-arc-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Arrangement Arc Priority Readout so the currently recommended full-song energy arc can be applied directly from the arrangement panel through the existing Arrangement Arc apply handler and local Result feedback.

## Non-Goals

- Do not change Arrangement Arc pad definitions, arrangement arc transforms, Pattern A/B/C event data, playback scheduling, export, project schema, or undo semantics.
- Do not auto-run the priority recommendation.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, analytics, or tutorial overlays.
- Do not persist Arrangement Arc Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Arrangement Arc preview, priority readout, apply handler, and Result feedback.
- `src/styles.css` owns Arrangement Arc priority readout layout.
- `README.md` and `docs/product/product.md` describe the arrangement surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Arrangement Arc guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Arrangement Arc apply handler.

## Implementation Plan

- [x] Add a visible action button to the Arrangement Arc Priority Readout.
- [x] Route arc recommendations through `applyArrangementArcPad`.
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
| 2026-06-20 | focused Arrangement Arc text/token checks | Passed; no old Arrangement Arc read-only Priority phrase remained, and new explicit-action/readout/button tokens were present. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with the existing Vite chunk-size warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed; runtime smoke covered 14/14 sample-free blueprints and 14/14 style profiles. |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox attempt failed with `listen EPERM`; approved retry started Vite at `http://127.0.0.1:5173/`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox attempt could not connect to the approved dev server; approved retry returned `HTTP/1.1 200 OK`. |
| 2026-06-20 | Browser preview | Not run; browser control tooling was not exposed in this session. |

## Review Plan

QA completes before review starts.

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Arrangement Arc Priority action routes through the existing apply handler, disables when aligned, keeps state UI-local, and does not change sampling, schema, playback, export, or Arrangement Arc definitions. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Arrangement Arc Priority action. | Beginners need the recommended full-song energy move to be directly actionable from the readout, while producers can still use direct arc pads and Quick Actions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 553 completed plans, no active plans, and the next regular progress report is due at plan-560 completion. |
| 2026-06-20 | harness_builder | Added the Arrangement Arc Priority action UI, responsive button styling, and harness expectations for the new test ids and labels. |
| 2026-06-20 | quality_runner | Completed static QA, typecheck, quality gate, build, repo QA, verify, and dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the scoped diff after QA; no follow-up fixes required. |
