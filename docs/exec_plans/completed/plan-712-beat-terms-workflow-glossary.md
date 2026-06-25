# plan-712-beat-terms-workflow-glossary

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Expand the static Beat Terms glossary in Command Reference with workflow and delivery terms that beginners can search while producers can use them as fast shared vocabulary, without executing commands, changing project data, or expanding sampling scope.

## Non-Goals

- Do not add tutorials, onboarding overlays, modal help, command execution from Beat Terms, or glossary persistence.
- Do not change Command Reference filter/search ordering, Search Spotlight behavior, Quick Actions routing, project schema, save/load, snapshots, undo/redo history, realtime playback, WAV/stem/MIDI export, Handoff Pack, Handoff Sheet, or render output.
- Do not add sampling, imported audio, audio clips, sampler devices, sample browsing, remote AI, accounts, analytics, cloud sync, platform compliance, or publishing/licensing claims.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns the static `beatTermItems` array and Command Reference rendering/search behavior.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations for Beat Terms.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-712-beat-terms-workflow-glossary` and `.worktree/plan-712-beat-terms-workflow-glossary` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add workflow and delivery Beat Terms entries in the Command Reference source.
- [x] Update README/product/quality notes so Beat Terms coverage reflects the broader static glossary.
- [x] Add harness expectations that pin the new static terms and preserve read-only glossary behavior.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only static Command Reference glossary/docs/harness coverage changed and that Command Reference filtering/search, Search Spotlight, Quick Actions, project data, playback, export, remote, and sampling boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Expand Beat Terms with workflow and delivery vocabulary. | Beginners need searchable explanations for editing and handoff terms, while producers need shared language for fast session scanning without leaving the workstation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Beat Terms workflow glossary expansion. |
| 2026-06-25 | harness_builder | Expanded the static Beat Terms glossary with workflow and delivery terms and updated README, product, quality, and harness coverage while preserving read-only Command Reference behavior. |
| 2026-06-25 | quality_runner | Ran git diff --check, run_qa.py, typecheck, quality gate, build, npm QA, and verify; all passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Reviewed the diff and confirmed scope stayed limited to static Beat Terms entries, documentation, harness expectations, and plan/review artifacts with no App/domain/audio/package changes. |

## Completion Notes

- Added static Beat Terms entries for workflow, groove, arrangement, mix, export, MIDI, and handoff language.
- Updated README, product notes, quality rules, and QA expectations to pin the broader read-only glossary.
- Preserved all-genre direct beat composition as the product center and kept sampling, sampler devices, imported audio, remote AI, accounts, analytics, and cloud sync out of scope.
- Validation passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`.
