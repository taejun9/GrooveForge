# plan-1267-release-doctor-env-target

## Goal

Fix the release doctor/current-blocker failure when `GROOVEFORGE_DISTRIBUTION_ENV_FILE` points at a placeholder fixture while a default ignored `.env.distribution.local` also exists. The configured env target should be the current release proof source for placeholder edit locations, and the doctor must stay value-free.

## Scope

- Reproduce the failing `release:current-blocker` path with the configured placeholder fixture.
- Update the release env target handling so current release-channel placeholder edit locations do not mix the configured env file with the default ignored env file.
- Keep all release reports free of URL, channel, credential, token, Developer ID identity, and private env values.
- Refresh QA and completion summary evidence after the fix.

## Out of Scope

- Filling real private distribution env values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote update feed publish, or external channel probing.
- Editing `.env.distribution.local`.

## Validation

- Passed: `node --check harness/scripts/distribution_local_env.mjs`
- Passed: `node --check harness/scripts/run_release_prepare_env.mjs`
- Passed: `node --check harness/scripts/run_release_doctor.mjs`
- Passed: `node --check harness/scripts/run_release_next_actions.mjs`
- Passed: `node --check harness/scripts/run_release_channel_live_check.mjs`
- Passed: `node --check harness/scripts/run_release_update_feed_live_check.mjs`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:doctor`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:channel-live-check`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:update-feed-live-check`
- Passed: shared loader probe with `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env`, proving one checked/present env file and value redaction.
- Passed: `npm run qa`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:current-blocker`
- Passed after completion move: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke`
- Passed after completion move: `git diff --check`

## Decision Log

- 2026-07-02: Started after main showed `release:current-blocker` failing because release doctor combined placeholder edit locations from both `.env.distribution.local` and the configured placeholder env fixture.
- 2026-07-02: Fixed the shared local-env loader, release prepare-env audit, release doctor, release-channel live check, update-feed live check, and next-actions location readers so `GROOVEFORGE_DISTRIBUTION_ENV_FILE` is a single active env source rather than an additive candidate.
- 2026-07-02: Kept synthetic unblock/success smokes isolated; they still use their synthetic root and ignore configured overrides when that path is explicitly tested.
