# plan-1306-channel-preflight-packet

## Goal

Add a value-free blocked receipt for the real release-channel private-env preflight command so the current operator first command can be verified as safe, non-writing, and aligned with the external completion handoff while private release-channel values remain operator-owned.

## Scope

- Add a smoke command that runs the real `npm run release:channel-apply-private-env-preflight` path in the current environment, accepts the expected blocked exit when private process env values are missing or placeholder-shaped, and validates the generated preflight report.
- Require the blocked receipt to prove no local env write, no private value recording, no URL/channel/credential/token/identity value leakage, and no external distribution claim.
- Include the new smoke in `npm run verify` near the release-channel private-env apply smokes.
- Update release docs, quality rules, and QA static expectations.

## Non-Goals

- Do not edit `.env.distribution.local`.
- Do not set, invent, or persist release URL, support URL, feed URL, channel, signing, notary, or manual QA values.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, or manual QA completion.

## Validation

- [x] `npm run release:channel-apply-private-env-preflight-blocked-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1305. Current main evidence shows local release and audience readiness are complete, while external completion is still blocked by four release-channel placeholder values in the ignored local env. The operator first command is `npm run release:channel-apply-private-env-preflight`; this plan makes that blocked preflight posture directly testable and value-free in the default gate without providing private values.
- 2026-07-03: Added `npm run release:channel-apply-private-env-preflight-blocked-smoke` to `npm run verify` after the synthetic preflight smoke. The new smoke runs the real preflight command with the four private release-channel process env inputs intentionally unset, accepts the expected blocked exit, proves the ignored local env is not modified, and validates the source preflight report remains value-free and non-claiming. Clean worktree validation has no ignored local env, so the wider release evidence still reports `npm run release:prepare-env` as the first operator command there.
- 2026-07-03: Moved the plan to completed and ran `npm run release:completion-summary-refresh-smoke`. The refreshed summary reports latest completed plan `plan-1306`, current 10-plan progress `1301-1310: 6/10`, user-facing completion `99.999999%`, and remaining completion `0.000001%` without recording private values or claiming external distribution.
