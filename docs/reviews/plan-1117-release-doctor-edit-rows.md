# plan-1117-release-doctor-edit-rows review

## Summary

- Added release doctor current-action edit locations, env edit templates, and env edit rows.
- Kept edit output value-free: only key names, file/line locations, assignment shapes, guidance, placeholder status, and `valueRecorded: false` are recorded.
- Updated README, quality rules, and QA expectations for the doctor edit-row contract.

## QA

- Pass: `node --check harness/scripts/run_release_doctor.mjs`
- Pass: `npm run release:doctor`
- Pass: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/Users/taejungkim/workspace/GITHUB/GrooveForge/.env.distribution.local npm run release:doctor`
- Pass: `npm run qa`
- Pass: `npm run renderer:smoke`
- Pass: `npm run workflow:smoke`
- Pass: `npm run typecheck`
- Pass: `git diff --check`

## Review Notes

- No follow-up code issues found in the scoped review.
- Remaining project-level risk is unchanged: real release-channel values, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, release upload, and external distribution evidence are still not fully proven.
