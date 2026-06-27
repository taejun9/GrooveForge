# plan-1033-install-path-smoke Review

## Summary

Added a local DMG install-path smoke to the release gate. The new smoke mounts the generated DMG, copies `GrooveForge.app` into an ignored simulated Applications directory, verifies branded payload and retained ad-hoc signature, then launches the installed copy through the hidden-window production smoke.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_install_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:adhoc-sign-smoke`
- Passed: `npm run desktop:dmg-smoke`
- Passed: `npm run desktop:install-smoke`
- Passed: `npm run release:check`

## Findings

- No blocking findings after QA.

## Residual Risk

- This proves a local simulated install path only. It does not install into the real `/Applications` directory.
- Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, and external distribution-channel QA remain intentionally unclaimed.

## Follow-Ups

- Add real external install-path and Gatekeeper validation only after Developer ID signing and notarization credentials are available.
