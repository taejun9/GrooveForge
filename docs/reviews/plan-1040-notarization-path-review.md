# plan-1040-notarization-path Review

## Summary

Added a gated macOS notarization-path smoke. The smoke requires `GROOVEFORGE_NOTARY_SUBMIT=1` before any Apple notary submission, prepares an isolated notarization DMG only from the Developer ID signed isolated app copy, supports bounded Apple ID, App Store Connect API key, or notarytool keychain-profile credential signals, staples accepted tickets, validates the staple, and keeps primary release artifact signing, notarization, Gatekeeper approval, auto-update, and external distribution claims false.

## QA

- Passed: `node --check harness/scripts/run_desktop_notarization_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run build`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:developer-id-signing-smoke`
- Passed: `npm run desktop:notarization-smoke`
- Passed: `npm run release:check`

## Findings

- No blocking review findings.

## Residual Risk

- The local environment had no Developer ID signed isolated app copy, no notary credential signal, and no `GROOVEFORGE_NOTARY_SUBMIT=1`, so the actual Apple notary submission/stapling branch was not exercised in this run. The blocker path was verified and recorded in `build/desktop/GrooveForge-darwin-arm64-notarization.json`.
- External distribution remains blocked until Developer ID identity selection, notary credentials, explicit notarization submission, stapling, Gatekeeper acceptance, update provider/feed metadata, signed update metadata, and external distribution QA are implemented and verified.

## Follow-Ups

- Run `GROOVEFORGE_DEVELOPER_ID_IDENTITY=<identity> npm run desktop:developer-id-signing-smoke` on a machine with a valid Developer ID Application certificate.
- Then run `GROOVEFORGE_NOTARY_SUBMIT=1 npm run desktop:notarization-smoke` with bounded notary credentials.
- Add Gatekeeper acceptance verification against the notarized/stapled isolated artifact after credentials and distribution target are available.
