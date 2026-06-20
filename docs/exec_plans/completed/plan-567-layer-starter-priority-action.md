# plan-567-layer-starter-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Layer Starter Priority Readout so the current highest-priority missing or thin selected-Pattern layer can start through the existing Layer Starter apply path.

## Non-Goals

- Do not change Layer Starter priority scoring, option order, result derivation, project schema, playback, export behavior, snapshots, or undo semantics.
- Do not add new layer-generation algorithms, hidden generation, sampler devices, imported audio, audio clips, or sample-based starts.
- Do not trigger more than one layer starter from a single visible priority action click.
- Do not add remote AI, cloud sync, accounts, analytics, onboarding overlays, autoplay, auto-arrangement, auto-export, or command chains.
- Do not persist Layer Starter Priority state in project data or undo history.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Layer Starter rendering, Priority Readout labels, and visible layer starter pads.
- `src/ui/workstationUiModel.ts` owns Layer Starter option and priority summary types plus priority option selection.
- `src/styles.css` owns Layer Starter layout and compact controls.
- `src/ui/App.tsx` owns the existing undoable `applyLayerStarter` handler and Quick Actions command wiring.
- `README.md` and `docs/product/product.md` describe Layer Starter behavior.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Layer Starter guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, mix/master, and export; sampling stays secondary and out of this plan.
- Route the visible priority action only through the existing Layer Starter apply path.

## Implementation Plan

- [x] Add a visible action label to the Layer Starter Priority summary.
- [x] Add a button to the Layer Starter Priority Readout.
- [x] Route the button through `onApply(option.id)` only.
- [x] Disable the button when no missing or thin layer exists.
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
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox curl could not reach the approved server; approved curl returned `HTTP/1.1 200 OK`. Browser control tooling was unavailable in this session. Dev server was stopped. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Layer Starter Priority action runs exactly one highest-priority missing or thin selected-Pattern layer through the existing Layer Starter apply path, keeps priority/action state UI-local, and does not change priority scoring, option order, result derivation, project schema, playback, export behavior, snapshots, undo history, hidden generation, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Layer Starter Priority action. | Beginners need the next missing or thin core layer to start directly from the readout, while producers can still use direct Drums/808/Chords/Synth pads and Quick Actions separately. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 566 completed plans, no active plans, and the next regular progress report is due at plan-570 completion. |
| 2026-06-20 | harness_builder | Added Layer Starter Priority action labeling, visible priority button routing through the existing layer starter apply path, compact button styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed the full QA set plus dev-server HTTP smoke; browser preview tooling was unavailable. |
| 2026-06-20 | review_judge | Reviewed the implementation after QA and found no issues. |
