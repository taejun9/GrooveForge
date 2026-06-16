# plan-174-beat-passport-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Beat Passport metrics into explicit local Focus controls so beginners can jump from target, length, Pattern A/B/C, readiness, export, stems, and master posture into the relevant workstation surface, while producers can quickly move from the compact beat identity scan to Compose, Arrange, Master, or Deliver work.

## Non-Goals

- Do not change Beat Passport scoring, Production Snapshot, Finish Checklist, Review Queue, Beat Map, Next Move, Delivery Target, arrangement, mixer/master, project schema, save/load migration, playback, render/export, or Handoff data.
- Do not auto-apply targets, auto-arrange, auto-master, auto-export, auto-save, mutate project data from focusing, or hide existing controls.
- Do not replace Beat Passport, Workflow Navigator, Production Snapshot, Handoff Pack, or direct editing panels.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, plugin hosting, collaboration services, platform compliance, or professional mastering claims.

## Context Map

- `src/ui/App.tsx`: Beat Passport summary types, BeatPassport component, workflow refs, project status updates.
- `src/styles.css`: Beat Passport layout, focus controls, and focused-card visual state.
- `README.md`: Beat Passport product summary.
- `docs/product/product.md`: Beat Passport feature description.
- `docs/quality/rules.md`: Beat Passport focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-174-beat-passport-focus` and `.worktree/plan-174-beat-passport-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Beat Passport summary, metric rendering, workflow refs, and QA expectations.
- [x] Add UI-local Beat Passport focus state and focus target metadata derived from existing target/length/patterns/readiness/export/stems/master metrics.
- [x] Render explicit Focus controls and focused-card styling without changing Beat Passport scoring or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Beat Passport Focus controls render, focused metric highlights, project status updates, Compose/Arrange/Master/Deliver scroll targets work, no Beat Passport scoring mutation, no auto-play/export, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Beat Passport metrics, UI-local state only, no scoring/schema/export changes, no auto-target/auto-arrange/auto-master/autoplay, no Beat Passport regression, no layout regression, and no sampling/remote/platform-compliance scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add explicit Beat Passport focus controls without changing passport scoring or project data. | The compact beat identity scan should give beginners and producers a direct path to the surface that fixes each passport signal. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Beat Passport Focus. |
| 2026-06-17 | harness_builder | Added UI-local Beat Passport focus state, focus targets for Compose/Arrange/Master/Deliver, metric Focus buttons, focused-card styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Initial `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed. |
| 2026-06-17 | quality_runner | Full QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`; Browser smoke could not run because localhost dev server escalation was rejected by environment policy, so production build and static source/dist token checks were used instead. |

## Completion Notes

Beat Passport Focus is complete. Focus controls remain UI-local, derive from existing Beat Passport metrics, route only to existing Compose, Arrange, Master, or Deliver panels, and do not change passport scoring, project data, arrangement, mixer, master, targets, playback, render/export, sampling, or remote scope.
