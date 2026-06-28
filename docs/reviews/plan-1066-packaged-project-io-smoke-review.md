# plan-1066-packaged-project-io-smoke Review

## Status

passed

## Summary

Plan 1066 adds packaged desktop project IO evidence. The new smoke launches the assembled macOS `GrooveForge.app`, exercises the bundled preload bridge plus IPC save/open handlers, writes and reopens an ignored sample-free `.grooveforge.json`, verifies exact contents and parser roundtrip, and keeps private values plus external-distribution claims false.

## Findings

No blocking findings.

## QA

- `git diff --check` passed.
- `node --check harness/scripts/run_desktop_packaged_project_io_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_entry_smoke.mjs` passed.
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run build` passed.
- `npm run desktop:package-smoke` passed.
- `npm run desktop:packaged-project-io-smoke` passed and wrote packaged project IO Markdown/JSON artifacts under ignored `build/desktop/`.
- `npm run release:check` passed.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected because external distribution evidence is still incomplete.

## Residual Risk

This proves local packaged app project-file save/open behavior. It does not prove Developer ID signing, notarization/stapling, Gatekeeper approval, auto-update, manual distribution QA approval, release upload, app-store submission, or external distribution completion.

## Follow-Ups

- Continue resolving external distribution blockers only when real private release inputs and operator approval are available.
