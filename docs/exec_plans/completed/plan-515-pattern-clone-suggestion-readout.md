# plan-515-pattern-clone-suggestion-readout

## Goal

Add a UI-local Pattern Clone suggestion readout that shows the current recommended clone target slot and variation preset before users click a Pattern Clone Pad or Quick Action.

## Why

Pattern Clone Pads already make A/B/C hook and breakdown variations possible, but beginners still need to infer which target slot is safest and which variation type fits the selected Pattern. Producers also benefit from a fast readout for preserving a strong source loop while creating a hook or breakdown alternate. A stable readout makes the A/B/C versioning workflow clearer without applying anything automatically.

## Scope

- Derive the suggested target from selected Pattern A/B/C event counts, preferring the non-selected slot with the fewest events.
- Derive the suggested clone variation from selected Pattern density using existing deterministic Pattern Variation output.
- Show source, target, variation, target posture, and expected changed-event count.
- Keep the readout UI-local and out of saved project data and undo history.
- Update product docs, quality rules, and harness expectations.

## Non-Goals

- Do not auto-apply Pattern Clone or change visible pad ordering.
- Do not change Pattern Clone transforms, result labels, direct clone buttons, direct Quick Actions, Pattern A/B/C storage, playback, export, save/load, or undo/redo semantics.
- Do not add sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run typecheck`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Blocked by environment: `npm run dev -- --host 127.0.0.1` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`.
- Escalated dev server retry requested for the same command and rejected by environment policy, so no browser preview was possible in this sandbox.

## Decision Log

- plan-515 starts after plan-514 completed, main clean, and 514 completed plans recorded.
- Pattern Clone Pads expose direct target/preset choices, but the panel does not show the safest current target slot or whether the selected Pattern should become a hook or breakdown alternate.
- Keep this centered on sample-free direct beat composition and editable Pattern A/B/C versioning.
- Add `suggestedPatternCloneTarget` to pick the non-selected Pattern slot with the fewest events so clone suggestions avoid overwriting richer alternate ideas.
- Add `suggestedPatternClonePreset` to recommend Hook for most source loops and Breakdown for dense selected Patterns, then derive changed-event posture from the existing deterministic `createPatternVariation` dry-run output.
- Keep the readout UI-local by computing `PatternCloneSuggestionSummary` in `App` from current Pattern A/B/C state and rendering it before the existing Pattern Clone Pads without changing pad ordering, saved project schema, undo history, or clone handlers.
