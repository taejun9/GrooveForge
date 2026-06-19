# plan-469-local-draft-command-reference Review

## Summary

Added read-only Restore Draft and Clear Draft rows to the Command Reference Project section so the existing local draft recovery commands are discoverable without opening or running Quick Actions first. The rows point to Quick Actions/local recovery only and preserve local draft storage, Restore Draft/Clear Draft behavior, Quick Actions routing, project files, undo/redo history, playback/export, MIDI export, Handoff, shortcuts, Native Command Menu behavior, Local Draft Recovery Result behavior, and sampling scope.

## QA

- Passed `git diff --check`
- Passed `python3 harness/scripts/run_qa.py`
- Passed `python3 harness/scripts/run_quality_gate.py`
- Passed `npm run typecheck`
- Passed `npm run build`
- Passed `npm run qa`
- Passed `npm run verify`

## Findings

- No blocking findings.

## Residual Risk

- Browser dev-server verification could not run because the sandbox blocked localhost listening with `listen EPERM`, and the escalation request was rejected by policy.
- Build still reports the existing Vite chunk-size warning for the main app chunk; this is pre-existing and non-blocking.

## Follow-Ups

- Re-run an in-browser Command Reference check for Restore Draft and Clear Draft rows when localhost dev-server execution is available.
