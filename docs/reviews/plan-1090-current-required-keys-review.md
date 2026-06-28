# plan-1090-current-required-keys-review

## Result

Accepted.

## Scope Reviewed

- `harness/scripts/run_release_next_actions.mjs` now exposes value-free `currentRequiredKeyCount` and `currentRequiredKeySummary` fields, keeps `currentRequiredKeys`, and prints the current required key count/names in Markdown and console output.
- README, harness architecture, release readiness, quality rules, and QA text expectations now require the compact next-actions output to surface current required key count/names.
- Release-channel no-env and placeholder-env paths now validate that current required-key fields mirror the first priority action without recording private values.

## QA Evidence

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:next-actions` in missing-source/bootstrap mode; console reported `Current required keys: 0 (none)`.
- Passed: `npm run verify`; no-env release-channel next-actions smoke reported four current required metadata keys.
- Passed: no-env JSON inspection confirmed `currentRequiredKeyCount: 4`, matching `currentRequiredKeys` and first priority action required keys, with `privateValuesRecorded: false` and `localEnvValueRecorded: false`.
- Passed: `npm run release:prepare-env` generated the ignored placeholder env scaffold without private values.
- Passed: `npm run release:next-actions` with placeholder env loaded; current next command moved to `npm run release:doctor`, current required keys stayed at four release-channel metadata keys, and 21 placeholder keys were listed without values.
- Passed: final `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: final `git diff --check`.
- Passed: final `python3 -B harness/scripts/run_qa.py`.

## Findings

- No blocking findings.
- External distribution remains pending by design until private release/channel/update/signing/notary/manual-QA values are provided and the external hard gate passes.

## Follow-Up

- Operators should replace placeholder values in ignored `.env.distribution.local`, rerun `npm run release:doctor`, and continue through signing, notarization, Gatekeeper, manual QA, and `npm run release:external-check`.
