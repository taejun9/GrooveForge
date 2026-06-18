# plan-349-arrangement-mute-map Review

## Summary

Added Arrangement Mute Map as a UI-local Arrange panel that scans Drums, 808/Bass, Chords, and Synth mute posture across arrangement sections. The feature derives from existing arrangement `mutedTracks`, bar spans, sections, Pattern assignments, and playback index, then exposes focus-only UI buttons and Quick Actions that jump back to Arrange without mutating project data.

## QA

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large-chunk warning.
- `npm run qa` passed.
- `npm run verify` passed with the existing Vite large-chunk warning.
- `git diff --check` passed.

## Findings

- No blocking findings.

## Residual Risk

- Visual browser verification was attempted, but localhost binding was blocked by the sandbox and `file://` navigation was blocked by in-app Browser URL policy. Automated QA, typecheck, build, and runtime smoke passed.
- Vite still reports the existing large-chunk warning during production build; this plan did not change chunking.

## Follow-Ups

- Run a manual/in-app browser visual pass when localhost browser verification is available.
