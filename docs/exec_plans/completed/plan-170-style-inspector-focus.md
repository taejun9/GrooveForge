# plan-170-style-inspector-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Style Inspector metrics and Pattern A/B/C density rows into explicit local Focus controls so beginners can understand what BPM, swing, sound, and density affect, while producers can jump directly from style diagnostics into the relevant workstation editing surface.

## Non-Goals

- Do not change style profile definitions, style application, Style Quick Pick behavior, Pattern A/B/C generated event data, key retargeting, audio scheduling, render/export output, project schema, save/load migration, arrangement data, mixer/master values, snapshots, or Handoff data.
- Do not auto-apply styles, auto-generate patterns, auto-play audio, auto-save, auto-export, mutate project data from focusing, or hide existing controls.
- Do not replace Style Inspector, Style Quick Picks, Workflow Navigator, Composer Guide, Pattern DNA, Pattern Compare, Beat Map, Next Move, Review Queue, Finish Checklist, Mix Coach, or direct editing panels.
- Do not add sampling, imported audio, waveform analysis, remote AI, accounts, analytics, cloud sync, plugin hosting, or collaboration services.

## Context Map

- `src/ui/App.tsx`: Style Inspector summary types, StyleInspector component, workflow refs, project status updates.
- `src/styles.css`: Style Inspector layout, focus controls, and focused-card visual state.
- `README.md`: Style Inspector product summary.
- `docs/product/product.md`: Style Inspector feature description.
- `docs/quality/rules.md`: Style Inspector focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-170-style-inspector-focus` and `.worktree/plan-170-style-inspector-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Style Inspector summary, metric rendering, density rows, and workflow navigation refs.
- [x] Add UI-local Style Inspector focus state and focus target metadata derived from existing metric labels and Pattern A/B/C density rows.
- [x] Render explicit Focus controls and focused-card styling without changing style selection, Quick Picks, or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost or approved file loading: Style Inspector Focus controls render, focused metric/row highlights, project status updates, Compose/Sound panel scroll targets work, no style selection mutation, no auto-play/export, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Style Inspector metrics and Pattern A/B/C density rows, UI-local state only, no style-generation/schema/export changes, no auto-style or autoplay, no Style Inspector/Quick Pick regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add explicit Style Inspector focus controls without changing style application. | The app promises all-genre beat creation; style diagnostics should explain and route users into the relevant direct composition and sound editing panels. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Style Inspector Focus. |
| 2026-06-17 | harness_builder | Added UI-local Style Inspector focus state, focus targets for Transport/Compose/Sound, metric and density Focus buttons, focused-card styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Initial `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed. |
| 2026-06-17 | quality_runner | Full QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`; Browser smoke could not run because localhost dev server escalation was rejected by environment policy, so production build and static source checks were used instead. |

## Completion Notes

Style Inspector Focus is complete. Focus controls remain UI-local, derive from existing Style Inspector metrics and Pattern A/B/C density rows, route only to existing Transport, Compose, or Sound panels, and do not change style application, Quick Picks, project data, playback, export, sampling, or remote scope.
