# plan-793-stem-audition-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Stem Audition Decision and direct Stem Audition result metrics identify the explicit audition action, decision/direct context, target Full Mix or stem, current audition posture, selected Pattern, editable drum/808/Synth/chord counts, total editable event count, Pattern A/B/C usage, arrangement block count, song length, export readiness, stem readiness, mixer solo/mute posture, and next listening/manual-trim check so first-time beat makers know what to compare and working producers can quickly scan whether a stem audition should lead to Mix Balance or manual mixer edits.

## Non-Goals

- Do not change Stem Audition pad definitions, readout derivation, decision target derivation, disabled-state rules, apply handlers, mixer solo/mute behavior, mixer level/pan/EQ/Drive/Glue/Space algorithms, Mix Balance, Mix Coach, Space FX, Master Finish, musical events, arrangement data, project schema, undo/redo, playback scheduling, render/export, MIDI export, Handoff, or Command Reference command definitions.
- Do not add rendered stem playback, stem separation, auto-mixing, auto-apply, command chains, autoplay, autosave, hidden generation, remote AI, audio import, sampling, sampler devices, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Quick Action result metrics plus Stem Audition readout/decision/apply routing.
- `src/ui/workstationUiModel.ts` owns the shared Quick Action shape used by result metric snapshots.
- `README.md` and `docs/product/product.md` describe Stem Audition capabilities and Quick Actions coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Stem Audition boundaries, local result feedback, direct composition, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-793-stem-audition-result-clarity` and `.worktree/plan-793-stem-audition-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Stem Audition Quick Actions result metric routing and existing readout/decision helpers.
- [x] Add structured Stem Audition result metric helpers without changing audition decision/apply behavior, project schema, playback, or export.
- [x] Update product/docs language and QA harness expectations for Stem Audition result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Stem Audition Decision/direct result feedback is clearer while preserving pad derivation, decision target derivation, undoable solo/mute update paths, mixer controls, musical events, arrangement data, project schema, playback, render/export, remote behavior, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve Stem Audition Quick Actions result metrics instead of changing Stem Audition pad or mixer solo/mute behavior. | Existing pad/apply flow already preserves local audition behavior; richer result metrics make listening decisions clearer without changing project data except through explicit audition paths. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created after 792 completed plans; next 10-plan progress checkpoint remains plan-800. |
| 2026-06-26 | plan_keeper | Found Stem Audition Decision/direct Quick Actions result metrics were still short audition readouts; added shared Stem Audition result metric helpers with action context, target/current audition posture, mixer solo/mute posture, Pattern/event counts, arrangement length, export/stem readiness, and next listening/manual-trim checks. |
| 2026-06-26 | review_judge | During post-QA review, found the Decision after metric could recompute the next decision target instead of preserving the clicked target; added optional Quick Action result target metadata so before/after metrics stay tied to the explicit Stem Audition action. |

## QA Log

| command | result |
|---|---|
| `git diff --check` | Passed after final result-target metadata correction. |
| `python3 harness/scripts/run_qa.py` | Passed after final result-target metadata correction. |
| `npm run typecheck` | Passed after final result-target metadata correction. |
| `python3 harness/scripts/run_quality_gate.py` | Passed after final result-target metadata correction. |
| `npm run build` | Passed after final result-target metadata correction; Vite kept the existing large chunk warning. |
| `npm run qa` | Passed after final result-target metadata correction. |
| `npm run verify` | Passed after final result-target metadata correction; runtime smoke covered 14/14 sample-free style profiles and 14/14 sample-free blueprints. |

## Review Log

Post-QA review completed. The change is scoped to Quick Actions Stem Audition result metrics, optional Quick Action result target metadata, matching docs, and QA harness expectations. Stem Audition pad definitions, readout derivation, decision target derivation, apply handlers, mixer solo/mute behavior, musical events, arrangement data, project schema, playback, render/export, remote behavior, and sampler boundaries are preserved. Review found and corrected one result clarity issue: Stem Audition Decision before/after metrics now preserve the explicit clicked target instead of letting the after metric drift to the next computed decision target.
