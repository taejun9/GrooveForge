# plan-557-arrangement-mute-map-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Arrangement Mute Map Priority Readout so the current highest-priority mute lane can focus through the existing Arrangement Mute Map lane-focus path.

## Non-Goals

- Do not change arrangement block data, muted-track data, Pattern A/B/C event data, playback scheduling, export, project schema, snapshots, or undo semantics.
- Do not auto-mute, auto-unmute, auto-arrange, start playback, or create command chains.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, analytics, or tutorial overlays.
- Do not persist Arrangement Mute Map Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Arrangement Mute Map rendering, Priority Readout labels, lane focus, and Focus Result feedback.
- `src/ui/workstationUiModel.ts` owns Arrangement Mute Map Priority types.
- `src/styles.css` owns Arrangement Mute Map layout.
- `README.md` and `docs/product/product.md` describe the arrangement surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Arrangement Mute Map guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Arrangement Mute Map lane-focus path.

## Implementation Plan

- [x] Add a visible action label to the Arrangement Mute Map Priority summary.
- [x] Add a button to the Arrangement Mute Map Priority Readout.
- [x] Route the button through `onFocus(lane)` only.
- [x] Disable the button when no priority lane exists.
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

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-20 | `git diff --check` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed. |
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
| 2026-06-20 | review_judge | No findings. The visible Arrangement Mute Map Priority action focuses the existing highest-priority mute lane through the established lane-focus path, keeps priority/action state UI-local, and does not change arrangement mutes, Pattern data, playback scheduling, export, schema, undo history, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Arrangement Mute Map Priority action. | Beginners need the highest-priority mute lane to lead directly to the lane focus/result, while producers can still use direct lane buttons for section-space checks. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 556 completed plans, no active plans, and the next regular progress report is due at plan-560 completion. |
| 2026-06-20 | harness_builder | Added Arrangement Mute Map Priority action labeling, visible priority button routing through lane focus, compact button styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed static QA, typecheck, quality gate, build, repo QA, verify, and dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the scoped diff after QA; no follow-up fixes required. |
