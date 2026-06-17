# plan-210-arrangement-arc-result

## Status

Completed.

## Goal

Add a UI-local Arrangement Arc Result inside the Arrangement Arc panel so users can see the applied full-song arc, before/after section and Pattern spread, bar length, energy, muted-track posture, changed arrangement field impact, audition cue, and next check after explicitly clicking an Arrangement Arc Pad.

## User Value

- Beginners can understand what a full-song arc pad changed after applying it.
- Producers can quickly confirm section flow, Pattern A/B/C spread, energy shape, and mutes across the arrangement.
- The workflow keeps full-song arrangement shaping explicit, undoable, and sample-free.

## Non-Goals

- Do not change Arrangement Arc Pad definitions or preview behavior.
- Do not change saved project schema, undo history semantics, playback, render/export, MIDI export, Handoff Sheet, or Handoff Pack file contents.
- Do not add auto-arrangement, hidden generation, remote AI, imported audio, or sampling workflow.

## Scope

- Add `ArrangementArcResultSummary` derived only after an explicit Arrangement Arc Pad click from local before/after arrangement state and existing pad definitions.
- Render the result near Arrangement Arc controls with applied pad, before/after posture, changed field count, audition cue, and next check.
- Keep result state UI-local and clear/update it only through local UI interactions that already change arrangement state.
- Update README/product/quality docs and static QA expectations.

## QA

- PASS: `npm run typecheck`
- PASS: `python3 harness/scripts/run_qa.py`
- PASS: `git diff --check`
- PASS: `npm run qa`
- PASS: `python3 harness/scripts/run_quality_gate.py`
- PASS: `npm run verify`
- BLOCKED: Browser smoke. `npm run dev -- --host 127.0.0.1 --port 5300` failed with `listen EPERM`; the escalated retry was rejected by the environment policy, so localhost verification could not be run without a prohibited workaround.

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-17 | Add Arrangement Arc Result after explicit Arrangement Arc Pad clicks. | Arc pads reshape multiple arrangement blocks; post-click feedback helps beginners learn song form and gives producers a fast full-song confirmation pass without changing project schema. |
