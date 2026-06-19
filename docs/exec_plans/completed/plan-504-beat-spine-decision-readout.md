# plan-504-beat-spine-decision-readout

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Add a read-only Beat Spine Decision Readout so users can immediately understand whether the current direct beat-making core needs a jump-only inspection or an explicit Apply action across Setup, Drums, 808/Bass, Harmony, Melody, Sound, Arrange, or Finish.

## Non-Goals

- Do not change Beat Spine scoring, card order, next-card selection, Jump targets, Apply handlers, Quick Actions, or Apply Result behavior.
- Do not change project schema, saved project files, undo history beyond existing explicit Apply actions, playback, render/export, Handoff, or local draft recovery.
- Do not add tutorials, onboarding overlays, command chains, auto-run, autoplay, auto-apply, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not persist the decision readout in project data, localStorage, or exported files.

## Context Map

- `src/ui/App.tsx`: Beat Spine summary derivation, panel rendering, Jump/Apply handlers, and Apply Result strip.
- `src/ui/workstationUiModel.ts`: Beat Spine summary/card/action/result types.
- `src/styles.css`: Beat Spine layout and responsive CSS.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA boundaries for direct beat-making core flow.
- `harness/scripts/run_qa.py`: executable documentation/source/style expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Beat Spine model, rendering, CSS, docs, and harness checks.
- [x] Extend Beat Spine summary with UI-local decision labels derived from the existing next card and action availability.
- [x] Render a compact decision readout without adding new Jump or Apply controls.
- [x] Style the readout for desktop and mobile layouts without creating nested cards.
- [x] Update docs and harness expectations.
- [x] Run QA, review, complete plan, and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should confirm the readout is read-only, derived only from existing Beat Spine summary/card/action state, preserves all existing Jump/Apply/Quick Actions behavior, and does not introduce sampling, imported audio, remote AI, schema, playback, or export changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a Beat Spine decision readout instead of another Apply action. | The direct beat-making core should explain the next axis while keeping all project mutation explicit. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make the Beat Spine core path clearer for beginners and faster to scan for producers. |
| 2026-06-20 | harness_builder | Added UI-local Beat Spine decision fields, panel readout, responsive styling, and matching docs/harness checks. |
| 2026-06-20 | quality_runner | QA passed; local dev server preview is blocked by sandbox localhost listen policy. |
| 2026-06-20 | review_judge | Review found no follow-up changes before completion. |

## QA Results

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large chunk warning.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 style profiles.
- `npm run dev -- --host 127.0.0.1` was blocked by `listen EPERM: operation not permitted 127.0.0.1:5173`; escalated retry was rejected by the environment policy, so no browser preview was performed.

## Review

Review confirmed the decision readout is read-only, derived from existing Beat Spine next card/action state, and does not add new Jump or Apply controls. Existing Beat Spine Jump, Apply, Quick Actions, direct card commands, and Apply Result behavior are unchanged. The change does not alter Beat Spine scoring, project schema, undo history beyond existing explicit Apply actions, playback, render/export, Handoff, local draft recovery, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Completion Notes

Added a compact Beat Spine Decision Readout that tells users whether the current direct beat-making core axis is an apply-ready blocker/review/polish target or a jump-only inspection target. Updated docs and harness expectations so the product spine remains centered on direct composition, not sampling.
