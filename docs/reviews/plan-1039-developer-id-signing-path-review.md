# plan-1039-developer-id-signing-path Review

## Summary

Added an explicit local Developer ID signing-path smoke for macOS packaging. The smoke requires `GROOVEFORGE_DEVELOPER_ID_IDENTITY`, signs only an isolated copy under ignored `build/desktop/.../developer-id-signing-smoke/` when a matching Developer ID Application identity exists, verifies Developer ID authority, bundle id, hardened runtime flags, and Electron runtime entitlements, and keeps primary release artifact signing, notarization, Gatekeeper approval, auto-update, and external distribution claims false.

## QA

- Passed: `node --check harness/scripts/run_desktop_developer_id_signing_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run build`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:developer-id-signing-smoke`
- Passed: `npm run release:check`

## Findings

- No blocking review findings.

## Residual Risk

- The local environment had no Developer ID Application identity and no `GROOVEFORGE_DEVELOPER_ID_IDENTITY`, so the real Developer ID signing branch was not exercised in this run. The blocker path was verified and recorded in `build/desktop/GrooveForge-darwin-arm64-developer-id-signing.json`.
- External distribution remains blocked until Developer ID identity selection, notary credentials, notarization/stapling, Gatekeeper acceptance, update provider/feed metadata, signed update metadata, and external distribution QA are implemented and verified.

## Follow-Ups

- Run `GROOVEFORGE_DEVELOPER_ID_IDENTITY=<identity> npm run desktop:developer-id-signing-smoke` on a machine with a valid Developer ID Application certificate.
- Add notarization/stapling and Gatekeeper acceptance verification after credentials and distribution target are available.
