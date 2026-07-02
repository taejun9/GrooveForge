# plan-1305-external-resume-verify

## Goal

Make the external completion resume packet part of the default verification path so the operator-facing resume command stays aligned with the current blocker, current operator first command, and full external completion run order.

## Scope

- Add `npm run release:external-completion-resume-packet-smoke` to `npm run verify`.
- Update docs and QA static expectations so the command remains documented and enforced.
- Keep the packet value-free: no URL, feed, channel, credential, token, Developer ID identity, local env value, private beat, or real user audio values.
- Preserve the current release-channel blocker posture until private operator-owned values are provided.

## Non-Goals

- Do not edit `.env.distribution.local`.
- Do not provide or invent release URL, support URL, feed URL, channel, signing, notary, or manual QA values.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, or manual QA completion.

## Validation

- [x] `npm run release:external-completion-resume-packet-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1304. Current main evidence shows local release readiness and persona readiness are complete, while external completion is blocked by four release-channel placeholders in the ignored local env. The external completion resume packet already proves the next resume command matches `npm run release:channel-apply-private-env-preflight`; adding it to default verification prevents this handoff from drifting while private values remain operator-owned.
- 2026-07-03: Added `npm run release:external-completion-resume-packet-smoke` to the end of `npm run verify` after the private value leak audit, then updated release docs and QA expectations to lock the order. Clean worktree validation has no ignored local env, so its current operator first command is `npm run release:prepare-env`; the resume packet still proves the next resume command matches the current operator first command without recording private values or claiming external distribution.
