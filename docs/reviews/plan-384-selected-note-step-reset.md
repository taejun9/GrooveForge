# plan-384-selected-note-step-reset Review

## Outcome

pass

## Scope Reviewed

- `src/ui/App.tsx`
- `src/ui/selectedEventQuickActions.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Findings

No blocking findings.

## Verification

- `python3 harness/scripts/run_qa.py`: pass
- `python3 harness/scripts/run_quality_gate.py`: pass
- `git diff --check`: pass
- `npm run typecheck`: pass
- `npm run harness:smoke`: pass
- `npm run build`: pass
- `npm run qa`: pass
- `npm run verify`: pass

## Notes

- The selected note step reset command derives its target from the active selected 808/Synth note step, note length, note track, same-track notes, and the existing 16-step grid.
- The command snaps only to a nearest 4-step anchor that can preserve the selected note length inside the grid.
- The command is disabled when there is no active selected note, the note already starts on the target anchor, or another same-track note already occupies the target step and pitch.
- The command reuses the existing selected-note move path, so it changes only `step` while preserving pitch, length, glide, velocity, chance, selected-pattern scoping, collision defense, selection repair, and undo behavior.
- Localhost visual verification was not run because the sandbox blocked dev-server binding with `listen EPERM`, and escalated retry was rejected by policy.
