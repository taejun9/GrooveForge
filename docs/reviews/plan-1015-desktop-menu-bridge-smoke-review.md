# plan-1015-desktop-menu-bridge-smoke review

## Summary

Plan 1015 strengthens `npm run desktop:smoke` so the desktop native menu bridge checks Electron main command IDs, preload allowlist validation, renderer `NativeMenuCommand` declarations, and `handleNativeMenuCommand` routing to the existing workstation handlers. It updates README, harness architecture, quality rules, and QA expectations without changing app behavior.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run harness:smoke`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Findings

- None.

## Residual Risk

- The smoke still intentionally avoids launching Electron GUI windows. It proves the desktop artifact and native menu bridge contract after build, while manual window behavior remains covered by `npm run desktop` when a GUI check is explicitly needed.

## Follow-Ups

- Add installer, signing, notarization, or auto-update validation only when a desktop distribution plan explicitly starts.
- Keep native menu additions tied to existing renderer handlers unless a future plan introduces a deliberate command expansion.
