# plan-514-pattern-variation-suggestion-readout

## Goal

Add a UI-local Pattern Variation suggestion readout that shows the current recommended Subtle, Hook, or Break variation for the selected Pattern before users hover or click a variation button.

## Why

Pattern Variation already has explicit variation buttons, hover/focus preview, direct Quick Actions, and result feedback. Beginners still have to choose between Subtle, Hook, and Break without a visible recommendation, while producers benefit from a fast scan of whether the loop should stay close, become a hook, or become a breakdown. A stable suggestion readout makes the next variation move visible without applying anything automatically.

## Scope

- Derive the suggestion from existing selected Pattern A/B/C event counts and deterministic dry-run variation output.
- Show suggested preset, selected Pattern, event-count posture, and expected changed-event count.
- Keep the readout UI-local and out of saved project data and undo history.
- Update product docs, quality rules, and harness expectations.

## Non-Goals

- Do not auto-apply Pattern Variation or change hover/focus preview behavior.
- Do not change Pattern Variation transforms, result labels, direct variation buttons, direct Quick Actions, Pattern A/B/C storage, playback, export, save/load, or undo/redo semantics.
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

- plan-514 starts after plan-513 completed, main clean, and 513 completed plans recorded.
- Pattern Fill now exposes the state-derived tail move suggestion before hover/click. Pattern Variation has a hover/focus preview, but the panel does not expose a stable recommendation for Subtle, Hook, or Break.
- Keep this centered on sample-free direct beat composition and selected Pattern variation decisions.
- Add `suggestedPatternVariationPreset` to derive Hook for sparse loops, Break for dense loops, and Subtle for balanced loops from selected Pattern event density.
- Keep the readout UI-local by computing `PatternVariationSuggestionSummary` in `App` from current Pattern state and rendering it before the existing Pattern Variation preview without changing saved project schema, undo history, variation transforms, or hover/focus preview behavior.
