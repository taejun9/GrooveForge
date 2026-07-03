# plan-1320-current-blocker-preflight-checklist

## Goal

Make `npm run release:current-blocker` directly show the private-env preflight process-env checklist posture, so the immediate release-channel handoff tells operators which process env inputs are missing, placeholder, or shape-invalid before they run the preflight/apply sequence.

## Scope

- Read the value-free `release-channel-apply-private-env-preflight-blocked-smoke` artifact from the current blocker report when release-channel metadata placeholders remain.
- Mirror the preflight process-env checklist summary into current-blocker JSON, Markdown, and console output.
- Validate that checklist rows remain value-free and that the preflight blocked-smoke source still starts with `npm run release:channel-apply-private-env-preflight`.
- Keep source-missing and external-distribution claim boundaries unchanged.

## Non-Goals

- Do not fill private release-channel values.
- Do not edit `.env.distribution.local` or record local env values.
- Do not change product UI, audio behavior, project schema, packaging identity, signing, notarization, Gatekeeper, auto-update, uploads, or hard-gate claims.

## Validation

- [x] `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- [x] `npm run release:channel-apply-private-env-preflight-blocked-smoke`
- [x] `npm run release:check`
- [x] `npm run release:current-blocker`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after plan-1319 fixed the missing preflight receipt generation path. The next operator-facing gap is that `release:current-blocker` names the preflight/apply sequence but does not directly summarize the preflight process-env input checklist, even though the value-free blocked-smoke artifact already contains that evidence.
- 2026-07-03: Implemented current-blocker mirroring for the value-free preflight process-env checklist. Direct `npm run release:current-blocker` now reports source readiness, four process.env rows, ready row counts, and missing/placeholder/invalid row counts without recording private values.
- 2026-07-03: Refreshed the completion summary after moving this plan to completed. The checkpoint now reports latest completed plan `plan-1320`, `1311-1320: 10/10`, checkpoint required/run `yes`, checkpoint status `ready`, overall completion `99.999999%`, and remaining completion `0.000001%`.
