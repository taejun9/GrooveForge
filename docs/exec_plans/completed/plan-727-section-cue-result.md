# plan-727-section-cue-result

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Add UI-local Section Cue Result feedback after explicit Arrangement Block Cue, Section Locator Cue Decision, or direct Section Locator cue actions so users can confirm which arrangement block was cued, which Pattern it uses, its bar range and event count, and what to listen for next before editing song form.

## Non-Goals

- Do not change arrangement block data, Pattern A/B/C event data, selected-section derivation, or Section Locator priority scoring.
- Do not change playback scheduling, autoplay behavior, transport start/stop semantics, loop-scope options, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add automatic arrangement edits, automatic cueing, command chains, modal confirmations, sampling, imported audio, audio clips, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Arrangement Block Cue, Section Locator cue handlers, Quick Actions routing, and local result strips.
- `src/ui/workstationUiModel.ts` owns shared UI result types.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-727-section-cue-result` and `.worktree/plan-727-section-cue-result` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add a Section Cue Result UI model for explicit arrangement block and section cue actions.
- [x] Populate the result from current local arrangement block, Pattern event count, bar range, and cue source.
- [x] Render the result near Section Locator/arrangement cue context and clear stale result state on project/selection mutation like other UI-local result strips.
- [x] Update product/docs language and QA harness expectations for Section Cue Result feedback.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Section Cue Result feedback is UI-local, explicit, non-mutating, and only reflects the block/section the user cued, while arrangement data, Pattern data, playback scheduling, export, MIDI, Handoff, remote, and sampling boundaries remain unchanged.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add cue-result feedback instead of changing loop behavior. | The cue commands already set the correct block loop; users need persistent confirmation of the cued section before direct arrangement edits. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for UI-local Section Cue Result feedback. |
| 2026-06-25 | harness_builder | Added Section Cue Result state, result strip, Arrangement Block Cue/Section Locator cue wiring, docs, and QA expectations. |
| 2026-06-25 | quality_runner | Full QA passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no arrangement data, Pattern data, playback scheduling, export, MIDI, Handoff, remote, or sampling scope regressions. |

## Completion Notes

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.
- Arrangement Block Cue and Section Locator cue actions now show a UI-local Section Cue Result with cued block, Pattern, bar range, event count, audition cue, and next check.
- Cue result state remains UI-local and clears on project/selection mutations, while arrangement blocks, Pattern A/B/C data, playback scheduling, render/export, MIDI export, Handoff, remote, and sampling boundaries remain unchanged.
