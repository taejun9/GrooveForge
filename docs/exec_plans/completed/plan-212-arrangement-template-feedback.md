# plan-212-arrangement-template-feedback

## Status

Completed.

## Goal

Add UI-local Arrangement Template Preview and Result feedback so users can understand the section flow, Pattern A/B/C spread, bar length, energy posture, changed arrangement impact, audition cue, and next check before and after explicitly applying an arrangement template.

## User Value

- Beginners can see what 8-bar loop, full beat, hook-first, or breakdown templates will do before committing.
- Producers can quickly confirm section order, total bars, Pattern spread, and changed fields after applying a template.
- The workflow keeps song-form shaping explicit, undoable, local-first, and sample-free.

## Non-Goals

- Do not change arrangement template definitions, target alignment, Pattern Chain, Arrangement Arc, Arrangement Focus, playback, render/export, MIDI export, Handoff Sheet, or Handoff Pack file contents.
- Do not change saved project schema or undo history semantics beyond the existing explicit template apply path.
- Do not add auto-arrangement, hidden generation, remote AI, imported audio, sampling, or audio clips.

## Scope

- Add an Arrangement Template Preview derived from current local arrangement state and existing template definitions.
- Add an Arrangement Template Result derived only after explicit template clicks from local before/after arrangement state.
- Render preview/result near the Arrangement Template controls with template label, section/bar posture, Pattern spread, energy posture, changed block/field impact, audition cue, and next check.
- Keep preview/result state UI-local and out of saved project schema.
- Update README/product/quality docs and static QA expectations.

## QA

- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run qa`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run verify`
- Blocked: Browser smoke. `npm run dev -- --host 127.0.0.1 --port 5302` failed with `listen EPERM`; escalated retry was rejected by the current environment policy.

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-17 | Add Arrangement Template Preview and Result around explicit template buttons. | Template clicks reshape the whole song form; users need pre-click and post-click feedback without turning arrangement into hidden automation. |
