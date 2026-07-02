# plan-1302-channel-preflight-remediation

## Goal

Make the release-channel private env preflight failure more directly actionable without recording private values, so the current external distribution blocker can be cleared with fewer operator mistakes.

## Scope

- Add value-free remediation rows to `release:channel-apply-private-env-preflight` and its apply report.
- Surface missing/placeholder/invalid input posture, expected input shape, next apply command, strict proof command, and guided setup fallback as command names only.
- Update release docs and QA static expectations for the new preflight remediation receipt.

## Non-Goals

- Do not write or guess private release URLs, support URLs, channel values, credentials, Developer ID identity, or notary inputs.
- Do not claim external distribution completion.
- Do not change the current operator first command away from `npm run release:channel-apply-private-env-preflight`.

## Validation

- [x] `node --check harness/scripts/run_release_channel_apply_private_env.mjs`
- [x] `git diff --check`
- [x] `npm run release:channel-apply-private-env-preflight-smoke`
- [x] `npm run release:channel-apply-private-env-success-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `npm run release:channel-apply-private-env-preflight` (expected blocked real-env receipt)
- [x] `npm run verify`
- [ ] `npm run release:completion-summary-refresh-smoke` (run after completed plan is committed into completed-plan evidence)

## Decision Log

- 2026-07-03: Created after `main` reported user-facing completion `99.999999%` with the remaining blocker at four release-channel metadata placeholders. Since real private values are operator-owned, this plan improves the value-free preflight handoff instead of inventing values.
- 2026-07-03: Added value-free preflight remediation rows to the release-channel private env apply report, including expected shape labels, next write command, guided setup fallback, and strict proof command without storing URL/channel values.
- 2026-07-03: Full `npm run verify` passed. In a fresh worktree without ignored `.env.distribution.local`, the current external blocker correctly shifts to `npm run release:prepare-env`; the applied preflight report still proves the post-scaffold preflight/apply/proof handoff.

## Completion

Plan 1302 is complete. `release:channel-apply-private-env-preflight` now leaves a four-row value-free remediation table when release-channel metadata is missing, placeholder, malformed, or blocked by a missing ignored env scaffold. The report keeps `npm run release:channel-apply-private-env-preflight` as the current first operator command after scaffold creation, keeps `npm run release:channel-apply-private-env` as the write command, and exposes `npm run release:channel-setup-wizard` only as a guided fallback helper.
