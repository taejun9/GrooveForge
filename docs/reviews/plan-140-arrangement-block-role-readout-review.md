# plan-140-arrangement-block-role-readout review

## Summary

Plan 140 adds a selected-arrangement-block role readout to the arrangement editor. The UI reports song role, timeline span, Pattern A/B/C assignment, length, energy, event count, and mute posture from local selected block and timeline fields only.

## QA

- `npm run qa`: pass
- `npm run verify`: pass
- `git diff --check`: pass
- Built-asset token scan: pass
- HTTP smoke on local Vite server: pass
- Headless Chrome CDP UI smoke: pass

## Findings

No blocking findings.

## Review Notes

- The readout is UI-only and does not change arrangement block data shape, saved project schema, playback, export, MIDI, render behavior, Song Form Overview semantics, Structure Lens semantics, or sampling scope.
- Selecting the first block showed `Setup / Bars 1-2`; selecting the second block updated the readout to `Pocket / Bars 3-6`.
- Existing section, Pattern A/B/C assignment, mutes, bars, energy, copy/paste, split/merge, duplicate, move, undo, and export-driven arrangement behavior remains driven by editable arrangement data.

## Residual Risk

The in-app Browser tool was not exposed in this session, so UI smoke used headless Chrome CDP against `http://127.0.0.1:5223/`. The tested desktop viewport had no horizontal overflow in the readout.
