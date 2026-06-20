# plan-562-review-queue-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Review Queue Priority Readout so the current highest-priority production issue can focus through the existing Review Queue item-focus path.

## Non-Goals

- Do not change Review Queue issue scoring, sorting, item count, fix behavior, playback scheduling, export, project schema, snapshots, or undo semantics.
- Do not auto-fix Review Queue items, apply generation, start playback, trigger export, auto-arrange, auto-mix, or create command chains.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, analytics, mastering claims, or tutorial overlays.
- Do not persist Review Queue Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Review Queue rendering, Priority Readout labels, item focus/fix controls, and Focus Result feedback.
- `src/styles.css` owns Review Queue layout.
- `README.md` and `docs/product/product.md` describe the Review Queue surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Review Queue guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Review Queue item-focus path.

## Implementation Plan

- [x] Add a visible action label to the Review Queue Priority summary.
- [x] Add a button to the Review Queue Priority Readout.
- [x] Route the button through `onFocus(item)` only.
- [x] Disable the button when no priority issue exists.
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
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Failed once on the stale read-only Review Queue expectation, then passed after updating the guardrail to the explicit visible Priority action rule. |
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
| 2026-06-20 | review_judge | No findings. The visible Review Queue Priority action focuses the existing highest-priority production issue through the established item-focus path, keeps priority/action state UI-local, and does not change issue scoring, ordering, fix behavior, project data, export, playback scheduling, schema, undo history, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Review Queue Priority action. | Beginners need the current production issue to lead directly to the right inspection lane, while producers can still choose direct Focus or explicit one-step Fix controls. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 561 completed plans, no active plans, and the next regular progress report is due at plan-570 completion. |
| 2026-06-20 | harness_builder | Added Review Queue Priority action labeling, visible priority button routing through item focus, compact button styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed diff, harness, typecheck, quality gate, build, QA, verify, and dev server HTTP smoke checks. |
| 2026-06-20 | review_judge | Reviewed implementation, docs, guardrails, and harness changes with no findings. |
