# plan-1273-electron-appkit-launch-crash-report

## Goal

Make the desktop launch diagnostics explicitly recognize the attached macOS Electron Crash Reporter shape, including `Namespace SIGNAL, Code 6` / `Abort trap: 6`, so launch-bearing smokes report the restricted/non-GUI AppKit registration path instead of a generic missing-result failure.

## Scope

- Extend the shared desktop GUI launch guard to accept child-process exit codes in addition to signals and captured output.
- Pass Electron child exit codes into AppKit abort diagnostics across launch-bearing desktop smokes.
- Add a sanitized regression fixture based on the attached Crash Reporter log to `desktop:smoke`.
- Update docs and QA expectations for the exit-code-6 Crash Reporter classifier.

## Out of Scope

- Changing Electron, React, renderer, project-file, audio, export, signing, notarization, Gatekeeper, update feed, or distribution behavior.
- Claiming that restricted sandbox GUI launches should work; they should still be blocked or classified with a rerun action.
- Recording the full attached crash report or user/device-specific crash metadata.

## Validation

- `node --check harness/scripts/desktop_gui_launch_guard.mjs`
- `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- `node --check` for launch-bearing desktop smoke scripts that now pass child exit codes into AppKit abort diagnostics.
- Direct sanitized Crash Reporter fixture regression: `isMacAppKitAbort({ code: 6, signal: null, output })` returns true for the attached report shape and false for non-abort AppKit text.
- `python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1273-run_qa.pyc', doraise=True)"`
- `npm run qa`
- `npm run build`
- `npm run desktop:smoke`
- `npm run desktop:launch-smoke`
- `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`
- `git diff --check`

## Decision Log

- 2026-07-02: The user attached a macOS Electron Crash Reporter log showing `EXC_CRASH (SIGABRT)`, `Namespace SIGNAL, Code 6`, `Abort trap: 6`, AppKit/HIServices registration frames, and Codex as the responsible process. Previous diagnostics covered `SIGABRT` and AppKit text; this plan pins the exact exit-code-6 report shape as a regression case.
- 2026-07-02: Full `npm run verify` passed after the shared guard and all launch-bearing desktop smokes accepted the child exit-code path without changing normal Electron launch behavior.
