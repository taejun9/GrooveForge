# plan-510-groove-compass-priority-focus-readout

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Make the Groove Compass readout default to the same highest-priority pocket lane used by the Quick Actions Groove Compass focus command, so beginners and producers immediately see the most important density, anchor, hat, timing, chance, pocket-balance, or selected-drum issue before clicking a Focus control.

## Non-Goals

- Do not change Groove Compass card derivation, card order, card scoring, cue behavior, focus targets, Focus buttons, direct Groove Compass card Quick Actions, or Focus Result behavior.
- Do not change drum editing, selected drum state, Pattern A/B/C data, playback, arrangement, render/export, Handoff, or project schema.
- Do not add automatic edits, hidden generation, tutorials, command chains, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not persist focus readout state in project data, localStorage, or exported files.

## Context Map

- `src/ui/App.tsx`: Groove Compass rendering, priority Quick Actions item selection, focus summary creation, cue handling, and Focus Result derivation.
- `src/ui/workstationUiModel.ts`: Groove Compass summary, card, focus summary, and focus result types.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA boundaries for direct rhythm/pocket guidance.
- `harness/scripts/run_qa.py`: executable documentation/source/style expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Groove Compass model, readout, Quick Actions priority, docs, CSS, and harness checks.
- [x] Update the Groove Compass focus readout default to use the same danger/warn/first priority as Quick Actions when no card is explicitly focused.
- [x] Add explicit status labels for groove blocker, groove review, and groove ready states without changing Focus Result or Cue behavior.
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

QA completes before review starts. Review should confirm the readout is UI-local, derives from existing Groove Compass cards and the existing Quick Actions priority rule, preserves card scoring, Cue behavior, and Focus Result behavior, and does not introduce sampling, imported audio, remote AI, schema, playback, or export changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Align the default Groove Compass readout with Quick Actions priority instead of adding a new panel. | Groove Compass already has a readout; the issue is that its initial state can point to Density while command-palette focus points to the top pocket problem. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make the Groove Compass readout surface the most important rhythm/pocket lane before a user clicks Focus. |
| 2026-06-20 | harness_builder | Aligned the default Groove Compass readout with Quick Actions priority and added explicit groove blocker/review/ready labels. |
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

Review confirmed the default Groove Compass readout now derives from the same highest-priority card used by the Quick Actions Groove Compass focus command. Existing Groove Compass card derivation, card order, card scoring, Cue behavior, Focus buttons, direct card Quick Actions, and Focus Result behavior are unchanged. The change does not alter drum editing, selected drum state, Pattern A/B/C data, playback, arrangement, project schema, render/export, Handoff, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Completion Notes

The Groove Compass readout now surfaces the top rhythm/pocket issue before any explicit focus click: danger cards show `Groove blocker`, warn cards show `Groove review`, and clear cards show `Groove ready`. This keeps the beginner/producer pocket scan aligned with the command-palette focus target without changing the beat.
