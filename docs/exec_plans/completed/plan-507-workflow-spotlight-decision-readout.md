# plan-507-workflow-spotlight-decision-readout

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Add a read-only Workflow Spotlight Decision Readout so users can immediately see whether the current Compose, Arrange, Mix, or Deliver zone is ready, needs review, or blocks the direct beat-making workflow before pressing the existing jump button.

## Non-Goals

- Do not change Workflow Navigator item derivation, Spotlight zone selection, Jump targets, Quick Actions, or Jump Result behavior.
- Do not change project schema, saved project files, undo history, playback, render/export, Handoff, or local draft recovery.
- Do not add tutorials, onboarding overlays, command chains, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not persist the decision readout in project data, localStorage, or exported files.

## Context Map

- `src/ui/workstationGuidancePanels.tsx`: Workflow Navigator rendering and Workflow Spotlight summary derivation.
- `src/ui/workstationUiModel.ts`: Workflow Navigator item, spotlight, and jump result types.
- `src/ui/App.tsx`: Workflow Navigator item derivation, jump handler, and Jump Result derivation.
- `src/styles.css`: Workflow Navigator and Spotlight layout and responsive CSS.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA boundaries for direct beat-making workflow navigation.
- `harness/scripts/run_qa.py`: executable documentation/source/style expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Workflow Navigator model, rendering, CSS, docs, and harness checks.
- [x] Extend Workflow Spotlight summary with UI-local decision labels derived from the existing selected zone.
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

QA completes before review starts. Review should confirm the readout is read-only, derived only from existing Workflow Spotlight selected-zone state, preserves all existing Workflow Navigator Jump, Quick Actions, and Jump Result behavior, and does not introduce sampling, imported audio, remote AI, schema, playback, or export changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a Workflow Spotlight decision readout instead of another jump command. | Workflow navigation should explain the current direct beat-making zone before the user explicitly jumps. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to clarify the current Compose/Arrange/Mix/Deliver workflow decision without changing jump behavior. |
| 2026-06-20 | harness_builder | Added UI-local Workflow Spotlight decision fields, panel readout, responsive styling, and matching docs/harness checks. |
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

Review confirmed the decision readout is read-only, derived from existing Workflow Spotlight selected-zone state, and does not add new Jump controls. Existing Workflow Navigator item derivation, Spotlight zone selection, Jump targets, Quick Actions, and Jump Result behavior are unchanged. The change does not alter project schema, saved project files, undo history, playback, render/export, Handoff, local draft recovery, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Completion Notes

Added a compact Workflow Spotlight Decision Readout that tells users whether the current Compose, Arrange, Mix, or Deliver zone is ready, needs review, or blocks the workflow, plus the explicit jump destination and reason. Updated docs and harness expectations so workflow navigation remains centered on direct beat composition instead of sample browsing or sampler setup.
