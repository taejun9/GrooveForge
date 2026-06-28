# plan-1065-native-project-io-smoke review

## Summary

Plan 1065 adds native desktop project save/open evidence. The new smoke starts production Electron with a project-IO smoke flag, calls the real context-isolated `window.grooveforge.saveProject` and `window.grooveforge.openProject` bridge methods, writes a sample-free `.grooveforge.json` project under ignored `build/desktop/`, reopens exact contents, and verifies the file through domain parser checks.

## QA

- `git diff --check`: passed.
- `node --check harness/scripts/run_desktop_project_io_smoke.mjs`: passed.
- `node --check harness/scripts/run_desktop_entry_smoke.mjs`: passed.
- `python3 -B harness/scripts/run_qa.py`: passed.
- `npm run build`: passed.
- `npm run desktop:project-io-smoke`: passed with external Electron execution after sandboxed Electron aborted before result output.
- `npm run release:check`: passed.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`: failed as expected because private external distribution evidence is incomplete.

## Findings

No blocking findings. The smoke-only dialog bypass is gated by `GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE` and `GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_PATH`, preserving normal visible save/open behavior outside smoke mode.

## Residual Risk

The new smoke proves the production desktop preload bridge and IPC handlers can save and reopen a real project file in an automated hidden-window path. It does not prove manual user dialog behavior, external distribution readiness, Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, or channel QA.

## Follow-Ups

- Keep manual dialog UX checks separate from smoke-only deterministic path coverage.
- External distribution remains gated by the existing hard gate until private inputs and signed/notarized/channel evidence are complete.
