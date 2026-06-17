# plan-219-session-pass

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working composers/producers while remaining easy for beginners.

## Goal

Add a UI-local Session Pass surface that combines existing beginner workflow, producer review, finish checklist, and export preflight signals into one focused pass so users can jump to the next relevant workstation panel without changing project data.

## Non-Goals

- Do not add cloud sync, accounts, analytics, payment, remote AI, sampling, imported audio, plugin hosting, or new file formats.
- Do not change project schema, save/load migration, render/export contents, playback scheduling, undo/redo semantics, or existing scoring algorithms.
- Do not add onboarding overlays, modal tutorials, automatic command chains, auto-fixes, autoplay, autosave, or auto-export.

## Context Map

- `src/ui/App.tsx` owns existing local summaries: First Beat Path, Review Queue, Finish Checklist, Export Preflight, Workflow Navigator, Mode Focus, and panel focus handlers.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md` describe durable product behavior and quality boundaries.
- `harness/scripts/run_qa.py` enforces docs/code expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Define a `SessionPassSummary` from existing local summaries only.
- [x] Add a compact Session Pass UI with beginner and studio pass cards plus Focus buttons.
- [x] Route Focus buttons only to existing Transport, Compose, Arrange, Mix, Master, or Deliver panels.
- [x] Keep Session Pass state UI-local and out of project data, undo history, render/export, and playback.
- [x] Update README, product docs, quality rules, and QA harness expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser/Electron smoke only if the environment allows launching a local UI target without policy blockers.

## Review Plan

QA completes before review starts. Review should verify that Session Pass derives only from existing summaries, routes focus without mutation, and improves beginner/pro workflow without adding sampling, remote AI, hidden generation, or automation.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add Session Pass as a UI-local navigation surface. | The app already has strong individual diagnostics; users need a concise pass that turns those signals into the next panel to inspect. |
| 2026-06-17 | Derive Session Pass from existing summaries only. | Reusing First Beat Path, Review Queue, Finish Checklist, and Export Preflight avoids new scoring semantics and keeps the surface informational. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created in `codex/plan-219-session-pass`. |
| 2026-06-17 | harness_builder | Added `SessionPassSummary`, the Session Pass component, focus routing, and responsive styling. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality rules, and QA harness expectations for Session Pass. |
| 2026-06-17 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, and `npm run verify`. |

## Completion Notes

Session Pass now combines existing First Beat Path, Review Queue, Finish Checklist, Export Preflight, and project mode state into Guided, Studio, Finish, and Delivery focus cards. Focus buttons only scroll to existing Transport, Compose, Arrange, Mix, Master, or Deliver panels and update the UI status readout. It does not change project schema, save/load, undo/redo, playback, render/export, scoring, sampling boundaries, or automation behavior. Browser smoke was not run because local dev server port binding was blocked by the current environment policy; production build and static validation passed.
