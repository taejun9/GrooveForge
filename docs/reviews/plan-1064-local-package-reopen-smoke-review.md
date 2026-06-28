# plan-1064-local-package-reopen-smoke Review

## Summary

Added a local package reopen smoke that reads the real sample-free 8-bar delivery package from ignored `build/desktop/`, verifies manifest paths, byte sizes, SHA-256 checksums, WAV/MIDI headers, Handoff sections, project-file roundtrip, and regenerated mix WAV, four stem WAVs, arrangement MIDI, and Handoff output from the reopened project.

The work also canonicalized render noise seed input with stable object-key ordering so saved and reopened `.grooveforge.json` projects render matching drum-noise output.

## QA

- `node --check harness/scripts/run_desktop_local_package_reopen_smoke.mjs` passed.
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` passed.
- `git diff --check` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run desktop:local-delivery-package-smoke` passed.
- `npm run desktop:local-package-reopen-smoke` passed and verified 8/8 artifacts totaling 18,045,311 bytes.
- `npm run release:check` passed with the new smoke in the verify chain after the local delivery package smoke.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected because private external-distribution evidence is incomplete.

## Findings

- No blocking issues found.

## Residual Risk

- External distribution is still not complete. The hard gate continues to fail until private distribution inputs, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, auto-update/channel metadata, and manual QA approval are real and verified.
- The reopen smoke proves deterministic package durability for the current generated local package. It does not replace manual musical review by a real producer on real hardware.

## Follow-Ups

- Complete the external distribution prerequisites in a future plan when real private distribution values, Developer ID credentials, notary credentials, update provider/channel metadata, and manual QA approval are available.
