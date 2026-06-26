# plan-890-setup-create-reference-context

## Goal

Make the Command Reference Create setup rows expose Tap Tempo pulse, Tempo Nudge routes, Swing Feel posture, Key Retarget route, Style Quick Picks direction, local result feedback, audition cue, and next setup check already available from local setup guidance.

## Scope

- Add static Command Reference row context for Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, and Style Quick Picks.
- Keep the rows discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Tap Tempo history, delayed BPM commit behavior, Tempo Nudge calculation, Swing Feel derivation, Key Retarget routing, Style Quick Pick routing, result copy, project data, playback, export, and sampler scope.

## Non-Goals

- No automatic tempo detection, audio input analysis, recording, beat detection, hidden tempo automation, auto-retargeting, auto-applying styles, style-profile changes, hidden generation, tutorials, macros, command chains, dynamic Command Reference state, command execution from Command Reference rows, sampling, imported audio, sampler devices, remote AI, accounts, analytics, cloud sync, playback changes, export changes, or schema changes.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Added Command Reference row context for Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, and Style Quick Picks in the Create section.
- Updated README, product docs, quality rules, and QA expectations so setup context stays discoverable through Command Reference search, Search Spotlight, row title, and aria-label behavior.
- Preserved local explicit setup orientation only; no automatic tempo detection, audio input analysis, auto-retargeting, auto-applying styles, hidden generation, command chains, project data changes beyond existing explicit handlers, playback changes, export changes, remote behavior, or sampler scope changes.

## Decision Log

- Setup Create Command Reference rows should read as local first-beat setup orientation, not as automatic tempo/key/style detection or hidden generation.
