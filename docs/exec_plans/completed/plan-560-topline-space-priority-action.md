# plan-560-topline-space-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Topline Space Priority Readout so the current highest-priority topline card can focus through the existing Topline Space card-focus path.

## Non-Goals

- Do not change arrangement block data, Pattern A/B/C event data, playback scheduling, export, project schema, snapshots, or undo semantics.
- Do not auto-write toplines, auto-fix cards, cue playback, start playback, auto-arrange, auto-mix, or create command chains.
- Do not add vocal recording, reference-track upload, audio analysis, stem separation, lyric generation, sampling, imported audio, remote AI, cloud sync, accounts, analytics, or tutorial overlays.
- Do not persist Topline Space Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Topline Space rendering, Priority Readout labels, card focus, cue/fix buttons, and Focus Result feedback.
- `src/ui/workstationUiModel.ts` owns Topline Space Priority types.
- `src/styles.css` owns Topline Space layout.
- `README.md` and `docs/product/product.md` describe the Topline Space surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Topline Space guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Topline Space card-focus path.

## Implementation Plan

- [x] Add a visible action label to the Topline Space Priority summary.
- [x] Add a button to the Topline Space Priority Readout.
- [x] Route the button through `onFocus(card)` only.
- [x] Disable the button when no priority topline card exists.
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
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed. |
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
| 2026-06-20 | review_judge | No findings. The visible Topline Space Priority action focuses the existing highest-priority topline card through the established card-focus path, keeps priority/action state UI-local, and does not change arrangement blocks, Pattern data, Topline Loop cue state, Topline Fix behavior, playback scheduling, export, schema, undo history, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Topline Space Priority action. | Beginners need the current topline-space issue to lead directly to the right focus lane, while producers can still choose direct Focus, Cue, and Fix controls for vocal pocket decisions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 559 completed plans, no active plans, and this plan will trigger the next 10-plan progress report at completion. |
| 2026-06-20 | harness_builder | Added Topline Space Priority action labeling, visible priority button routing through card focus, compact button styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed static QA, typecheck, quality gate, build, repo QA, verify, and dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the scoped diff after QA; no follow-up fixes required. |
