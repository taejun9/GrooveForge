# plan-1268-release-progress-update-feed-checkpoint

## Goal

Fix the `release:progress-smoke` failure where the update-feed checkpoint evidence does not mirror the current completed-plan 10-plan progress after plan-1267, blocking `release:current-blocker` and completion-summary refresh.

## Scope

- Reproduce the failing `release:progress-smoke` path with the configured placeholder fixture.
- Update release progress or update-feed checkpoint evidence handling so the checkpoint 10-plan label/count mirrors the current completed plan window.
- Keep all release reports value-free and avoid storing URL, channel, credential, token, Developer ID identity, or private env values.
- Refresh QA, review, and completion summary evidence after the fix.

## Out of Scope

- Filling real private distribution env values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote update feed publish, or external channel probing.
- Editing `.env.distribution.local` or any real private env file.

## Validation

- Reproduced: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:current-blocker` failed because `release:progress-smoke` read stale update-feed checkpoint 10-plan evidence.
- Passed: `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- Passed: `python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1268-run_qa.pyc', doraise=True)"`
- Passed: `npm run qa`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:current-blocker`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:progress-smoke`
- Passed: `git diff --check`
- Passed after completion move: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-02: Started after `release:current-blocker` failed because `release:progress-smoke` reported stale update-feed checkpoint 10-plan progress after plan-1267.
- 2026-07-02: Added `npm run release:update-feed-checkpoint-smoke` to the non-smoke `release:current-blocker` refresh sequence before `npm run release:progress-smoke`, so progress reads a current checkpoint label.
- 2026-07-02: Kept `release:current-blocker-smoke` existing-evidence behavior unchanged for `npm run verify`.
