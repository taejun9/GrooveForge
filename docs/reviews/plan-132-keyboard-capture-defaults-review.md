# plan-132-keyboard-capture-defaults Review

## Summary

Keyboard Capture now has UI-local defaults for captured note length, Synth velocity, and 808 glide. The defaults live only in React UI state, are shown in the 808/Melody editor, and are applied only when a user explicitly captures a note with A/S/D/F/G/H/J/K.

## QA

- `npm run qa`: passed.
- `npm run verify`: passed.
- `npm run typecheck`: passed.
- `git diff --check`: passed.
- `curl -I http://127.0.0.1:5214/`: passed with `HTTP/1.1 200 OK`.

## Findings

No blocking findings.

## Review Notes

- Capture defaults are UI-local and do not alter project-file schema, save/load migration, snapshots, export, or playback.
- Captured 808 notes use the selected length and glide flag; captured Synth notes use the selected length and velocity.
- Captured notes remain ordinary editable `BassNote` or `MelodyNote` event data.
- Captures still route through `updateCurrentPattern`, so each captured note remains undoable.
- Focused input, textarea, select, and contenteditable targets remain protected by the existing shortcut guard.
- No Web MIDI permission, recording, sampling, imported audio, remote AI, account, analytics, or cloud sync scope was added.

## Residual Risk

In-app Browser click smoke could not run because the `iab` browser session was unavailable. Static QA, typecheck, production build through `npm run verify`, diff check, and local HTTP smoke passed; a later browser-tool pass should click the length, velocity, target, and glide controls and capture one 808/Synth note.

## Follow-Ups

- When browser automation is available, verify that Synth target shows velocity while 808 target shows glide, and that captured notes reflect the selected defaults.
