# plan-137-chord-harmonic-readout review

## Summary

Plan 137 adds a selected-chord harmonic readout to the chord editor. The UI reports roman-style function, scale degree, practical role, and chord/inversion detail from the local project key and selected chord fields only.

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

- The readout is UI-only and does not change chord event shape, saved project schema, playback, export, MIDI, render behavior, or sampling scope.
- In-key chords show roman/function detail; out-of-key chord roots are labeled without mutating the chord.
- The product framing remains beat-composition first, with sampling kept out of the MVP center.

## Residual Risk

The in-app Browser tool was not exposed in this session, so UI smoke used headless Chrome CDP against `http://127.0.0.1:5221/`. A narrow viewport keeps the app's dense workstation layout horizontally scrollable, but the new harmonic readout itself did not overflow.
