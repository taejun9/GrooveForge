# plan-385-selected-note-beat-duplicate Review

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

- The selected note beat duplicate command derives its target from the active selected 808/Synth note step, note length, note track, note pitch, same-track notes, and the existing 16-step grid.
- The command duplicates only to the next later 4-step anchor that can preserve the selected note length inside the grid and has no same-track note at the target step and pitch.
- The command is disabled when there is no active selected note or no valid target anchor is available.
- The command reuses the existing undoable selected-pattern note insertion path, so it preserves pitch, length, glide, velocity, chance, note clipboard state, selected-pattern scoping, and selection repair.
- Localhost visual verification was not run because the sandbox blocked dev-server binding with `listen EPERM`, and escalated retry was rejected by policy.
