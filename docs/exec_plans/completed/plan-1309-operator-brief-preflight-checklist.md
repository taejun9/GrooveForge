# plan-1309-operator-brief-preflight-checklist

## Goal

Mirror the value-free release-channel process env input checklist into the operator completion brief so the current blocker report shows the exact `process.env` readiness posture before the operator runs the private-env apply helper.

## Scope

- Update `npm run release:operator-completion-brief-smoke` to read the real blocked preflight checklist preserved by `npm run release:channel-apply-private-env-preflight-blocked-smoke`, instead of the generic preflight artifact stem that synthetic smokes can overwrite.
- Add value-free preflight checklist counts and rows to the operator completion brief Markdown/JSON/console output.
- Add QA/static expectations and release docs so the brief keeps exposing the checklist without recording private values or claiming external distribution.

## Non-Goals

- Do not edit `.env.distribution.local`.
- Do not provide, persist, print, or infer release URL, support URL, feed URL, channel, credential, signing, notary, or manual QA values.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, or manual QA completion.

## Validation

- [x] `npm run release:channel-apply-private-env-preflight-blocked-smoke`
- [x] `npm run release:operator-completion-brief-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1308. Main evidence reports latest completed plan `plan-1308`, 10-plan progress `1301-1310: 8/10`, user-facing completion `99.999999%`, and the current blocker as four release-channel metadata placeholders in the ignored local env. The current operator first command is `npm run release:channel-apply-private-env-preflight`; this plan mirrors that preflight's value-free Process Env Input Checklist into the operator completion brief.
- 2026-07-03: Initial standalone `npm run release:progress-refresh-smoke` failed in the fresh plan worktree because the ignored source release evidence had not been generated yet. The follow-up path is to run the documented full `npm run verify` flow, which regenerates the required source evidence before the progress/brief refresh.
- 2026-07-03: Tightened the operator brief source from the generic preflight artifact to the blocked preflight smoke JSON because later synthetic remediation/targeted smokes can overwrite the generic preflight stem. The brief now reads the preserved blocked-smoke checklist and records the expected blocked exit posture without recording values.
- 2026-07-03: QA, build, diff-check, and full verify passed after the source fix. `npm run release:operator-completion-brief-smoke` now reports the blocked-smoke process env checklist source ready with four value-free rows, no private values recorded, and no external distribution claims.
- 2026-07-03: Completion summary refresh passed after moving this plan to completed. The refresh reports latest completed plan `plan-1309`, 10-plan progress `1301-1310: 9/10`, user-facing completion `99.999999%`, remaining completion `0.000001%`, and no private values or external distribution claims.
