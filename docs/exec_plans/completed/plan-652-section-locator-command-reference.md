# plan-652-section-locator-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after finished work and give a 10-plan progress report every 10 completed plans.

## Goal

Align the Arrange Command Reference row for Section Locator with the existing local Section Locator Cue Decision Readout, Priority Readout, explicit section cue pads, direct Section Locator Quick Actions commands, and Section cue result feedback so beginners can discover Intro/Verse/Hook/Bridge/Outro audition prep and producers can scan section navigation targets before cueing a block loop.

## Non-Goals

- Do not change Section Locator pad definitions, Cue Decision derivation, priority labels, result labels, cue behavior, selected block/pattern alignment, loop-scope behavior, undo semantics, playback scheduling, render/export behavior, project schema, save/load, snapshots, or keyboard shortcut handling.
- Do not change Quick Actions ranking, search, pinning, recents, command execution beyond the existing Section Locator Cue Decision and direct Section Locator command paths.
- Do not store Command Reference filter/search/focus state in project data, undo history, local drafts, localStorage, or snapshots.
- Do not add automatic cueing, autoplay, auto-arrangement chains, count-in markers, audio analysis, reference audio, rendered reference imports, audio uploads, sampling, sample browsing, sampler tracks, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Section Locator pads, Cue Decision, Priority Readout, direct Section Locator Quick Actions commands, cue routing, and local result feedback.
- `README.md` and `docs/product/product.md` describe Section Locator Cue Decision/Priority readouts, direct Quick Actions commands, and section cue result feedback.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Command Reference, Section Locator, playback/export, and local-first boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Command Reference changes must reflect existing local Quick Actions/readouts only and must not alter Section Locator behavior, command execution semantics, playback, render/export, project schema, or snapshot safety boundaries.

## Implementation Plan

- [x] Update the Arrange Command Reference row for Section Locator to show Quick Actions plus readout access.
- [x] Align README/product/quality/harness coverage with the command-map wording.
- [x] Complete QA, review, completed-plan move, and review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-21 | `git diff --check` | Pass. |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | Pass. `GrooveForge QA passed.` |
| 2026-06-21 | `npm run typecheck` | Pass. Both app and Electron TypeScript projects compile with `--noEmit`. |
| 2026-06-21 | `python3 harness/scripts/run_quality_gate.py` | Pass. `GrooveForge quality gate passed.` |
| 2026-06-21 | `npm run build` | Pass. Existing Vite chunk-size warning only. |
| 2026-06-21 | `npm run qa` | Pass. `GrooveForge QA passed.` |
| 2026-06-21 | `npm run verify` | Pass. Quality gate, runtime smoke, typecheck, and build passed; runtime smoke reported 14/14 sample-free blueprints and 14/14 supported styles. Existing Vite chunk-size warning only. |
| 2026-06-21 | post-move `git diff --check` | Pass. |
| 2026-06-21 | post-move `python3 harness/scripts/run_qa.py` | Pass. `GrooveForge QA passed.` |
| 2026-06-21 | post-move active plan check | Pass. Active exec plans contain only `.gitkeep`. |
| 2026-06-21 | post-move completed count | Pass. Completed exec plan count is 652. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. The implementation changes only the Command Reference Section Locator shortcut label plus aligned docs/harness text; Section Locator pad definitions, Cue Decision/Priority derivation, cue routing, Quick Actions command execution, playback scheduling, render/export, project schema, sampling, remote behavior, automatic cueing, and autoplay behavior were not changed. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Section Locator as a readout-backed Quick Actions command-reference entry. | The app already exposes local Section Locator Cue Decision, Priority Readout, direct section cue commands, and Section cue result feedback; the command map should make that section-audition path discoverable without autoplay, undo history, arrangement mutation, or export changes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and completed plan count is 651 in the post-650 completion-hardening pass. |
| 2026-06-21 | harness_builder | Updated the Section Locator Command Reference row to `Quick Actions / Readout` and aligned README, product, quality, and QA harness coverage while preserving Section Locator cue routing/playback/export/schema/sampling/remote boundaries. |
| 2026-06-21 | quality_runner | Full QA passed: diff check, harness QA, typecheck, quality gate, build, qa, and verify. Runtime smoke covered 14/14 sample-free blueprints and 14/14 supported styles. |
| 2026-06-21 | review_judge | Review passed after QA; no follow-up code changes required. |
| 2026-06-21 | doc_gardener | Marked the plan completed before moving it to completed plans and creating the review mirror. |
| 2026-06-21 | doc_gardener | Moved the completed plan to `docs/exec_plans/completed/`, created the review mirror, and confirmed active plans are empty with 652 completed plans. |
