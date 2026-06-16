# plan-175-beat-blueprint-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a local Beat Blueprint preview/readout so beginners can understand what a sample-free starting point will change before clicking, while producers can quickly scan style, key, BPM, arrangement, sound, and master posture without applying the blueprint first.

## Non-Goals

- Do not change `applyBeatBlueprint`, Beat Blueprint contents, style profiles, arrangement templates, mixer presets, master presets, project schema, save/load migration, playback, render/export, snapshots, Quick Actions, or Next Move command behavior.
- Do not add modal confirmation, hidden generation, auto-apply, autoplay, auto-save, cloud sync, accounts, analytics, plugin hosting, remote AI, imported audio, sampling, licensing, or professional/commercial outcome claims.
- Do not make sampling a blueprint source or present sampling as a required start path.

## Context Map

- `src/ui/App.tsx`: Beat Blueprint component, local project state, blueprint application handler, readout helper.
- `src/styles.css`: Beat Blueprint row layout and preview/readout styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Beat Blueprint preview guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-175-beat-blueprint-preview` and `.worktree/plan-175-beat-blueprint-preview` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Beat Blueprint data, component layout, docs, and QA expectations.
- [x] Add a UI-local selected/previewed blueprint readout derived only from existing blueprint metadata and current project state.
- [x] Render preview/change chips and selected-button state without applying a blueprint until the existing explicit Apply click.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Beat Blueprint preview renders, selecting a blueprint updates preview/readout without changing project status or project data, Apply still uses the existing explicit blueprint path, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks UI-local preview state, derivation from existing blueprint metadata, no mutation before explicit Apply, no changes to blueprint application semantics, no project-schema/export/playback drift, layout risk, beginner/pro usefulness, and no sampling/remote/cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a Beat Blueprint preview/readout before changing blueprint application behavior. | Users need confidence about a sample-free starter move, but the existing explicit apply path should remain the only mutation path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Beat Blueprint preview/readout. |
| 2026-06-17 | harness_builder | Added UI-local Beat Blueprint preview state, preview summary metrics, split Preview/Apply controls, responsive styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`; Browser smoke could not run because localhost dev server escalation was rejected by environment policy, so production build and static dist token checks were used instead. |

## Completion Notes

Beat Blueprint Preview is complete. Preview selection remains UI-local, derives only from existing local Beat Blueprint metadata and current project state, does not mutate project data before explicit Apply, and preserves the existing Beat Blueprint application path, Quick Actions/Next Move command behavior, project schema, playback, export, and sample-free product boundary.
