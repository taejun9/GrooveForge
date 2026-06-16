# plan-172-groove-compass-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Groove Compass readouts into explicit local Focus controls so beginners can jump from drum density, anchors, hat motion, timing, chance, and selected-drum diagnostics into the Compose editing surface, while producers can quickly inspect and correct pocket posture without changing project data.

## Non-Goals

- Do not change drum event data, Drum Foundation Pads, Groove Feel Pads, Drum Accent Pads, selected drum state, Pattern A/B/C storage, project schema, save/load migration, arrangement, mixer/master, playback, render/export, Quick Actions, Composer Actions, or Handoff data.
- Do not auto-select drum hits, auto-write drums, auto-play audio, auto-save, auto-export, mutate project data from focusing, or hide existing controls.
- Do not replace Groove Compass, Key Compass, Composer Guide, Workflow Navigator, Pattern DNA, Review Queue, Finish Checklist, Mix Coach, or direct editing panels.
- Do not add sampling, imported audio, waveform analysis, remote AI, accounts, analytics, cloud sync, plugin hosting, or collaboration services.

## Context Map

- `src/ui/App.tsx`: Groove Compass summary types, GrooveCompass component, Compose panel ref, project status updates.
- `src/styles.css`: Groove Compass layout, focus controls, and focused-card visual state.
- `README.md`: Groove Compass product summary.
- `docs/product/product.md`: Groove Compass feature description.
- `docs/quality/rules.md`: Groove Compass focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-172-groove-compass-focus` and `.worktree/plan-172-groove-compass-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Groove Compass summary, card rendering, Compose refs, and QA expectations.
- [x] Add UI-local Groove Compass focus state and focus target metadata derived from existing density/anchor/hat/timing/chance/focus cards.
- [x] Render explicit Focus controls and focused-card styling without changing selected drum state, drum editing, playback, or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Groove Compass Focus controls render, focused card highlights, project status updates, Compose panel scroll target works, no drum mutation, no auto-play/export, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Groove Compass cards, UI-local state only, no drum/schema/export changes, no auto-writing or autoplay, no Groove Compass regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add explicit Groove Compass focus controls without changing drum data. | The app should teach beginners where rhythm diagnostics are edited while preserving fast producer navigation through the dense workstation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Groove Compass Focus. |
| 2026-06-17 | harness_builder | Added UI-local Groove Compass focus state, Compose-only focus targets, Focus buttons, focused-card styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Initial `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed. |
| 2026-06-17 | quality_runner | Full QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`; Browser smoke could not run because localhost dev server escalation was rejected by environment policy, so production build and static source/dist token checks were used instead. |

## Completion Notes

Groove Compass Focus is complete. Focus controls remain UI-local, derive from existing Groove Compass cards, route only to the existing Compose panel, and do not change selected drum state, Pattern A/B/C drum data, direct drum editing, playback, export, sampling, or remote scope.
