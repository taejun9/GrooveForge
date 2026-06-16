# plan-173-production-snapshot-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Production Snapshot metrics into explicit local Focus controls so beginners can jump from target, form, Pattern A/B/C coverage, mix, and handoff diagnostics into the relevant workstation surface, while producers can move quickly from session scan to Compose, Arrange, Mix, or Deliver work.

## Non-Goals

- Do not change Production Snapshot scoring, Beat Passport, Beat Map, Finish Checklist, Review Queue, Next Move, Mix Coach, Session Brief, Delivery Target, arrangement, mixer/master, project schema, save/load migration, playback, render/export, or Handoff data.
- Do not auto-apply targets, auto-arrange, auto-fix mix, auto-export, auto-save, mutate project data from focusing, or hide existing controls.
- Do not replace Production Snapshot, Workflow Navigator, Composer Guide, Beat Passport, Handoff Pack, or direct editing panels.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, plugin hosting, collaboration services, platform compliance, or professional mastering claims.

## Context Map

- `src/ui/App.tsx`: Production Snapshot summary types, ProductionSnapshot component, workflow refs, project status updates.
- `src/styles.css`: Production Snapshot layout, focus controls, and focused-card visual state.
- `README.md`: Production Snapshot product summary.
- `docs/product/product.md`: Production Snapshot feature description.
- `docs/quality/rules.md`: Production Snapshot focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-173-production-snapshot-focus` and `.worktree/plan-173-production-snapshot-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Production Snapshot summary, metric rendering, workflow refs, and QA expectations.
- [x] Add UI-local Production Snapshot focus state and focus target metadata derived from existing target/form/patterns/mix/handoff metrics.
- [x] Render explicit Focus controls and focused-card styling without changing Production Snapshot scoring or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Production Snapshot Focus controls render, focused metric highlights, project status updates, Compose/Arrange/Mix/Deliver scroll targets work, no Production Snapshot scoring mutation, no auto-play/export, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Production Snapshot metrics, UI-local state only, no scoring/schema/export changes, no auto-target/auto-arrange/auto-mix/autoplay, no Production Snapshot regression, no layout regression, and no sampling/remote/platform-compliance scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add explicit Production Snapshot focus controls without changing snapshot scoring or project data. | Producers need fast session triage, and beginners need a direct path from high-level session diagnostics to the surface that fixes each issue. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Production Snapshot Focus. |
| 2026-06-17 | harness_builder | Added UI-local Production Snapshot focus state, focus targets for Compose/Arrange/Mix/Deliver, metric Focus buttons, focused-card styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Initial `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed. |
| 2026-06-17 | quality_runner | Full QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`; Browser smoke could not run because localhost dev server escalation was rejected by environment policy, so production build and static source/dist token checks were used instead. |

## Completion Notes

Production Snapshot Focus is complete. Focus controls remain UI-local, derive from existing Production Snapshot metrics, route only to existing Compose, Arrange, Mix, or Deliver panels, and do not change snapshot scoring, project data, arrangement, mixer, master, targets, Session Brief, playback, export, sampling, or remote scope.
