# plan-565-handoff-export-format-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is useful for working producers and approachable for first-time composers.

## Goal

Add an explicit action button to the Handoff Export Format Priority Readout so the current highest-priority deliverable-format metric can focus through the existing Handoff Export Format metric-focus path.

## Non-Goals

- Do not change Handoff Export Format scoring, metric order, focus result derivation, export behavior, playback scheduling, project schema, snapshots, or undo semantics.
- Do not trigger WAV, stem, MIDI, Handoff Sheet, package, ZIP, archive, native folder, or batch exports.
- Do not add configurable render settings, dither, normalization, platform compliance, publishing, licensing, or mastering claims.
- Do not add sampling, imported audio, remote AI, cloud sync, accounts, or analytics.
- Do not persist Handoff Export Format Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Handoff Pack rendering, Handoff Export Format Priority Readout labels, metric focus controls, and Focus Result feedback.
- `src/styles.css` owns Handoff Export Format layout.
- `README.md` and `docs/product/product.md` describe the Handoff Export Format surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Handoff Export Format guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Handoff Export Format metric-focus path.

## Implementation Plan

- [x] Add a visible action label to the Handoff Export Format Priority summary.
- [x] Add a button to the Handoff Export Format Priority Readout.
- [x] Route the button through `onFocusExportFormat(metric)` only.
- [x] Disable the button when no priority metric exists.
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
| 2026-06-20 | review_judge | No findings. The visible Handoff Export Format Priority action focuses the existing highest-priority deliverable-format metric through the established metric-focus path, keeps priority/action state UI-local, and does not change metric scoring, ordering, export/render behavior, file contents, filenames, project data, playback scheduling, schema, undo history, batch/ZIP behavior, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Handoff Export Format Priority action. | Beginners need the current deliverable-format issue to lead directly to the relevant Handoff Pack metric before exporting, while producers can still use direct metric Focus and explicit export buttons separately. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 564 completed plans, no active plans, and the next regular progress report is due at plan-570 completion. |
| 2026-06-20 | harness_builder | Added Handoff Export Format Priority action labeling, visible priority button routing through metric focus, compact button styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed the full QA set plus dev-server HTTP smoke; browser preview tooling was unavailable. |
| 2026-06-20 | review_judge | Reviewed the implementation after QA and found no issues. |
