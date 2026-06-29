# plan-1150-ten-plan-window-rows review

## Findings

- No blocking issues found.

## Review Notes

- Release progress now records value-free current 10-plan window rows in JSON, Markdown, and console output.
- Release current-blocker receipts mirror the same value-free current 10-plan rows from release progress evidence.
- QA expectations and quality rules now require the current 10-plan row fields and `Current 10-Plan Window Rows` Markdown table.
- The implementation keeps private release values, concrete env assignments, URLs, credentials, tokens, identities, channel values, and external distribution claims out of the generated reports.

## QA Reviewed

- Passed `node --check harness/scripts/run_release_progress_report.mjs`.
- Passed `node --check harness/scripts/run_release_current_blocker_smoke.mjs`.
- Initial `npm run qa` caught a stale quality-rule text expectation after adding the `current 10-plan rows` console summary; the expectation was updated.
- Passed `npm run qa`.
- Passed `git diff --check`.
- Initial `npm run release:progress-smoke` in the fresh worktree found missing ignored release evidence and correctly pointed to `npm run release:check`/`npm run verify`; the full `npm run release:progress` fallback regenerated evidence.
- Passed full `npm run release:progress`.
- Passed `npm run release:current-blocker-smoke`.
- Inspected release progress JSON and current-blocker JSON in the active-plan state: both reported `1141-1150: 9/10` with 9 value-free current 10-plan rows.
- After completing plan-1150, passed `npm run release:progress-smoke`; the report showed `1141-1150: 10/10`, `10-plan report due: yes`, and 10 value-free current 10-plan rows.
- After completing plan-1150, passed `npm run release:current-blocker-smoke`; the receipt mirrored `1141-1150: 10/10` and included `plan-1150-ten-plan-window-rows.md` as the final value-free row.
- Inspected post-completion release progress and current-blocker JSON: both included 10 current-window rows and every row had `valueRecorded: false`.

## Residual Risk

- External distribution still requires operator-owned private release metadata, update/feed metadata, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, matching manual QA approval digest, and the hard `npm run release:external-check` gate. This plan improves progress reporting evidence and does not complete those external requirements.
