# plan-895-sound-reference-context

## Goal

Expose direct sound-design command context in Sound Command Reference rows so beginners and working producers can discover built-in presets, drum kits, tone focus, timbre checks, Sound Snapshot A/B, and Space FX before opening Quick Actions.

## Scope

- Add static Command Reference row context for Sound Preset Decision, Sound Preset, Drum Kit Decision, Drum Kit, Sound Focus Decision, Sound Focus, Timbre Check, Sound Snapshot A/B Decision, Sound Snapshot A/B, Space FX Decision, and Space FX.
- Keep the focus on built-in sound design, explicit apply/capture/recall/send decisions, local audition cues, and manual follow-up checks.
- Update README, product, quality rules, and QA expectations to lock the new Sound row context.

## Non-Goals

- Do not change command execution, Quick Actions behavior, sound preset application, drum kit application, sound focus application, Timbre Check derivation, Sound Snapshot capture/recall/clear behavior, Space FX send application, playback, render/export, save/load, project schema, or sampling scope.
- Do not add automatic preset application, auto-capture, auto-recall, auto-mixing, auto-mastering, command chains, audio analysis, imported audio, sample browsing, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.

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

## Decision Log

- 2026-06-26: Selected Sound Command Reference context because sound design is part of the direct beat-production spine and the current Sound rows list commands without the richer context already present for Create, Guide, Mix, Finish, and Deliver rows.
