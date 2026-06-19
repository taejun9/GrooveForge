# plan-508-mode-focus-decision-readout

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Add a read-only Mode Focus Decision Readout so users can immediately see which Guided or Studio orientation card is driving the current recommendation, where the existing Jump action will go, and why it matters for the direct beat-making workflow.

## Non-Goals

- Do not change Mode Focus card derivation, card order, scoring, Jump targets, Quick Actions, or Jump Result behavior.
- Do not change Composer Guide, Beat Map, Review Queue, Finish Checklist, Workflow Navigator, Session Pass, First Beat Path, or Mode Switch scoring.
- Do not change project schema, saved project files, undo history, playback, render/export, Handoff, or local draft recovery.
- Do not add tutorials, onboarding overlays, command chains, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not persist the decision readout in project data, localStorage, or exported files.

## Context Map

- `src/ui/workstationUiModel.ts`: Mode Focus summary and card types.
- `src/ui/App.tsx`: Mode Focus summary creation, active card selection, Jump Result derivation, and Quick Actions integration.
- `src/ui/workstationGuidancePanels.tsx`: Mode Focus rendering.
- `src/styles.css`: Mode Focus layout and responsive styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA boundaries for direct beat-making orientation.
- `harness/scripts/run_qa.py`: executable documentation/source/style expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Mode Focus model, rendering, CSS, docs, and harness checks.
- [x] Extend Mode Focus summary with UI-local decision labels derived from the same active Guided stage or Studio issue card used by Quick Actions.
- [x] Render a compact decision readout without adding new Jump controls.
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

QA completes before review starts. Review should confirm the readout is read-only, derived only from existing Mode Focus card state, preserves all existing Mode Focus Jump, Quick Actions, and Jump Result behavior, and does not introduce sampling, imported audio, remote AI, schema, playback, or export changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a Mode Focus decision readout instead of changing jump behavior. | Mode Focus already routes Guided and Studio jumps correctly; users need the current orientation decision explained before explicitly jumping. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to clarify the current Guided/Studio orientation decision without changing Mode Focus jump behavior. |
| 2026-06-20 | harness_builder | Added UI-local Mode Focus decision fields, panel readout, responsive styling, and matching docs/harness checks. |
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

Review confirmed the decision readout is read-only, derived from the same current Guided stage or Studio issue card used by Mode Focus Quick Actions, and does not add new Jump controls. Existing Mode Focus card derivation, card order, scoring, Jump targets, direct card Quick Actions, and Jump Result behavior are unchanged. The change does not alter project schema, saved project files, undo history, playback, render/export, Handoff, local draft recovery, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Completion Notes

Added a compact Mode Focus Decision Readout that tells users whether the current Guided or Studio orientation is ready, needs review, or blocks progress, plus the existing Jump destination and reason. Updated docs and harness expectations so Mode Focus remains centered on direct beat composition and session orientation instead of sample browsing or sampler setup.
