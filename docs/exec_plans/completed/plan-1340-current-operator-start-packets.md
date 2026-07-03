# plan-1340-current-operator-start-packets

## Goal

Mirror the value-free `currentOperatorStartCommand` alias through the remaining completion packet layer and 10-plan checkpoint so the release handoff consistently names the first operator command without requiring readers to infer it from `currentOperatorFirstCommand`.

## Scope

- Add current operator start command fields to external completion run/resume packets.
- Add current operator start command fields to the operator completion brief and completion report packet.
- Add current operator start command checks to the 10-plan checkpoint.
- Update README and quality expectations for the packet-level alias contract.

## Non-Goals

- Do not record release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, beats, or real user audio.
- Do not change private env apply/preflight semantics, setup wizard behavior, signing, notarization, upload, network probing, project schema, app UI, or export behavior.
- Do not claim release-channel metadata, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA, release upload, or external distribution completion.

## Validation

- [x] `node --check harness/scripts/run_release_external_completion_run_packet_smoke.mjs`
- [x] `node --check harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`
- [x] `node --check harness/scripts/run_release_operator_completion_brief_smoke.mjs`
- [x] `node --check harness/scripts/run_release_completion_report_packet_smoke.mjs`
- [x] `node --check harness/scripts/run_release_10_plan_checkpoint_smoke.mjs`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `npm run release:completion-report-packet-smoke`
- [x] `npm run release:operator-completion-brief-smoke`
- [x] `npm run verify` (rerun outside the restricted sandbox so Electron/AppKit launch smoke could complete)
- [x] `git diff --check`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:completion-summary-smoke`

## Decision Log

- 2026-07-04: Created after plan-1339 added `currentOperatorStartCommand` to the core release receipts, leaving the outer completion packet layer to mirror and validate the same value-free alias.
- 2026-07-04: Mirrored `currentOperatorStartCommand`, role, first-command match, and value-free posture through completion report, operator brief, external run/resume packets, and 10-plan checkpoint; run/resume packets now also prove first-run/next-resume command alignment with the start alias.
- 2026-07-04: Sandbox `npm run release:check` stopped at Electron launch as expected in restricted AppKit context; reran `npm run verify` outside the sandbox and it passed.
- 2026-07-04: After moving plan-1340 to completed, `npm run release:completion-summary-refresh-smoke` and `npm run release:completion-summary-smoke` passed with latest completed plan `plan-1340`, 10-plan progress `1331-1340: 10/10`, and the 10-plan checkpoint status `ready`.
