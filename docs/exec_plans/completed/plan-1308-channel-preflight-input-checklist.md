# plan-1308-channel-preflight-input-checklist

## Goal

Make the release-channel private-env preflight report show a value-free process env input checklist so the operator can prepare the four private release-channel values without any report recording URL/channel/private values.

## Scope

- Add a process env input checklist to `npm run release:channel-apply-private-env-preflight` Markdown/JSON evidence.
- Update the blocked preflight smoke, QA expectations, release docs, harness docs, and quality rules so the checklist remains value-free and covered.
- Preserve the current external blocker posture: placeholders remain blocked until operator-owned values are supplied outside committed files.

## Non-Goals

- Do not edit `.env.distribution.local`.
- Do not provide, invent, persist, or print release URL, support URL, feed URL, channel, signing, notary, or manual QA values.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, or manual QA completion.

## Validation

- [x] `npm run release:channel-apply-private-env-preflight-blocked-smoke`
- [x] `npm run release:channel-apply-private-env-preflight-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1307. Main evidence reports latest completed plan `plan-1307`, 10-plan progress `1301-1310: 7/10`, user-facing completion `99.999999%`, and the current blocker as four release-channel metadata placeholders in the ignored local env. The current operator first command is `npm run release:channel-apply-private-env-preflight`; this plan improves that command's value-free input guidance without replacing private values.
- 2026-07-03: Added value-free Process Env Input Checklist evidence to the release-channel private-env preflight and blocked smoke. Rows identify only the key name, `process.env` input source, presence/placeholder/shape booleans, expected shape, and preflight/write/proof commands. They do not record private values, channel values, release URLs, support URLs, feed URLs, credentials, or external completion claims. `npm run verify` passed.
- 2026-07-03: `npm run release:completion-summary-refresh-smoke` passed after moving this plan to completed. It reports latest completed plan `plan-1308`, 10-plan progress `1301-1310: 8/10`, user-facing completion `99.999999%`, and remaining completion `0.000001%` without recording private values or making external distribution claims.
