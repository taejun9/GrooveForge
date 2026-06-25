# plan-705-beat-terms-glossary

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Expand the Command Reference Beat Terms glossary beyond the current core eight terms so beginners can search common beat-production, mix, and delivery language, while producers can quickly confirm app-specific meaning for style, blueprint, stem, headroom, automation, readiness, and delivery-target concepts.

## Non-Goals

- Do not change Command Reference opening, closing, filtering, search ordering, Search Spotlight derivation, or Quick Actions execution.
- Do not change project data, musical events, pattern editing, arrangement editing, mixer/master state, render/export, save/load, snapshots, undo/redo history, realtime playback, or file contents.
- Do not add tutorials, onboarding overlays, remote lookup, remote AI, accounts, analytics, cloud sync, imported audio, sampling, sampler devices, audio analysis, macros, command chains, or auto-fixes.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns static Beat Terms glossary entries and Command Reference filtering/search.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations for Command Reference and Beat Terms.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-705-beat-terms-glossary` and `.worktree/plan-705-beat-terms-glossary` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add static Beat Terms for style, blueprint, stem, headroom, automation, readiness, and delivery target concepts.
- [x] Update README/product/quality notes to describe the expanded static glossary without changing Command Reference behavior.
- [x] Add harness expectations that pin the expanded terms and local-only glossary boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only static Beat Terms glossary/docs/harness coverage changed and that Command Reference behavior, project data, playback, export, remote, and sampling boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Expand Beat Terms in Command Reference. | Beginners need searchable explanations for production, mix, and delivery terms, and producers benefit from app-specific definitions without changing command behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for expanded Beat Terms glossary coverage. |
| 2026-06-25 | harness_builder | Added static Beat Terms for Style Profile, Beat Blueprint, Stem, Headroom, Master Automation, Beat Readiness, and Delivery Target, with README/product/quality/harness coverage and no command execution changes. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to static Beat Terms glossary/docs/harness coverage and preserved Command Reference behavior, project data, playback, export, remote, and sampling boundaries. |

## Completion Notes

- Beat Terms now includes static Style Profile, Beat Blueprint, Stem, Headroom, Master Automation, Beat Readiness, and Delivery Target entries.
- README, product, quality, and harness coverage pin the expanded glossary as static, searchable, informational Command Reference content.
- No Command Reference open/close/filter/search behavior, command execution, project data, playback, render/export, remote, or sampling behavior changed.
