# plan-134-keyboard-capture-degrees Review

## Summary

Keyboard Capture key tiles now show UI-only scale-degree labels beside each visible pitch. The degree labels derive from the current key map order, so users can scan root, third, fifth, and octave positions while the captured note pitch still comes from the same existing pitch lane calculation.

## QA

- `npm run typecheck`: passed.
- `npm run qa`: passed.
- `npm run verify`: passed.
- `git diff --check`: passed.
- `curl -I http://127.0.0.1:5216/`: passed with `HTTP/1.1 200 OK`.
- Bundle token smoke for `keyboard-capture-degree`, `degreeLabel`, `D1`, and `8ve`: passed.

## Findings

No blocking findings.

## Review Notes

- Degree labels are UI-only `KeyboardCaptureKeyMapItem` metadata and are not added to project state, project file schema, migrations, snapshots, export, or playback.
- Capture insertion still uses `keyboardCapturePitchForKey` with `keyboardCapturePitchLanes`; degree labels do not change pitch, step, length, velocity, glide, chance, undo, or selected-note behavior.
- Key tile styling reserves stable areas for key, pitch, and degree text with overflow handling.
- Focused input, textarea, select, and contenteditable shortcut guards remain unchanged.
- No Web MIDI permission, recording, sampling, imported audio, sampler track, remote AI, account, analytics, or cloud scope was added.

## Residual Risk

In-app Browser click smoke could not run because the `iab` browser session was unavailable. Static QA, typecheck, production build through `npm run verify`, diff check, bundle token smoke, and local HTTP smoke passed; a later browser-tool pass should visually confirm degree labels in the Keyboard Capture key map after changing target, key, and octave.

## Follow-Ups

- When browser automation is available, verify that 808 and Synth key tiles show the expected `D1` through `D7` plus `8ve` labels and that changing key/octave updates pitch labels without moving degree labels out of the key tiles.
