# plan-1067-installed-project-io-smoke-review

## Status

complete

## Scope

Added installed desktop project IO evidence for the simulated Applications copy produced by the local DMG install smoke.

## Findings

- No blocking findings.
- The hard external distribution gate still fails as expected because private distribution inputs, distribution-channel QA, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, and auto-update readiness are not externally proven.

## QA

- `git diff --check` passed.
- `node --check harness/scripts/run_desktop_installed_project_io_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_entry_smoke.mjs` passed.
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run build` passed.
- `npm run desktop:package-smoke` passed.
- `npm run desktop:packaged-project-io-smoke` passed.
- `npm run desktop:adhoc-sign-smoke` passed.
- `npm run desktop:hardened-runtime-readiness-smoke` passed with Developer ID blockers recorded.
- `npm run desktop:dmg-smoke` passed.
- `npm run desktop:install-smoke` passed.
- `npm run desktop:installed-project-io-smoke` passed.
- `npm run release:check` passed.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected until external distribution evidence is supplied.

## Summary

`desktop:installed-project-io-smoke` now launches `build/desktop/.../install-smoke/Applications/GrooveForge.app`, uses the installed app's bundled main/preload/IPC save-open path, verifies byte-for-byte project roundtrip plus parser roundtrip for a sample-free 8-bar `beat_store` project, and records no private values or external-distribution claims. `npm run verify` runs it after `desktop:install-smoke` and before Gatekeeper readiness.

## Residual Risk

This is simulated installed-app evidence only. It does not prove real `/Applications` installation, Developer ID signing, notarization, Gatekeeper approval, auto-update, release upload, manual QA approval, app-store submission, or external distribution completion.
