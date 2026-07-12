# plan-1427-transport-essentials review

## Summary

The transport command strip now distinguishes always-needed playback and project-safety controls from session diagnostics and delivery formats. Guided users receive a readable top bar, while Studio users automatically see the full professional context and export surface.

## QA Evidence

- `npm run qa`: passed.
- `npm run typecheck`: passed.
- `npm run renderer:smoke`: passed with direct status/transport/project controls before collapsed Session Context and Exports.
- `npm run workflow:smoke`: passed for Guided first-beat and Studio fast-pass workflows.
- `npm run persona:smoke`: passed for first-time composer and professional producer readiness, package, reopen, and export paths.
- `npm run build`: passed; existing nonfatal chunk-size warning remains.
- `npm run desktop:launch-smoke`: passed at 1440×928 with 98 required test IDs, direct Play/Save, Guided collapse, Studio expansion, and visual evidence.
- `npm run desktop:project-io-smoke`: passed native save/open and 2/2 audience starter roundtrips.
- `npm run delivery:bundle-zip-smoke`: passed the 10-entry delivery ZIP, manifest, CRC-32, file safety, and artifact verification.
- `git diff --check`: passed.

## Findings

No blocking findings remained after QA.

## Preservation Checks

- Play, loop scope, metronome, Actions, Help, Undo, Redo, Open, and Save remain directly visible and focusable.
- Tap Tempo, transport-position context, edit history, and keyboard posture retain their existing behavior and test IDs.
- WAV, stems, MIDI, Handoff Sheet, and bundle actions retain their handlers, labels, titles, and explicit local-write behavior.
- Native summary controls support pointer, Enter, and Space activation through their click handlers.
- Guided/Studio mode transitions are exercised through the same shared handler used by the other professional helper surfaces.
- Narrow layouts use full-width groups, two-column buttons, and a full-row loop selector without adding horizontal overflow rules.
- No musical input, playback, scheduling, project, render, export-byte, schema, or remote behavior changed.

## Residual Risk

The existing large frontend chunk warning remains. Studio intentionally expands both secondary groups and therefore uses more vertical top-bar space; this is an explicit professional-mode tradeoff and the controls wrap rather than overflow.

## Verdict

Approved. No blocking findings remain.
