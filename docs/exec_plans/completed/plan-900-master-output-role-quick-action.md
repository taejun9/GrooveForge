# plan-900-master-output-role-quick-action

## Goal

Expose Master Output Role as a real Quick Actions readout so beginners and working producers can search for final output posture, jump to the Master panel, and receive a local result strip with master preset, export status, ceiling, output gain, headroom, limiter, audition cue, and manual-trim next check.

## Scope

- Add a `master-output-role` Quick Action that routes only to the existing Master panel/readout without mutating project data.
- Add deterministic Quick Action result metric and follow-up copy derived only from the existing local Master Output Role summary and export analysis.
- Update README, product, quality rules, and QA expectations to lock the readout command, result metric, and sampling/privacy boundaries.

## Non-Goals

- Do not change Master Output Role derivation, Export Meter analysis, Master Finish pads, master/mixer state, render bytes, WAV/stem/MIDI export, playback, save/load, project schema, or sampling scope.
- Do not add automatic mastering, auto-export, platform loudness promises, LUFS/true-peak claims, reference-track analysis, media uploads, imported audio, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

Notes:

- `npm run verify` confirmed runtime smoke for 14/14 sample-free Beat Blueprints and 14/14 supported style profiles.
- `npm run build` still reports the existing Vite large chunk warning for the main app chunk; build exits successfully.

## Completion Notes

- Added a `master-output-role` Quick Action that opens the existing Master panel/readout from command search and Master scope without mutating project data.
- Added UI-local Quick Action result metric and follow-up copy for final-output role, master preset/export status, ceiling, output gain, headroom, limiter posture, audition cue, and manual-trim next check.
- Updated README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and out of automatic mastering/export behavior.

## Decision Log

- 2026-06-26: Selected Master Output Role Quick Action because plan-899 made the readout discoverable in Command Reference, but the working command palette still lacked a direct final-output-role readout action and result metric.
