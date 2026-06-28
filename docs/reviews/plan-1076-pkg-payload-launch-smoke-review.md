# plan-1076-pkg-payload-launch-smoke Review

## Findings

- None.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_pkg_payload_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:dmg-smoke`
- Passed: `npm run desktop:pkg-smoke`
- Passed: `npm run desktop:pkg-payload-smoke`
- Passed: `npm run desktop:install-smoke`
- Expected failure confirmed: `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`

## Residual Risk

- External distribution is still blocked by private inputs, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, auto-update readiness, and channel QA.
- The new smoke proves a local unsigned PKG payload contains a launchable app, but it does not prove a real macOS Installer run into `/Applications`.

## Decision

- Ready to merge.
