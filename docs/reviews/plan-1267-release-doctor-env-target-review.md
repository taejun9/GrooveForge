# plan-1267-release-doctor-env-target Review

## Summary

Fixed a release reporting bug where `GROOVEFORGE_DISTRIBUTION_ENV_FILE` was treated as an additional local env source instead of the active override. With both default `.env.distribution.local` and the configured placeholder fixture present, release doctor could combine duplicate placeholder edit locations and fail its own validation.

## Changes Reviewed

- Shared distribution local-env loader now uses the configured env file as the single active source when `GROOVEFORGE_DISTRIBUTION_ENV_FILE` is set.
- Release prepare-env, release doctor, release-channel live-check, update-feed live-check, and next-actions location readers now follow the same override rule.
- Release doctor displays out-of-repo configured fixture paths by basename, matching other redacted reports.
- README, harness architecture, quality rules, and QA catalog document and guard the override behavior.

## QA

- Passed: syntax checks for all modified release env/report scripts.
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:doctor`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:channel-live-check`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:update-feed-live-check`
- Passed: shared loader override probe: one checked/present configured env file, 22 placeholder keys, values not recorded.
- Passed: `npm run qa`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:current-blocker`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke`
- Passed: `git diff --check`

## Findings

- No review blockers found.

## Residual Risk

- Real external distribution remains blocked by private operator-owned release metadata, update-feed metadata, Developer ID signing identity, notary credentials, notarization/stapling, Gatekeeper approval, and manual QA approval. This change does not attempt to create or store those values.
