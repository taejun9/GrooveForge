# plan-1269-completion-summary-source-guidance Review

## Summary

Improved `release:completion-summary-smoke` failure guidance when the existing progress-refresh source is missing, stale, or incomplete. The readout-only command now tells operators to use `npm run release:completion-summary-refresh-smoke` for after-work completion reports and `npm run release:progress-refresh-smoke` when only the source bundle needs refreshing.

## Changes Reviewed

- Missing source artifact failures now include both after-work and source-only refresh commands.
- Validation failures caused by stale or incomplete source evidence now include value-free source readiness posture and the same refresh guidance.
- README, harness architecture, release readiness, quality rules, and QA catalog describe the guidance split.
- `release:completion-summary-smoke` remains readout-only and does not run the refresh chain.

## QA

- Passed: `node --check harness/scripts/run_release_completion_summary_smoke.mjs`
- Passed: `python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1269-run_qa.pyc', doraise=True)"`
- Passed: missing-source guidance check for `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-smoke`
- Passed: stale/incomplete-source guidance check with a value-free synthetic ignored build artifact.
- Passed: `npm run qa`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`
- Passed: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke`
- Passed: `git diff --check`
- Passed after completion move: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke`

Completion summary after the plan move reports latest completed plan `plan-1269`, 10-plan progress `1261-1270: 9/10`, user-facing completion `99.999999%`, and remaining completion `0.000001%`.

## Findings

- No review blockers found.

## Residual Risk

- External distribution remains blocked by private release-channel metadata, update-feed metadata, Developer ID signing identity, notary credentials, notarization/stapling, Gatekeeper approval, and manual QA approval. This change only improves value-free source guidance for completion summary evidence.
