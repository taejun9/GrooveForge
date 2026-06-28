# plan-1086-placeholder-next-actions Review

## Summary

Plan 1086 makes external next-actions use the placeholder key evidence produced by private-input checks. `release:doctor` and `release:external-preflight` now carry local env placeholder key names/counts, and `release:next-actions` turns loaded placeholder env state into an explicit release-channel cleanup action. When placeholders remain, the release-channel action uses `npm run release:doctor` as the next command after editing and keeps placeholder cleanup as the first blocker.

## Findings

- None.

## QA

- Passed: `node --check harness/scripts/run_release_doctor.mjs`.
- Passed: `node --check harness/scripts/run_release_external_preflight.mjs`.
- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:prepare-env`.
- Passed: `npm run verify`.
- Verified generated external next-actions JSON reports `localEnvPlaceholderKeyCount: 22`, keeps `privateValuesRecorded: false` and `localEnvValueRecorded: false`, makes the release-channel next command `npm run release:doctor`, and makes placeholder cleanup the first release-channel blocker without recording values.
- Passed: `npm run release:next-actions`.
- Passed after full validation: `git diff --check`.
- Passed after full validation: `python3 -B harness/scripts/run_qa.py`.

## Residual Risk

External distribution still requires an operator to replace placeholder values in the ignored local env file, provide real Developer ID/notary/manual QA inputs, and pass `npm run release:external-check`.
