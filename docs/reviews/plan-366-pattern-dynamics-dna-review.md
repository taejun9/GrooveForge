# plan-366-pattern-dynamics-dna Review

## Status

completed

## Findings

No blocking issues found.

## Scope Reviewed

- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/completed/plan-366-pattern-dynamics-dna.md`

## QA Evidence

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Notes

- Pattern DNA now includes a read-only Dynamics card derived from selected Pattern drum, 808, chord, and Synth velocities.
- The card reports average velocity, velocity spread, and per-layer velocity posture while routing Focus through the existing Compose target.
- Existing Pattern DNA focus behavior, Quick Actions Pattern DNA commands, Pattern A/B/C data, arrangement, mixer/master, playback, WAV/stem/MIDI export, and Handoff behavior remain unchanged.
- The change stays UI-only and avoids schema, save/load, automatic dynamics edits, sampling, recording, remote AI, accounts, analytics, or cloud scope.

## Residual Risk

Browser visual QA could not run because `npm run dev -- --host 127.0.0.1 --port 5173` failed with `listen EPERM`, and escalated execution was rejected by the environment policy. No workaround was used.
