# plan-868-arrangement-maps-reference-context

## Goal

Make the Command Reference Arrangement Mute Map and Arrangement Transition Map rows expose the layer-dropout, section-handoff, priority, focus/cue, action route, audition cue, and next-check context already available from local arrangement map guidance.

## Scope

- Add static Arrangement Mute Map and Arrangement Transition Map Command Reference row context for arrangement-map diagnostics.
- Keep both rows discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Arrangement Mute Map derivation, Arrangement Transition Map derivation, focus routing, cue routing, selected-block navigation, arrangement data, Pattern data, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, map scoring changes, hidden generation, automatic arrangement writing, automatic mute or transition fixes, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: Vite reported the existing large chunk warning during `npm run build` and `npm run verify`.

## Implementation Notes

- Updated the Command Reference Arrangement Mute Map and Arrangement Transition Map rows from compact target-only entries to static context rows that name layer dropouts, mute/live posture, priority lane, section handoffs, energy changes, muted-layer changes, event density, focus/cue route, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so arrangement-map discovery stays aligned with local diagnostics, focus routing, and cue routing.
- Added QA expectations for the new docs, quality rule, row targets, and row contexts.

## Decision Log

- Arrangement maps should read as local arrangement diagnostics for layer dropouts and section handoffs rather than automatic arrangers, hidden generators, or sampling workflows.
- Keep Arrangement Maps Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
