# plan-169-pattern-dna-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Pattern DNA cards into explicit local Focus controls so beginners can click Layers, Density, Variation, or Arrangement use and jump to the right workstation area, while producers can scan a Pattern A/B/C issue and move directly to the relevant editing surface.

## Non-Goals

- Do not change Pattern DNA scoring, Pattern Compare, Groove Compass, Composer Guide, Beat Map, Next Move, Review Queue, Finish Checklist, Mix Coach, export analysis, stem analysis, audio scheduling, render/export output, project schema, save/load migration, Pattern A/B/C event data, arrangement data, mixer/master values, snapshots, or Handoff data.
- Do not auto-apply pattern edits, auto-play audio, auto-save, auto-export, mutate project data, or hide existing controls.
- Do not replace Pattern DNA, Pattern Compare, Composer Actions, Workflow Navigator, Beat Map, Next Move, Review Queue, Finish Checklist, Mix Coach, or direct editing panels.
- Do not add sampling, imported audio, waveform analysis, remote AI, accounts, analytics, cloud sync, plugin hosting, or collaboration services.

## Context Map

- `src/ui/App.tsx`: Pattern DNA summary/card types, PatternDna component, workflow refs, project status updates.
- `src/styles.css`: Pattern DNA card layout, focus controls, and focused-card visual state.
- `README.md`: Pattern DNA product summary.
- `docs/product/product.md`: Pattern DNA feature description.
- `docs/quality/rules.md`: Pattern DNA focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-169-pattern-dna-focus` and `.worktree/plan-169-pattern-dna-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Pattern DNA derivation, rendering, and workflow navigation refs.
- [x] Add UI-local Pattern DNA focus state and focus target metadata derived from existing card ids.
- [x] Render explicit Focus controls and focused-card styling without changing Pattern DNA derivation or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, record browser-smoke blocker, complete review, and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Local browser smoke for Pattern DNA Focus controls, focused card highlight, project status update, Compose/Arrange panel scroll targets, no Pattern DNA data mutation, no auto-edit/autoplay/export, unchanged Pattern Compare and Workflow Navigator controls, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Pattern DNA card ids, UI-local state only, no Pattern DNA scoring/render/export/schema changes, no auto-edit or autoplay, no Pattern DNA regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add explicit Pattern DNA focus controls without changing Pattern DNA derivation. | Pattern DNA already explains the loop; direct navigation makes correction faster for producers and clearer for beginners. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Pattern DNA Focus. |
| 2026-06-17 | harness_builder | Added UI-local Pattern DNA focus state, focus targets derived from existing DNA card ids, Focus buttons/readout, focused-card styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Initial `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed. |
| 2026-06-17 | quality_runner | Full QA passed: `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. Browser smoke could not run because localhost dev server escalation was rejected and Browser policy blocked `file://` build loading; production build and static source/dist token checks passed instead. |
| 2026-06-17 | review_judge | Review found no blocking code issues. Pattern DNA Focus state is UI-local, targets derive from existing DNA card ids, and clicks route only to Compose or Arrange panels without mutating project data. |

## Completion Notes

Completed Pattern DNA Focus for Layers, Density, Variation, and Arrangement DNA cards. Focus controls show a UI-local readout, highlight the focused card, and scroll to existing Compose or Arrange panels while preserving Pattern DNA derivation, Pattern A/B/C event data, arrangement data, playback, export, and sampling boundaries. Browser smoke was blocked by environment policy; automated QA and production build validation passed.
