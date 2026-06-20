# plan-570-beat-passport-focus-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report progress every 10 completed plans.

## Goal

Add an explicit action button to the Beat Passport Focus Readout so the current target, length, Pattern A/B/C use, readiness, export, stems, or master identity metric can jump through the existing Beat Passport focus path from the readout itself.

## Non-Goals

- Do not change Beat Passport scoring, metric order, focus result derivation, project schema, playback, export behavior, snapshots, or undo semantics.
- Do not add sample browsing, chopping, sampler setup, imported audio, audio clips, reference-track import, audio analysis, or sampling-first onboarding.
- Do not trigger more than one Beat Passport focus action from a single visible readout click.
- Do not add remote AI, cloud sync, accounts, analytics, payments, onboarding overlays, autoplay, auto-arrangement, auto-export, or command chains.
- Do not persist Beat Passport Focus Readout action state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Beat Passport rendering, focus summary/result derivation, and the existing `focusBeatPassportMetric` handler.
- `src/ui/workstationUiModel.ts` owns Beat Passport summary and focus summary/result types.
- `src/styles.css` owns Beat Passport readout layout and focus controls.
- `README.md` and `docs/product/product.md` describe Beat Passport behavior.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, mix/master, and export; sampling stays secondary and out of this plan.
- Route the visible readout action only through the existing Beat Passport focus path.
- This is `plan-570`; include the requested 10-plan progress report after completion.

## Implementation Plan

- [x] Add a visible action label to the Beat Passport Focus summary.
- [x] Add a button to the Beat Passport Focus Readout.
- [x] Route the button through `onFocus(metric)` only.
- [x] Disable the button when no Beat Passport metric exists.
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
| 2026-06-20 | `npm run build` | Passed with the existing Vite large chunk warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 supported style profiles. |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox run failed with `listen EPERM`; approved run started Vite at `http://127.0.0.1:5173/`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox curl could not reach the approved server; approved curl returned `HTTP/1.1 200 OK`. Dev server was stopped. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed and creating the review mirror. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Beat Passport Focus Readout action resolves the current summary metric, disables when no metric exists, and routes exactly one click through the existing `onFocus(metric)` path without changing metric derivation, passport scoring, project data, undo history, playback, exports, hidden generation, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Beat Passport Focus Readout action. | Beginners need the current beat identity metric to become a visible next step, while producers can jump straight to target, form, readiness, export, stem, or master diagnostics from the readout. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 569 completed plans, no active plans, and that this completion should include the requested plan-570 progress report. |
| 2026-06-20 | harness_builder | Added Beat Passport Focus Readout action labeling, a visible readout action button, focused-metric routing through the existing focus handler, compact button styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed the full QA set plus dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the implementation after QA and found no issues. |
