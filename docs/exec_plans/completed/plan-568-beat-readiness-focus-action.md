# plan-568-beat-readiness-focus-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation where direct beat composition is primary and sampling remains a secondary add-on. Report progress every 10 completed plans.

## Goal

Add an explicit action button to the Beat Readiness Focus Readout so the highest-priority drums, 808/bass, harmony, arrangement, or export readiness issue can jump through the existing Beat Readiness focus path from the readout itself.

## Non-Goals

- Do not change Beat Readiness scoring, readiness thresholds, check order, focus result derivation, project schema, playback, export behavior, snapshots, or undo semantics.
- Do not add sample browsing, chopping, sampler setup, imported audio, audio clips, or sampling-first onboarding.
- Do not trigger more than one Beat Readiness focus action from a single visible readout click.
- Do not add remote AI, cloud sync, accounts, analytics, payments, onboarding overlays, autoplay, auto-arrangement, auto-export, or command chains.
- Do not persist Beat Readiness Focus Readout action state in project data or undo history.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Beat Readiness rendering and the Focus Readout summary.
- `src/ui/workstationUiModel.ts` owns Beat Readiness check and focus summary/result types.
- `src/ui/App.tsx` owns the existing `focusBeatReadinessCheck` handler and panel refs.
- `src/styles.css` owns Beat Readiness readout layout and focus controls.
- `README.md` and `docs/product/product.md` describe Beat Readiness behavior.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, mix/master, and export; sampling stays secondary and out of this plan.
- Route the visible readout action only through the existing Beat Readiness focus path.
- Provide the next regular progress report at `plan-570` completion, then every 10 completed plans.

## Implementation Plan

- [x] Add a visible action label to the Beat Readiness Focus summary.
- [x] Add a button to the Beat Readiness Focus Readout.
- [x] Route the button through `onFocus(check)` only.
- [x] Disable the button when no readiness check exists.
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
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Failed once on stale README/product/quality expected text; updated harness expectations for the new visible Beat Readiness Focus Readout action, then passed. |
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
| 2026-06-20 | review_judge | No findings. The visible Beat Readiness Focus Readout action resolves the current summary check, disables when no check exists, and routes exactly one click through the existing `onFocus(check)` path without changing readiness scoring, project data, undo history, playback, exports, hidden generation, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Beat Readiness Focus Readout action. | Beginners need the current direct-composition blocker to become a single visible next step, while producers can still scan readiness and jump straight to Compose, Arrange, Master, or Deliver. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 567 completed plans, no active plans, and the next regular progress report is due at plan-570 completion. |
| 2026-06-20 | harness_builder | Added Beat Readiness Focus Readout action labeling, a visible readout action button, focused-check routing through the existing focus handler, compact button styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed the full QA set plus dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the implementation after QA and found no issues. |
