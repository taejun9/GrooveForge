# plan-901-export-meter-quick-action

## Goal

Expose Export Meter as a real Quick Actions readout so beginners and working producers can search for final mix health, jump to the Master panel, and receive a local result strip with peak, RMS, dynamics, headroom, limiter, ceiling, duration, audition cue, and manual-trim next check before delivery.

## Scope

- Add an `export-meter` Quick Action that routes only to the existing Master panel/export meter area without mutating project data.
- Add deterministic Quick Action result metric and follow-up copy derived only from the existing local export analysis, arrangement duration, master ceiling, and Mix Coach context.
- Update README, product, quality rules, and QA expectations to lock the readout command, result metric, and sampling/privacy boundaries.

## Non-Goals

- Do not change Export Meter analysis, render bytes, WAV/stem/MIDI export, Master Output Role, Master Finish pads, master/mixer state, playback, save/load, project schema, or sampling scope.
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

- Added an `export-meter` Quick Action that opens the existing Master panel/export meter from command search plus Export and Master scopes without mutating project data.
- Added UI-local Quick Action result metric and follow-up copy for peak, RMS, dynamics, headroom, limiter posture, master ceiling, arrangement duration, audition cue, and manual-trim next check.
- Updated README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and out of automatic mastering/export behavior.

## Decision Log

- 2026-06-26: Selected Export Meter Quick Action because plan-898 made the readout discoverable in Command Reference, but the working command palette still lacked a direct final-output meter readout action and result metric.
