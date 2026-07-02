# plan-1307-channel-edit-packet-verify

## Goal

Make the release-channel edit packet part of the default verification path so the current private release-channel placeholder replacement handoff stays fresh while the operator-owned URL/channel values remain outside committed files.

## Scope

- Add `npm run release:channel-edit-packet-smoke` to `npm run verify` near the release-channel private-env smokes.
- Update release docs, harness architecture docs, quality rules, and QA static expectations so the command remains documented and enforced.
- Preserve the existing release-channel blocker posture: the packet may identify key names, file names, line numbers, command order, and value-free guidance, but must not record private values or claim external distribution.

## Non-Goals

- Do not edit `.env.distribution.local`.
- Do not set, invent, or persist release URL, support URL, feed URL, channel, signing, notary, or manual QA values.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, or manual QA completion.

## Validation

- [x] `npm run release:channel-edit-packet-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1306. Main evidence reports latest completed plan `plan-1306`, 10-plan progress `1301-1310: 6/10`, user-facing completion `99.999999%`, and the current blocker as four release-channel placeholders in the ignored local env. The current operator first command is `npm run release:channel-apply-private-env-preflight`; this plan keeps the focused release-channel edit packet fresh in the default gate without providing private values.
- 2026-07-03: Added `npm run release:channel-edit-packet-smoke` to `npm run verify` immediately after `npm run release:channel-setup-wizard-success-smoke` and before `npm run desktop:completion-audit-smoke`, updated the QA exact-match expectations and release docs, and verified the full default gate without recording private values or claiming external distribution.
- 2026-07-03: After moving the plan to completed, `npm run release:completion-summary-refresh-smoke` reported latest completed plan `plan-1307`, 10-plan progress `1301-1310: 7/10`, user-facing completion `99.999999%`, remaining completion `0.000001%`, no private values recorded, and no external distribution claim.
