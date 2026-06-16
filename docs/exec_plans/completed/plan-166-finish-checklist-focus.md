# plan-166-finish-checklist-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Finish Checklist cards into explicit local focus controls, so beginners can click Compose, Arrange, Mix, Master, or Handoff readiness and jump to the right workstation area while producers can run a fast finish pass.

## Non-Goals

- Do not change Finish Checklist scoring, Beat Readiness checks, Structure Lens signals, Mix Coach scoring, deterministic export analysis, stem analysis, audio scheduling, render/export output, project schema, save/load migration, arrangement data, Pattern A/B/C event data, mixer/master values, snapshots, or Handoff data.
- Do not auto-apply fixes, auto-play audio, auto-export, auto-save, mutate project data, or hide existing controls.
- Do not replace Finish Checklist, Review Queue, Beat Map, Next Move, Workflow Navigator, Mix Coach, Mix Fix, Handoff Pack, or direct editing panels.
- Do not add sampling, imported audio, waveform analysis, remote AI, accounts, analytics, cloud sync, plugin hosting, or collaboration services.

## Context Map

- `src/ui/App.tsx`: Finish Checklist card type, summary creation, FinishChecklist component, workflow refs, project status updates.
- `src/styles.css`: Finish Checklist focus readout, focus button, and focused-card visual state.
- `README.md`: Finish Checklist product summary.
- `docs/product/product.md`: Finish Checklist feature description.
- `docs/quality/rules.md`: Finish Checklist focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-166-finish-checklist-focus` and `.worktree/plan-166-finish-checklist-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Finish Checklist derivation, rendering, and workflow navigation refs.
- [x] Add UI-local Finish Checklist focus state and focus target metadata derived from existing card ids.
- [x] Render explicit Focus controls and focused-card styling without changing checklist scoring or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Local browser smoke for Finish Checklist focus controls, focused card highlight, project status update, panel scroll targets, no checklist scoring mutation, no auto-fix/autoplay/export, and unchanged Review Queue/Mix Coach controls.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Finish Checklist card ids, UI-local state only, no score/render/export/schema changes, no auto-fix or autoplay, no Finish Checklist regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add explicit Finish Checklist focus controls without changing checklist scoring. | The finish cards already explain readiness; direct navigation makes the final pass faster for producers and clearer for beginners. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Finish Checklist Focus. |
| 2026-06-17 | harness_builder | Added UI-local Finish Checklist focus controls, readout, focused-card styling, docs, and QA expectations. Initial `run_qa` and `typecheck` pass. |
| 2026-06-17 | quality_runner | Full QA passed: `run_qa`, `npm run qa`, `typecheck`, quality gate, `npm run verify`, `git diff --check`, and browser smoke for Compose/Handoff Focus. |

## Completion Notes

- Finish Checklist cards now carry focus target metadata derived from existing card ids.
- The UI stores focused card state locally, shows a focus readout, highlights the selected card, scrolls to existing Compose/Arrange/Mix/Master/Deliver surfaces, and updates project status after explicit clicks.
- README, product docs, quality rules, and QA harness expectations describe and guard the feature.
- QA and browser smoke passed; Vite still reports the existing large client chunk warning during production build.
