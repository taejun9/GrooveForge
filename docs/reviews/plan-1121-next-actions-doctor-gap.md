# plan-1121-next-actions-doctor-gap review

## Summary

- Added release doctor completion-gap propagation to external next-actions JSON, Markdown, and console output.
- Kept next-actions output value-free and explicitly unclaimed for external distribution completion.
- Updated README, quality rules, and QA expectations for the next-actions doctor completion-gap contract.

## QA

- Pass: `node --check harness/scripts/run_release_next_actions.mjs`
- Pass: `npm run release:doctor`
- Pass: `npm run release:next-actions`
- Pass: `npm run verify`
- Pass: `npm run qa`
- Pass: `npm run release:next-actions-smoke`
- Pass: `git diff --check`

## Review Notes

- No follow-up code issues found in the scoped review.
- Remaining project-level risk is unchanged: real release-channel values, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, release upload, and external distribution evidence are still not fully proven.
