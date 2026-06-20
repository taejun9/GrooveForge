# plan-564-handoff-package-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Handoff Package Check Priority Readout so the current highest-priority send-package lane can focus through the existing Handoff Package Check card-focus path.

## Non-Goals

- Do not change Handoff Package Check scoring, card order, focus result derivation, export behavior, playback scheduling, project schema, snapshots, or undo semantics.
- Do not trigger WAV, stem, MIDI, Handoff Sheet, package, ZIP, archive, native folder, or batch exports.
- Do not auto-fix file-set, export-order, receipt, or session-context issues.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, analytics, publishing, licensing, or platform compliance claims.
- Do not persist Handoff Package Check Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Handoff Pack rendering, Handoff Package Check Priority Readout labels, card focus controls, and Focus Result feedback.
- `src/styles.css` owns Handoff Package Check layout.
- `README.md` and `docs/product/product.md` describe the Handoff Package Check surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Handoff Package Check guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Handoff Package Check card-focus path.

## Implementation Plan

- [x] Add a visible action label to the Handoff Package Check Priority summary.
- [x] Add a button to the Handoff Package Check Priority Readout.
- [x] Route the button through `onFocusPackageCheck(card)` only.
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
| 2026-06-20 | review_judge | No findings. The visible Handoff Package Check Priority action focuses the existing highest-priority send-package lane through the established card-focus path, keeps priority/action state UI-local, and does not change card scoring, ordering, export/render behavior, project data, playback scheduling, schema, undo history, ZIP/archive behavior, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Handoff Package Check Priority action. | Beginners need the current send-package issue to lead directly to Deliver before sending files, while producers can still use direct card Focus and explicit export buttons separately. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 563 completed plans, no active plans, and the next regular progress report is due at plan-570 completion. |
| 2026-06-20 | harness_builder | Added Handoff Package Check Priority action labeling, visible priority button routing through card focus, compact button styling, mobile layout guardrails, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed diff, harness, typecheck, quality gate, build, QA, verify, and dev server HTTP smoke checks. |
| 2026-06-20 | review_judge | Reviewed implementation, docs, guardrails, and harness changes with no findings. |
