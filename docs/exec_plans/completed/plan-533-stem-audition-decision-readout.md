# plan-533-stem-audition-decision-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Stem Audition Decision Readout so beginners know the next stem comparison to make and working producers can move quickly between Full Mix, Drums, 808, Synth, and Chords audition checks before changing levels or applying mix moves.

## Non-Goals

- Do not change Stem Audition pad definitions, pad apply behavior, Quick Actions routing, mixer solo/mute semantics, Mix Balance behavior, Mix Coach behavior, playback, or export analysis.
- Do not mutate project data, undo history, playback, save/load, render/export files, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add rendered stem playback, stem separation, automatic mixing, auto-mastering, sampling, imported audio, remote AI/audio analysis, plugin hosting, accounts, analytics, cloud sync, onboarding overlays, tutorials, macros, or auto-fix loops.

## Context Map

- `src/ui/App.tsx` renders Stem Audition Pads, Stem Audition Readout, and summary derivation.
- `src/ui/workstationUiModel.ts` defines Stem Audition pad and readout types.
- `src/styles.css` contains Stem Audition readout and responsive styling.
- `README.md` and `docs/product/product.md` describe Stem Audition as local mixer solo/mute checks.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Stem Audition behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Decision Readout derived only from local mixer solo/mute state and existing Stem Audition pad options.

## Implementation Plan

- [x] Add a typed UI-local Stem Audition Decision summary.
- [x] Render the decision readout near the Stem Audition readout with stable test ids and no click handlers.
- [x] Add responsive CSS that keeps compact audition decision text contained.
- [x] Update README, product docs, quality rules, and QA token expectations.

## QA Plan

- [x] `git diff --check`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run build`
- [x] `npm run qa`
- [x] `npm run verify`
- [x] Dev server smoke attempt and escalated retry if sandbox blocks binding.

## Review Plan

QA completed before review. Review completed with no findings.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Stem Audition Decision Readout. | Stem Audition already shows current solo/mute state and explicit pads, but users need one visible next comparison target before changing levels or applying mix moves. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 532 completed plans, no active plans, and next regular progress report due at plan-540 completion. |
| 2026-06-20 | plan_keeper | Implemented the UI-local Stem Audition Decision Readout and updated documentation plus QA expectations before validation. |
| 2026-06-20 | quality_runner | QA passed for diff check, harness QA, typecheck, quality gate, build, npm QA, and verify; dev server smoke remains blocked by sandbox EPERM on 127.0.0.1:5173, and the escalated retry was rejected by automatic review. |
| 2026-06-20 | review_judge | Reviewed the diff after QA; no findings. The readout is display-only and preserves Stem Audition pad behavior, mixer semantics, playback, export, and saved project data. |
