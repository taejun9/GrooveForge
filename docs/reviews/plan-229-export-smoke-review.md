# plan-229-export-smoke review

## Summary

Plan 229 adds a local Node runtime smoke harness for the sample-free 8-bar beat/export contract. The smoke executes the real TypeScript domain, render, and MIDI modules, builds an 8-bar beat from built-in project data, verifies full-mix and stem export analysis, validates WAV RIFF/WAVE bytes and file names, and validates deterministic MIDI bytes and file name without browser, Electron, network, imported audio, or media artifact writes.

## Findings

No blocking findings.

## QA

- Passed: `npm run harness:smoke`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run qa`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run verify`
- Blocked by environment: `npm run dev -- --host 127.0.0.1` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`.
- Escalation rejected by policy: `npm run dev -- --host 127.0.0.1`.

## Residual Risk

The runtime smoke verifies deterministic render/export contracts but does not click UI export buttons or verify browser download behavior. Browser smoke remains dependent on an environment that permits localhost binding.

## Follow-Up Recommendations

- Add browser/Electron smoke when the environment allows local server binding.
- Keep future export work wired through the pure analysis/blob helpers so Node smoke can continue to cover the core beat-making export path.
