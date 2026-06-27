# plan-1031-adhoc-signing-smoke Review

## Summary

Added a local macOS ad-hoc signing smoke between package and DMG/manifest validation. The release gate now proves the packaged `GrooveForge.app` can be ad-hoc signed, verified with `codesign`, launched through the hidden-window production smoke, preserved inside the DMG, and recorded in the release manifest without claiming Developer ID signing or notarization.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_release_manifest_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_dmg_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:dmg-smoke`
- Passed: `npm run desktop:release-manifest-smoke`
- Passed: `npm run release:check`

## Findings

- No blocking findings after QA.

## Residual Risk

- Developer ID signing, hardened runtime readiness, notarization, Gatekeeper approval, auto-update, app-store submission, and external distribution-channel QA remain intentionally unclaimed.
- The ad-hoc signature proves local signing and launch integrity only; external distribution still requires Apple developer credentials and distribution-channel validation.

## Follow-Ups

- Add Developer ID signing and notarization only after a distribution target, certificate identity, and notary credentials are selected.
