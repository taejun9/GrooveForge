# plan-1269-completion-summary-source-guidance

## Goal

Make `npm run release:completion-summary-smoke` fail with actionable stale-source guidance when the required refreshed progress evidence is missing or incomplete, instead of only reporting low-level validation failures.

## Scope

- Reproduce the current standalone `release:completion-summary-smoke` failure mode.
- Update the completion summary smoke so missing/stale source evidence points operators to `npm run release:completion-summary-refresh-smoke` or `npm run release:progress-refresh-smoke`.
- Keep JSON, Markdown, and console output value-free.
- Refresh QA, review, and completion summary evidence after the fix.

## Out of Scope

- Changing completion percentage math.
- Filling real private distribution env values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote update feed publish, or external channel probing.

## Validation

- Reproduced: standalone `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-smoke` failed when the progress refresh source artifact was missing.
- Passed: `node --check harness/scripts/run_release_completion_summary_smoke.mjs`
- Passed: `python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1269-run_qa.pyc', doraise=True)"`
- Passed: missing-source guidance check for `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-smoke`
- Passed: stale/incomplete-source guidance check with a value-free synthetic ignored build artifact.
- Passed: `npm run qa`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke`
- Passed: `git diff --check`
- Passed after completion move: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-02: Started after standalone completion-summary smoke on `main` failed with low-level missing-field assertions when refreshed source artifacts were not current in the working tree.
- 2026-07-02: Added missing/stale/incomplete source guidance that routes after-work reports to `npm run release:completion-summary-refresh-smoke` and source-only refreshes to `npm run release:progress-refresh-smoke`.
- 2026-07-02: Kept `release:completion-summary-smoke` as a readout-only command; it still does not rerun the refresh chain.
