# plan-043-key-retarget-patterns Review

## Summary

Key changes now retarget all Pattern A/B/C 808/bass note pitches, melody note pitches, and chord roots by scale degree. The Key selector uses undoable project history, clears stale note/drum selection, and keeps the workflow centered on direct beat composition rather than sampling.

## QA

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke: F minor to A minor kept Pattern A/B/C event counts at `A34 / B41 / C26`, retargeted visible 808 notes to A minor (`A1`, `E2`, `G2`), retargeted visible Synth notes to A minor (`A4`, `C5`, `E5`, `G5`), retargeted chord roots to `Amin / Fmaj / Cmaj / Gmaj`, undo restored F minor, playback started/stopped, and console errors were empty.

## Findings

- No blocking issues found.
- The change preserves event timing, length, velocity, glide, and chance fields by copying only pitch/root values.
- Arrangement, mixer, sound-design, master, and sampling-related surfaces were not modified.

## Residual Risk

Nearest-degree mapping for out-of-scale notes is intentionally conservative and may not match advanced reharmonization expectations. That belongs in a later music-theory plan, not this key-retarget fix.

## Follow-Ups

- Add richer key/mode support only after the current all-genre beat workstation flow remains stable.
- Consider a visible "transpose project" affordance if users need semitone-based transposition separate from scale-degree retargeting.
