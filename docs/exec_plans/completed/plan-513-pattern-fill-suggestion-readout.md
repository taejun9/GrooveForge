# plan-513-pattern-fill-suggestion-readout

## Goal

Add a UI-local Pattern Fill suggestion readout that shows the current recommended tail move for the selected Pattern before users hover or click a fill pad.

## Why

Pattern Fill already has explicit fill buttons, hover/focus preview, direct Quick Actions, and Next Move recommendations. The default panel preview starts from one fixed preset, while Next Move derives a current fill from the selected Pattern's 808 and Synth density. A stable suggestion readout makes the next tail move visible for beginners and gives producers a fast scan of whether the selected loop wants low-end pickup, melody turn, or drum fill.

## Scope

- Derive the suggestion from the existing selected Pattern A/B/C event counts.
- Share the suggested Pattern Fill helper with Next Move so both surfaces select the same current target.
- Show suggested preset, selected Pattern, event-count posture, and expected tail-change count.
- Keep the readout UI-local and out of saved project data.
- Update product docs, quality rules, and harness expectations.

## Non-Goals

- Do not auto-apply Pattern Fill or change hover/focus preview behavior.
- Do not change Pattern Fill transforms, result labels, direct fill buttons, direct Quick Actions, Pattern A/B/C storage, playback, export, save/load, or undo/redo semantics.
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

- plan-513 starts after plan-512 completed, main clean, and 512 completed plans recorded.
- Pattern Stack and Drum Move already expose current previews tied to their Quick Actions targets. Pattern Fill has a hover/focus preview, but the panel does not expose the same state-derived suggestion used by Next Move.
- Keep this centered on sample-free direct beat composition and selected Pattern tail variation.
- Add `suggestedPatternFillPreset` as the shared helper for the Pattern Fill suggestion readout and Next Move recommendation, keeping both derived from selected Pattern event density.
- Keep the readout UI-local by computing `PatternFillSuggestionSummary` in `App` from current Pattern state and rendering it before the existing Pattern Fill preview without changing saved project schema, undo history, or hover/focus preview behavior.
