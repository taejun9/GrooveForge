# plan-898-export-meter-reference-context

## Goal

Expose Export Meter context in Command Reference so beginners and working producers can discover the existing peak, RMS, dynamics, headroom, limiter, master ceiling, and delivery-readiness readout before final export decisions.

## Scope

- Add static Command Reference row context for Export Meter.
- Keep the focus on deterministic local render analysis before delivery: peak, RMS, dynamics, headroom, limiter activity, master ceiling, arrangement length, Mix Coach/Export Preflight follow-up, audition cue, and manual-trim next check.
- Update README, product, quality rules, and QA expectations to lock the new Export Meter row context.

## Non-Goals

- Do not change command execution, Quick Actions behavior, Export Meter analysis, render bytes, WAV/stem/MIDI export, Mix Coach scoring, Export Preflight scoring, master/mixer state, playback, save/load, project schema, or sampling scope.
- Do not add dynamic Command Reference state, command execution from reference rows, auto-mastering, auto-export, LUFS/true-peak/platform-compliance claims, media uploads, reference-track analysis, imported audio, sample browsing, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.

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

- Added a static Export Meter row to the Finish Command Reference section with peak, RMS, dynamics, headroom, limiter, master ceiling, arrangement duration, Mix Coach follow-up, and Export Preflight route context.
- Updated README, product docs, quality rules, and QA expectations so deterministic final-output meter context stays discoverable through row context, search matching, Search Spotlight, title, and aria-label text.

## Decision Log

- 2026-06-26: Selected Export Meter Command Reference context because final beat delivery depends on the existing deterministic export readout, but the Command Reference only exposes Export Meter as a glossary term rather than a discoverable Finish/Deliver check.
