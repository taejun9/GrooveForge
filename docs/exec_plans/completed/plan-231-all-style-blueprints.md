# plan-231-all-style-blueprints

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat-making mini DAW that can satisfy working producers while staying approachable for beginners. Keep sampling secondary and make the direct beat-making starter path stronger across every supported genre.

## Goal

Expand Beat Blueprints so every supported style profile has a dedicated sample-free project starter. Update the Next Move blueprint recommendation to choose the matching starter for the current style, and extend runtime/static QA so future style additions fail if they lack Beat Blueprint coverage.

## Non-Goals

- No new UI surface, saved project schema, audio engine, render algorithm, playback scheduling, sample import, imported audio, sampler devices, audio clips, remote AI, plugin hosting, accounts, analytics, or cloud sync.
- No replacement of existing Style Selector, Beat Blueprint preview/result behavior, undo/redo flow, or export behavior.
- No browser/dev-server smoke unless the environment permits local server binding.

## Context Map

- `src/domain/workstation.ts`: Beat Blueprint ids, metadata, style profiles, blueprint apply behavior.
- `src/ui/App.tsx`: Next Move suggested Blueprint mapping and existing Beat Blueprint UI.
- `harness/scripts/run_runtime_smoke.mjs`: runtime export smoke for Beat Blueprints and style profiles.
- `harness/scripts/run_qa.py`: static expectations.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: durable all-style starter documentation.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-231-all-style-blueprints` and `.worktree/plan-231-all-style-blueprints`.
- Every Beat Blueprint must remain sample-free, deterministic, editable, and exportable through the existing runtime smoke.

## Implementation Plan

- [x] Add dedicated Beat Blueprint ids and metadata for Trap, Boom Bap, Jersey Club, Phonk, Garage, and Experimental.
- [x] Update Next Move's suggested Blueprint mapping so every style routes to a matching starter.
- [x] Extend runtime smoke to assert that every `styleProfiles` entry has at least one Beat Blueprint.
- [x] Update docs and static QA expectations for all-style Beat Blueprint coverage.
- [x] Run QA, review, complete the plan, merge, push, and clean up.

## QA Plan

- `npm run harness:smoke`
- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser/dev-server smoke if the environment permits local server binding.

## Review Plan

QA completes before review starts. Review checks one-to-one style starter coverage, Next Move recommendation mapping, local-only/sample-free behavior, no schema/render/playback drift, and no sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add dedicated Beat Blueprints for every supported style profile. | Beginners need a direct starter for the genre they picked, and producers should not see multiple genres collapsed into unrelated starter names. |
| 2026-06-17 | Enforce style-to-Blueprint coverage in runtime smoke. | The app already promises all-style export coverage; missing starter coverage should fail locally when a style is added. |
| 2026-06-17 | Keep Blueprint implementation as domain metadata plus existing apply/render paths. | This strengthens the starter catalog without changing UI behavior, project schema, playback, or export algorithms. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created after confirming the domain has ten supported style profiles but only four Beat Blueprints. |
| 2026-06-17 | harness_builder | Added dedicated Trap, Boom Bap, Jersey Club, Phonk, Garage, and Experimental Beat Blueprints, bringing the catalog to 10/10 supported styles. |
| 2026-06-17 | harness_builder | Updated Next Move suggested Blueprint mapping so each style routes to its matching starter. |
| 2026-06-17 | harness_builder | Extended `npm run harness:smoke` to fail if any supported style lacks Beat Blueprint coverage. |
| 2026-06-17 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for all-style Beat Blueprint coverage. |
| 2026-06-17 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run typecheck`, `npm run harness:smoke`, `python3 harness/scripts/run_quality_gate.py`, `npm run qa`, and `npm run verify`. |
| 2026-06-17 | quality_runner | Browser/dev-server smoke was not rerun because prior localhost binding attempts remain blocked by environment policy and this change does not add browser-only behavior. |
| 2026-06-17 | quality_runner | After moving this plan to completed and creating the review mirror, passed `python3 harness/scripts/run_qa.py`, `git diff --check`, and `npm run verify`. |

## Completion Notes

Implemented and QA passed. Beat Blueprints now cover every supported style profile, Next Move routes each style to a matching starter, and runtime smoke enforces style-to-Blueprint coverage. The completion review mirror is `docs/reviews/plan-231-all-style-blueprints-review.md`.
