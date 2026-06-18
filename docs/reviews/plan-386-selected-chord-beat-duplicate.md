# plan-386-selected-chord-beat-duplicate Review

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

- The selected chord beat duplicate command derives its target from the active selected chord step, chord length, selected Pattern A/B/C chord events, and the existing 16-step grid.
- The command duplicates only to the next later 4-step anchor that can preserve the selected chord length inside the grid and has no chord at the target step.
- The command is disabled when there is no active selected chord or no valid target anchor is available.
- The command reuses the existing undoable selected-pattern chord insertion path, so it preserves root, quality, inversion, length, velocity, chance, chord clipboard state, selected-pattern scoping, and selection repair.
- Localhost visual verification was not run because the sandbox blocked dev-server binding with `listen EPERM`, and escalated retry was rejected by policy.
