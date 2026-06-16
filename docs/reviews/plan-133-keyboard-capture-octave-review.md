# plan-133-keyboard-capture-octave Review

## Summary

Keyboard Capture now has a UI-local, target-specific octave bank for 808 and Synth note entry. The visible key map and captured notes both use the selected octave, while length, Synth velocity, and 808 glide defaults continue to apply only to newly captured notes.

## QA

- `npm run typecheck`: passed.
- `npm run qa`: passed.
- `npm run verify`: passed.
- `git diff --check`: passed.
- `curl -I http://127.0.0.1:5215/`: passed with `HTTP/1.1 200 OK`.

## Findings

No blocking findings.

## Review Notes

- Octave defaults are stored only in React UI state and are not added to the project file schema, migrations, snapshots, export, or playback state.
- 808 and Synth targets have separate octave defaults and clamp to the existing track octave ranges.
- The key map and captured-note insertion path share `keyboardCapturePitchLanes`, so the visible keyboard bank matches the note that gets inserted.
- Captured notes remain ordinary editable `BassNote` or `MelodyNote` event data routed through `updateCurrentPattern`, preserving undo behavior.
- Capture-default controls wrap responsively to reduce overflow risk in narrower editor panels.
- No Web MIDI permission, recording, sampling, imported audio, sampler track, remote AI, account, analytics, or cloud scope was added.

## Residual Risk

In-app Browser click smoke could not run because the `iab` browser session was unavailable. Static QA, typecheck, production build through `npm run verify`, diff check, and local HTTP smoke passed; a later browser-tool pass should change the octave on both 808 and Synth targets and confirm the key map plus captured note pitch change together.

## Follow-Ups

- When browser automation is available, verify 808 octave bounds 0-3, Synth octave bounds 3-6, and A/S/D/F/G/H/J/K capture the visible pitch bank.
