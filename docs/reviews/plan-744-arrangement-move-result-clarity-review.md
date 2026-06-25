# plan-744-arrangement-move-result-clarity-review

## Summary

Improved Quick Actions Arrangement Move result clarity. Command-palette move commands now report the applied selected-block move preset, selected block scope, section, Pattern A/B/C assignment, bar length, energy, mute posture, changed-field count, song block count, and total bars in the existing local Quick Action Result.

## Findings

No blocking findings.

## Verification

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.

## Scope Notes

- Arrangement Move commands still route through the existing `applyArrangementMoveToSelected` path.
- The result metric now distinguishes the applied selected-block move preset and reports selected-block section, Pattern, bars, energy, mute posture, changed fields, and arrangement scope instead of only showing generic average energy.
- Arrangement Move preset definitions, Priority/Decision derivation, apply routing, Pattern A/B/C musical events, manual arrangement controls, playback scheduling, render/export, MIDI export, Handoff, remote behavior, and sampling scope remain unchanged.
