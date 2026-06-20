# plan-563-export-preflight-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Export Preflight Priority Readout so the current highest-priority delivery-risk lane can focus through the existing Export Preflight card-focus path.

## Non-Goals

- Do not change Export Preflight scoring, card order, focus result derivation, export behavior, playback scheduling, project schema, snapshots, or undo semantics.
- Do not trigger WAV, stem, MIDI, Handoff Sheet, or package exports.
- Do not auto-fix readiness, mix, master automation, deliverable, or handoff issues.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, analytics, mastering claims, or tutorial overlays.
- Do not persist Export Preflight Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Export Preflight rendering, Priority Readout labels, card focus controls, and Focus Result feedback.
- `src/styles.css` owns Export Preflight layout.
- `README.md` and `docs/product/product.md` describe the Export Preflight surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Export Preflight guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Export Preflight card-focus path.

## Implementation Plan

- [x] Add a visible action label to the Export Preflight Priority summary.
- [x] Add a button to the Export Preflight Priority Readout.
- [x] Route the button through `onFocus(card)` only.
- [x] Disable the button when no priority card exists.
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
| 2026-06-20 | `npm run verify` | Passed; runtime smoke covered 14/14 sample-free blueprints and 14/14 style profiles before typecheck and build passed. |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandboxed run failed with `listen EPERM`; approved local dev server run started successfully. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandboxed request could not connect; approved request returned `HTTP/1.1 200 OK`. Browser preview tooling was not exposed in this session. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Export Preflight Priority action focuses the existing highest-priority delivery-risk lane through the established card-focus path, keeps priority/action state UI-local, and does not change card scoring, ordering, export/render behavior, project data, playback scheduling, schema, undo history, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Export Preflight Priority action. | Beginners need the top delivery-risk lane to lead directly to the right workstation panel before exporting, while producers can still use direct card Focus and explicit export controls separately. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 562 completed plans, no active plans, and the next regular progress report is due at plan-570 completion. |
| 2026-06-20 | harness_builder | Added Export Preflight Priority action labeling, visible priority button routing through card focus, compact button styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed diff, harness, typecheck, quality gate, build, QA, verify, and dev server HTTP smoke checks. |
| 2026-06-20 | review_judge | Reviewed implementation, docs, guardrails, and harness changes with no findings. |
