# plan-275-input-capture-quick-actions-review

## Summary

Added Quick Actions for direct input capture setup: Set capture target to 808, Set capture target to Synth, and MIDI Arm/Disarm. The commands route through existing UI-local target and MIDI arm state, do not insert notes, and keep project schema, playback, export, Handoff, and sampling boundaries unchanged.

## QA

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run harness:smoke`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run qa`: passed.
- `npm run verify`: passed.
- `git diff --check`: passed.

## Findings

- No blocking findings.

## Residual Risk

- Localhost browser smoke could not run because `npm run dev -- --host 127.0.0.1 --port 5300` failed with `listen EPERM`, and the required escalated retry was rejected by environment policy. Static QA, runtime smoke, typecheck, production build, and full verify passed instead.

## Follow-Ups

- When localhost binding is allowed, manually confirm Quick Actions search for `capture`, `808`, `Synth`, and `MIDI`, plus disabled/current target states and MIDI Arm/Disarm behavior with a connected MIDI input.
