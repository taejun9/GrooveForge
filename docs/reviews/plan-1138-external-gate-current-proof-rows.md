# plan-1138-external-gate-current-proof-rows Review

## Summary

The external distribution gate now reads the external proof bundle when it exists and mirrors the current value-free proof action into the gate JSON, Markdown, console output, and validation. `npm run verify` reruns the external distribution gate after `npm run release:proof-bundle-smoke` so the refreshed gate report shows the same current next command, first blocker, edit guidance rows, proof checklist rows, and command verification rows before release progress reporting.

## QA

- `node --check harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run release:check` passed, including the refreshed post-proof-bundle external distribution gate smoke with proof-bundle source ready and current rows `4/3/4`.

## Findings

- No findings.

## Residual Risk

- External distribution still depends on operator-owned private release-channel values, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, manual QA approval, and upload/distribution evidence. This plan only improves value-free current proof visibility in the gate.

## Follow-Ups

- Continue using `npm run release:external-check` as the hard gate after private values and external distribution evidence are available.
