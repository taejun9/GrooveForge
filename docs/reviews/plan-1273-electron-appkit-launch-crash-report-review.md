# plan-1273-electron-appkit-launch-crash-report Review

## Summary

Reviewed the desktop launch diagnostic update for the user-attached macOS Electron Crash Reporter shape. The shared guard now recognizes AppKit/HIServices registration aborts that surface as `EXC_CRASH (SIGABRT)`, `Namespace SIGNAL, Code 6`, or `Abort trap: 6`, and launch-bearing smokes pass child exit codes into the diagnostic path.

## Changes Reviewed

- `harness/scripts/desktop_gui_launch_guard.mjs` accepts `code`, `signal`, and captured output and classifies the attached exit-code-6 Crash Reporter shape without classifying ordinary AppKit text.
- Desktop launch/package/install smoke scripts pass child exit codes into `macGuiLaunchAbortDetails(...)`.
- `harness/scripts/run_desktop_app.mjs` routes code and signal failures through the shared AppKit abort guard.
- `harness/scripts/run_desktop_entry_smoke.mjs` includes a sanitized regression fixture based on the attached report shape.
- QA expectations and durable docs now describe the AppKit `SIGABRT` / exit-code-6 diagnostic.

## QA

- `node --check harness/scripts/desktop_gui_launch_guard.mjs`
- `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- `node --check` for launch-bearing desktop smoke scripts
- Direct sanitized Crash Reporter guard regression
- `python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1273-run_qa.pyc', doraise=True)"`
- `npm run qa`
- `npm run build`
- `npm run desktop:smoke`
- `npm run desktop:launch-smoke`
- `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`
- `git diff --check`

## Findings

- No blocker findings for the plan-1273 change set.

## Residual Risk

- The change improves restricted/non-GUI launch crash classification; it does not claim restricted sandbox GUI launches should succeed.
- External distribution remains blocked by private release-channel metadata, update feed metadata, Developer ID signing, notarization/stapling, Gatekeeper evidence, and manual channel QA approval.
