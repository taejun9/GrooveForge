# plan-561-finish-checklist-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Finish Checklist Priority Readout so the current highest-priority finish card can focus through the existing Finish Checklist card-focus path.

## Non-Goals

- Do not change Finish Checklist card scoring, card order, playback scheduling, export, project schema, snapshots, or undo semantics.
- Do not auto-fix finish cards, auto-master, start playback, trigger export, auto-arrange, auto-mix, or create command chains.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, analytics, mastering claims, or tutorial overlays.
- Do not persist Finish Checklist Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Finish Checklist rendering, Priority Readout labels, card focus, and Focus Result feedback.
- `src/styles.css` owns Finish Checklist layout.
- `README.md` and `docs/product/product.md` describe the Finish Checklist surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Finish Checklist guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Finish Checklist card-focus path.

## Implementation Plan

- [x] Add a visible action label to the Finish Checklist Priority summary.
- [x] Add a button to the Finish Checklist Priority Readout.
- [x] Route the button through `onFocus(card)` only.
- [x] Disable the button when no priority finish card exists.
- [x] Update layout and stable QA tokens for the added button.
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

## Review Plan

QA completes before review starts.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-20 | `git diff --check` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Failed once on a stale read-only text expectation, then passed after updating the expectation to the explicit-action rule. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with the existing Vite chunk-size warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed; runtime smoke covered 14/14 sample-free blueprints and 14/14 style profiles. |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox attempt failed with `listen EPERM`; approved retry started Vite at `http://127.0.0.1:5173/`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox attempt could not connect to the approved dev server; approved retry returned `HTTP/1.1 200 OK`. |
| 2026-06-20 | Browser preview | Not run; browser control tooling was not exposed in this session. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Finish Checklist Priority action focuses the existing highest-priority finish card through the established card-focus path, keeps priority/action state UI-local, and does not change card scoring, project data, export, playback scheduling, schema, undo history, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Finish Checklist Priority action. | Beginners need the current finish blocker to lead directly to the right readiness lane, while producers can still choose direct Focus controls before export. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 560 completed plans, no active plans, and the next regular progress report is due at plan-570 completion. |
| 2026-06-20 | harness_builder | Added Finish Checklist Priority action labeling, visible priority button routing through card focus, compact button styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed static QA, typecheck, quality gate, build, repo QA, verify, and dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the scoped diff after QA; no follow-up fixes required. |
