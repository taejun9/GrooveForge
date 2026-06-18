# plan-373-selected-chord-harmony-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add direct Quick Actions for selected chord harmonic edits: move the selected chord root down/up through the current key's scale roots and cycle the selected chord quality through the existing chord quality palette, using the same undoable selected-chord update path as visible chord controls.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new audio engines.
- No new harmony generator, automatic reharmonization, progression replacement, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to Chord Pads, Chord Rhythm Pads, Chord Voicing Pads, key retargeting, chord move preview/result, copy/paste/duplicate/delete, audition, or selected chord length/velocity/chance commands.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected chord Quick Action definitions.
- `src/ui/App.tsx`: selected chord update handlers and Quick Actions wiring.
- `src/domain/workstation.ts`: chord quality/root event data and normalization.
- `src/ui/workstationComposePanels.tsx`: visible selected chord root/quality controls.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected chord harmonic edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Route selected chord root and quality edits through an existing undoable selected-chord update path.
- Keep commands scoped to the selected Pattern A/B/C slot.
- Disable root movement when no active selected chord exists or the selected root is at the scale edge.
- Cycle only through the existing chord quality palette; do not invent genre-specific or generated harmony rules.

## Implementation Plan

- [x] Inspect selected chord visible controls and update helpers.
- [x] Add selected-chord root down/up Quick Actions.
- [x] Add selected-chord quality cycle Quick Action.
- [x] Wire new actions through existing selected-chord update handling.
- [x] Update README, product docs, quality rules, and static QA expectations.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `git diff --check`
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Browser/dev-server visual check if the environment allows localhost.

## QA Results

- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `git diff --check`
- Passed: `npm run typecheck`
- Passed: `npm run harness:smoke`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Blocked by environment policy: `npm run dev -- --host 127.0.0.1 --port 5180` failed with `listen EPERM`; escalated retry was rejected, so browser/dev-server visual QA was not run.

## Review Plan

QA completes before review starts. Review checks that selected chord harmonic commands are explicit, scoped to the selected Pattern A/B/C slot, use existing chord quality/root data and undoable update paths, keep all edits manually adjustable afterward, and add no sampling or remote scope.

## Review Results

- No findings. Selected chord root down/up and quality cycle commands derive only from local key scale roots and the existing chord quality palette, route through `updateChordEvent` via selected-chord root/quality handlers, preserve manual chord controls, and add no sampling, imported audio, remote AI, analytics, account, or cloud scope.
- Residual risk: browser/dev-server visual QA could not run because localhost listen was blocked by the environment.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected chord root/quality commands after selected event recovery actions. | Harmonic micro-edits are central to beat writing; command access helps producers move fast and gives beginners a safe, scale-aware way to correct a selected chord without replacing the progression. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected chord harmonic Quick Actions. |
| 2026-06-19 | harness_builder | Added selected chord root down/up and quality cycle Quick Actions through the existing selected chord update path. |
| 2026-06-19 | repo_cartographer | Updated README, product rules, quality rules, and QA expectations for selected chord harmonic commands. |
| 2026-06-19 | quality_runner | QA passed through run_qa, quality_gate, diff check, typecheck, runtime smoke, build, npm qa, and verify; dev server visual QA was blocked by environment policy. |
| 2026-06-19 | review_judge | Post-QA review found no code issues and documented the localhost visual QA residual risk. |
