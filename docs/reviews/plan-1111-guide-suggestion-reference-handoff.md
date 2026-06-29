# plan-1111-guide-suggestion-reference-handoff review

## Summary

- Added a Reference button to the Quick Actions guide suggestion card.
- Reused the existing Command Reference open path without adding command execution, search prefill, project edits, playback, export, or sampling behavior.
- Updated README, product, quality, and QA expectations for the guide suggestion reference handoff.

## QA

- Pass: `npm run qa`
- Pass: `npm run renderer:smoke`
- Pass: `npm run workflow:smoke`
- Pass: `npm run typecheck`
- Pass: `git diff --check`

## Review Notes

- No follow-up code issues found in the scoped review.
- Remaining project-level risk is unchanged: external/private distribution inputs and real release-channel evidence are still not fully proven.
