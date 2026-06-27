# plan-1038-auto-update-menu-integration Review

## Summary

Added a smoke-safe auto-update integration surface using Electron's built-in `autoUpdater`. The desktop Help menu now exposes `Check for Updates...`, keeps launch smoke and missing-feed cases network-free, and handles checking, available, not-available, error, and downloaded update states without claiming auto-update completion.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run desktop:launch-smoke`
- Passed: `npm run release:check`

## Findings

- No blocking findings after QA.

## Residual Risk

- Auto-update is still not ready for external distribution because no provider/feed/channel metadata is configured and no signed/notarized update metadata artifacts exist.
- Developer ID signing, notarization/stapling, Gatekeeper acceptance, app-store submission, real `/Applications` install, and external distribution-channel QA remain intentionally unclaimed.

## Follow-Ups

- Add a signed update provider/feed/channel once the external distribution target is selected.
- Generate signed update metadata only after Developer ID signing and notarization prerequisites are satisfied.
