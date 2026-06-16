# plan-171-key-compass-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Key Compass readouts into explicit local Focus controls so beginners can jump from key, chord, 808/bass, and melody diagnostics into the relevant Compose editing surface, while producers can quickly inspect and correct harmonic posture without changing project data.

## Non-Goals

- Do not change key retargeting, scale definitions, chord/note generation, Pattern A/B/C musical events, project schema, save/load migration, arrangement, mixer/master, playback, render/export, Quick Actions, Composer Actions, or Handoff data.
- Do not auto-select notes/chords, auto-write harmony, auto-play audio, auto-save, auto-export, mutate project data from focusing, or hide existing controls.
- Do not replace Key Compass, Groove Compass, Composer Guide, Workflow Navigator, Pattern DNA, Review Queue, Finish Checklist, Mix Coach, or direct editing panels.
- Do not add sampling, imported audio, waveform analysis, remote AI, accounts, analytics, cloud sync, plugin hosting, or collaboration services.

## Context Map

- `src/ui/App.tsx`: Key Compass summary types, KeyCompass component, Compose panel ref, project status updates.
- `src/styles.css`: Key Compass layout, focus controls, and focused-card visual state.
- `README.md`: Key Compass product summary.
- `docs/product/product.md`: Key Compass feature description.
- `docs/quality/rules.md`: Key Compass focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-171-key-compass-focus` and `.worktree/plan-171-key-compass-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Key Compass summary, card rendering, Compose refs, and QA expectations.
- [x] Add UI-local Key Compass focus state and focus target metadata derived from existing key/chord/808/melody readouts.
- [x] Render explicit Focus controls and focused-card styling without changing key selection, note/chord editing, or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Key Compass Focus controls render, focused card highlights, project status updates, Compose panel scroll target works, no key/note/chord mutation, no auto-play/export, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Key Compass readouts, UI-local state only, no key/note/chord/schema/export changes, no auto-writing or autoplay, no Key Compass regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add explicit Key Compass focus controls without changing key or note/chord data. | The app should teach beginners where harmonic diagnostics are edited while preserving fast producer navigation through the dense workstation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Key Compass Focus. |
| 2026-06-17 | harness_builder | Added UI-local Key Compass focus state, Compose-only focus targets, Focus buttons, focused-card styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Initial `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed. |
| 2026-06-17 | quality_runner | Full QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`; Browser smoke could not run because localhost dev server escalation was rejected by environment policy, so production build and static source/dist token checks were used instead. |

## Completion Notes

Key Compass Focus is complete. Focus controls remain UI-local, derive from existing Key Compass cards, route only to the existing Compose panel, and do not change key retargeting, scale definitions, selected note/chord state, Pattern A/B/C musical data, playback, export, sampling, or remote scope.
