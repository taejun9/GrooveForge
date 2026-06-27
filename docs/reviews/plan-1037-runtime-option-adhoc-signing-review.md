# plan-1037-runtime-option-adhoc-signing Review

## Summary

Moved the local macOS signed artifact closer to external distribution readiness by adding hardened-runtime ad-hoc signing with explicit Electron runtime entitlements. The signing smoke now verifies app and executable runtime flags, required entitlements, ad-hoc signature posture, no Developer ID authority claim, and a successful signed-app launch. The release manifest records runtime flag and entitlement evidence.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_hardened_runtime_readiness_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_release_manifest_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:hardened-runtime-readiness-smoke`
- Passed: `npm run desktop:dmg-smoke`
- Passed: `npm run desktop:release-manifest-smoke`
- Passed: `npm run release:check`

## Findings

- No blocking findings after QA.

## Residual Risk

- The app remains ad-hoc signed and is not externally distributable. Developer ID signing, notarization/stapling, Gatekeeper acceptance, app-store submission, real `/Applications` install, auto-update, and external distribution-channel QA remain intentionally unclaimed.
- The Electron runtime entitlements are necessary for the local hardened-runtime launch smoke, but a real Developer ID release still needs final entitlement review before notarization.

## Follow-Ups

- Add a real Developer ID signing path once a valid Developer ID Application identity is available.
- Run notarization, stapling, and Gatekeeper acceptance checks only after the Developer ID and notary credential prerequisites pass.
