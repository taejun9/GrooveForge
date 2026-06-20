# plan-556-song-form-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Song Form Priority Readout so the current highest-priority song-form metric can open the most relevant existing arrangement block through the existing selected-block navigation path.

## Non-Goals

- Do not change arrangement block data, Pattern A/B/C event data, playback scheduling, export, project schema, snapshots, or undo semantics.
- Do not auto-select, auto-cue, auto-arrange, apply templates, run Pattern Chain, or start playback.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, analytics, or tutorial overlays.
- Do not persist Song Form Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Song Form Overview, Priority Readout labels, segment buttons, and selected-block navigation.
- `src/ui/workstationUiModel.ts` owns Song Form Priority types.
- `src/styles.css` owns Song Form layout.
- `README.md` and `docs/product/product.md` describe the arrangement surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Song Form guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through existing selected-block navigation.

## Implementation Plan

- [x] Add a target block label and index to the Song Form Priority summary.
- [x] Add a visible action button to the Song Form Priority Readout.
- [x] Route the button through `onSelectBlock` only.
- [x] Disable the button when no arrangement block target exists.
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
| 2026-06-20 | focused Song Form text/token checks | Passed; no old Song Form read-only Priority phrase remained, and new explicit-action/readout/button tokens were present. |
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
| 2026-06-20 | review_judge | No findings. The visible Song Form Priority action opens an existing arrangement block through selected-block navigation, keeps priority/action state UI-local, and does not change arrangement data, Pattern data, playback scheduling, export, schema, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Song Form Priority action. | Beginners need the highest-priority song-form metric to lead to the relevant arrangement block, while producers can still use direct timeline segment navigation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 555 completed plans, no active plans, and the next regular progress report is due at plan-560 completion. |
| 2026-06-20 | harness_builder | Added Song Form Priority target derivation, the visible priority action UI, compact button styling, and harness expectations for the new test ids and labels. |
| 2026-06-20 | quality_runner | Completed static QA, typecheck, quality gate, build, repo QA, verify, and dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the scoped diff after QA; no follow-up fixes required. |
