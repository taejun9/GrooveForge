# plan-1324-release-channel-input-file Review

Reviewed the release-channel private input-file support and the Squirrel DYLD stale-worktree crash-report regression coverage.

No blocking findings.

## Scope Check

- Added optional ignored private input-file support for the four release-channel metadata keys while keeping `process.env` as the highest-precedence source.
- Added value-free report fields for input-file presence, configured path, loaded key names, unknown/malformed rows, source rows, and source counts without recording channel or URL values.
- Added a synthetic input-file smoke that proves preflight/apply can use an ignored private file, update only a synthetic distribution env target, and pass strict release-channel live-check.
- Updated the blocked preflight smoke so real operator-owned private input files cannot make the missing-input regression pass unexpectedly.
- Added a sanitized stale-worktree Squirrel DYLD/code-signature crash-report sample so the attached `@rpath/Squirrel.framework/Squirrel` report shape remains classified as a packaging/framework dependency issue.
- Updated package scripts, `verify`, QA expectations, README, release readiness, and harness architecture docs.

## Validation

- `node --check harness/scripts/run_release_channel_apply_private_env.mjs`
- `node --check harness/scripts/run_release_channel_apply_private_env_input_file_smoke.mjs`
- `node --check harness/scripts/run_release_channel_apply_private_env_preflight_blocked_smoke.mjs`
- `node --check harness/scripts/run_desktop_crash_report_regression_smoke.mjs`
- `npm run release:channel-apply-private-env-input-file-smoke`
- `npm run release:channel-apply-private-env-preflight-blocked-smoke`
- `npm run desktop:crash-report-regression-smoke`
- `npm run release:channel-apply-private-env-preflight-smoke`
- `npm run release:channel-apply-private-env-remediation-smoke`
- `npm run release:channel-apply-private-env-success-smoke`
- `python3 harness/scripts/run_qa.py`
- `npm run release:completion-summary-refresh-smoke`
- `npm run release:check`
- `git diff --check`

## Evidence Notes

- The input-file smoke reported 4/4 private input keys loaded from the ignored private file, preflight/apply/strict proof ready, no real local env read, no real local env modification, and no private values recorded.
- The blocked preflight smoke reported the expected blocked exit, 4/4 missing inputs, no real local env modification, private input file absent, and value-free private input source rows.
- The crash-report regression smoke reported the Squirrel DYLD report, Squirrel DYLD code-signature report, Squirrel DYLD stale-worktree code-signature report, AppKit abort report, and restricted GUI preflight as classified.
- Full `release:check` passed and exercised the packaged framework dependency guard, including Squirrel/ReactiveObjC/Mantle presence, code-signature compatibility, and dyld loadability.
- Completion remains `99.999999%` with `0.000001%` remaining because external/private release proof is still intentionally not claimed.

## Residual Risk

- This plan makes release-channel metadata easier to apply from an ignored private input file, but it does not supply real operator-owned values.
- It does not complete Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, release upload, update feed publishing, or external distribution.
- The attached crash report referenced a stale worktree app path; the covered remediation remains to use a fresh build/package/signature verification path instead of relying on stale packaged app copies.
