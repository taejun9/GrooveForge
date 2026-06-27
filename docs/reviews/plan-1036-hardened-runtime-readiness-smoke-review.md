# plan-1036-hardened-runtime-readiness-smoke Review

## Summary

Added a local macOS hardened runtime readiness smoke to the release gate. The smoke inspects the packaged app bundle and main executable with local `codesign` display/verify commands, writes a machine-readable readiness summary, and keeps hardened runtime, Developer ID, notarization, Gatekeeper, app-store submission, and external distribution claims unclaimed.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_hardened_runtime_readiness_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:hardened-runtime-readiness-smoke`
- Passed: `npm run release:check`

## Findings

- No blocking findings after QA.

## Residual Risk

- The current local app is still ad-hoc signed and is not hardened-runtime ready. The smoke records missing app/executable runtime flags, ad-hoc signing, and missing Developer ID authority as blockers.
- Actual Developer ID signing, notarization/stapling, Gatekeeper approval, app-store submission, real `/Applications` install, auto-update, and external distribution-channel QA remain intentionally unclaimed.

## Follow-Ups

- Add real Developer ID signing with hardened runtime options before attempting notarization readiness.
- Run notarization, stapling, and Gatekeeper acceptance checks only after a valid Developer ID identity and notary credential path are selected.
