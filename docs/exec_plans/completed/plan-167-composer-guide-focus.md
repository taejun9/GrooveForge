# plan-167-composer-guide-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Composer Guide cards into explicit local focus controls, so beginners can click Drums, 808, Harmony, Melody, Arrange, or Finish guidance and jump to the right workstation area while producers can scan and move through composition gaps quickly.

## Non-Goals

- Do not change Composer Guide scoring, Composer Actions, Beat Readiness, Next Move, Beat Map, Review Queue, Finish Checklist, Mix Coach, export analysis, stem analysis, audio scheduling, render/export output, project schema, save/load migration, Pattern A/B/C event data, arrangement data, mixer/master values, snapshots, or Handoff data.
- Do not auto-apply writing moves, auto-play audio, auto-save, auto-export, mutate project data, or hide existing controls.
- Do not replace Composer Guide, Composer Actions, Workflow Navigator, Beat Map, Next Move, Review Queue, Finish Checklist, Mix Coach, or direct editing panels.
- Do not add sampling, imported audio, waveform analysis, remote AI, accounts, analytics, cloud sync, plugin hosting, or collaboration services.

## Context Map

- `src/ui/App.tsx`: Composer Guide card type, summary creation, ComposerGuide component, workflow refs, project status updates.
- `src/styles.css`: Composer Guide focus readout, focus button, and focused-card visual state.
- `README.md`: Composer Guide product summary.
- `docs/product/product.md`: Composer Guide feature description.
- `docs/quality/rules.md`: Composer Guide focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-167-composer-guide-focus` and `.worktree/plan-167-composer-guide-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Composer Guide derivation, rendering, and workflow navigation refs.
- [x] Add UI-local Composer Guide focus state and focus target metadata derived from existing card ids.
- [x] Render explicit Focus controls and focused-card styling without changing guide scoring or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Local browser smoke for Composer Guide focus controls, focused card highlight, project status update, panel scroll targets, no guide scoring mutation, no auto-write/autoplay/export, and unchanged Composer Actions/Workflow Navigator controls.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Composer Guide card ids, UI-local state only, no score/render/export/schema changes, no auto-write or autoplay, no Composer Guide regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add explicit Composer Guide focus controls without changing guide scoring. | The guide already identifies writing posture; direct navigation makes the composition pass faster for producers and clearer for beginners. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Composer Guide Focus. |
| 2026-06-17 | harness_builder | Added UI-local Composer Guide focus controls, readout, focused-card styling, docs, and QA expectations. Initial `run_qa` and `typecheck` pass. |
| 2026-06-17 | quality_runner | Full QA passed: `run_qa`, `npm run qa`, `typecheck`, quality gate, `npm run verify`, `git diff --check`, and browser smoke for Drums/Finish Focus. |

## Completion Notes

- Composer Guide cards now carry focus target metadata derived from existing card ids.
- The UI stores focused guide card state locally, shows a focus readout, highlights the selected card, scrolls to existing Compose, Arrange, or Master surfaces, and updates project status after explicit clicks.
- The Master section now has a stable `workflow-target-master` test id for focus verification.
- README, product docs, quality rules, and QA harness expectations describe and guard the feature.
- QA and browser smoke passed; Vite still reports the existing large client chunk warning during production build.
