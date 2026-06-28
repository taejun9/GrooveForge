# plan-1087-current-next-command Review

## Scope

- Added top-level current action summary fields to the external next-actions JSON report.
- Added current next command and current first blocker to next-actions Markdown and console output.
- Updated release docs and QA text expectations so the behavior stays enforced.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:next-actions` in the source-evidence-missing bootstrap path.
- Passed: `npm run release:prepare-env`.
- Passed: `npm run verify`.
- Passed: placeholder-env `npm run release:next-actions-smoke` inside `npm run verify`.
- Passed: placeholder-env `npm run release:next-actions` operator command after verification.

## Findings

- No blocking findings.
- The new fields mirror the first priority action instead of creating separate ordering logic.
- Private release values remain unrecorded; the report exposes only action ids, labels, key names, commands, and blockers from redacted evidence.

## Residual Risk

- External distribution is still pending real private release/channel values, Developer ID signing, Apple notarization, Gatekeeper acceptance, auto-update readiness, and manual channel QA.
