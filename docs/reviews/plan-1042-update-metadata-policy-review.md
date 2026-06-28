# plan-1042-update-metadata-policy Review

## Summary

Added a local update metadata policy smoke for the macOS release chain. The smoke reads the release manifest, writes required `latest-mac.yml`, `app-update.yml`, and DMG blockmap policy evidence under ignored `build/desktop/`, keeps feed/channel values out of output, and records Developer ID signing, notarization, Gatekeeper acceptance, and external distribution-channel prerequisites without claiming auto-update support.

`desktop:auto-update-readiness-smoke` now reads that policy and reports policy availability separately from actual signed/notarized update artifact readiness.

## QA

- Passed: `node --check harness/scripts/run_desktop_update_metadata_policy_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run build`
- Passed: `npm run desktop:release-manifest-smoke`
- Passed: `npm run desktop:update-metadata-policy-smoke`
- Passed: `npm run desktop:auto-update-readiness-smoke`
- Passed: `npm run release:check`

## Findings

- No blocking review findings.

## Residual Risk

- Auto-update remains intentionally unclaimed. The current environment has no configured update provider/feed/channel metadata and no Developer ID signed, notarized, stapled, Gatekeeper-accepted release artifact or signed update metadata files.
- The policy is local evidence only; it does not publish `latest-mac.yml`, `app-update.yml`, blockmaps, or a live update feed.

## Follow-Ups

- Configure a bounded update provider/feed/channel after distribution target selection.
- Generate signed/notarized update metadata artifacts only after Developer ID signing, notarization/stapling, and Gatekeeper acceptance are verified.
- Keep feed values and credentials out of committed files and smoke outputs.
