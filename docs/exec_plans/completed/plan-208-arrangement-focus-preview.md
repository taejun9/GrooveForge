# plan-208-arrangement-focus-preview

## Status

Completed.

## Goal

Add a UI-local Arrangement Focus Preview inside the Arrangement Focus panel so users can see the suggested selected-block focus preset, section/pattern/bar posture, energy/mute posture, and pre-click field move count before applying a focus preset.

## User Value

- Beginners can understand what a selected-block focus preset will change before clicking.
- Producers can scan section role, Pattern assignment, length, energy, and muted-track posture quickly while arranging.
- The workflow keeps arrangement edits explicit, undoable, and sample-free.

## Non-Goals

- Do not change Arrangement Focus preset definitions or apply behavior.
- Do not change saved project schema, undo history semantics, playback, render/export, MIDI export, Handoff Sheet, or Handoff Pack file contents.
- Do not add auto-arrangement, hidden generation, remote AI, imported audio, or sampling workflow.

## Scope

- Add `ArrangementFocusPreviewSummary` derived only from the selected local arrangement block and existing Arrangement Focus presets.
- Render the preview in Arrangement Focus before preset buttons.
- Update README/product/quality docs and static QA expectations.
- Preserve existing Arrangement Focus preset click behavior and manual arrangement controls.

## QA

- PASS: `npm run typecheck`
- PASS: `python3 harness/scripts/run_qa.py`
- PASS: `git diff --check`
- PASS: `npm run qa`
- PASS: `python3 harness/scripts/run_quality_gate.py`
- PASS: `npm run verify`
- BLOCKED: Browser smoke. `npm run dev -- --host 127.0.0.1 --port 5298` failed with `listen EPERM`; the escalated retry was rejected by the environment policy, so localhost verification could not be run without a prohibited workaround.

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-17 | Add preview before Arrangement Focus presets. | Arrangement Focus changes the selected block's section, Pattern, length, energy, and mutes; pre-click clarity helps beginners and speeds producer arrangement edits. |
