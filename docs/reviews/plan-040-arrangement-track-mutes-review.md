# plan-040-arrangement-track-mutes Review

## Summary

Arrangement block track mutes are implemented as local project data for Drums, 808, Synth, and Chords. The change supports section-level drops/builds while preserving the product direction as an all-genre beat workstation rather than a sampling-first app.

## QA

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test on `http://127.0.0.1:5173/`: mute controls rendered once each, Drums mute toggled selected state and block badge, export meter changed, Pattern A/B/C counts stayed unchanged, Undo restored the block, playback started/stopped, and console warning/error logs were empty.

## Findings

- No blocking findings.
- Block mutes are scoped to `ArrangementBlock.mutedTracks` and normalized for older projects.
- Selected-pattern preview uses no arrangement mutes, while realtime arrangement playback, full-mix WAV export, and stem export all consult block mutes.
- The UI remains focused on direct beat composition; no sampling-first surfaces were introduced.

## Residual Risk

- Export meter changes rely on the existing non-deterministic noise renderer, so manual RMS comparisons can vary slightly between renders. The browser smoke test verified a visible meter update and unchanged musical event counts.

## Follow-Ups

- Future arrangement automation work can build on the same block-scoped data pattern if users need per-section volume or filter movement.
