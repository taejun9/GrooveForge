# plan-1317-external-runbook-current-operator-receipt

## Goal

Mirror the current value-free release-channel operator command sequence and private-env preflight Operator Receipt into the top-level external operator runbook so the remaining external completion handoff starts with the same safe preflight-first path everywhere.

## Scope

- Read the current operator command sequence from `release:next-actions` evidence inside `npm run desktop:external-operator-runbook-smoke`.
- Read the blocked private-env preflight Operator Receipt from `release:channel-apply-private-env-preflight-blocked-smoke` evidence when present.
- Surface both handoffs in the external operator runbook JSON, Markdown, console output, and self-checks.
- Preserve the existing current edit guidance, proof checklist, command verification rows, remediation phases, and hard-gate boundary.
- Keep reports value-free: key names, command names, labels, counts, artifact paths, readiness booleans, and no URL/channel/feed/credential/private values.

## Non-Goals

- Do not fill `.env.distribution.local` with real release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, or channel values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
- Do not run network probes, publish update metadata, upload release artifacts, sign artifacts, submit to Apple notarization, or modify private distribution values.
- Do not change product UI, audio behavior, project schema, local package generation, or composition-first product scope.

## Validation

- [x] `node --check harness/scripts/run_desktop_external_operator_runbook_smoke.mjs`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:prepare-env`
- [x] `npm run release:channel-apply-private-env-preflight-blocked-smoke`
- [x] `npm run release:next-actions`
- [x] `npm run desktop:external-operator-runbook-smoke`
- [x] `npm run release:check`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after plan-1316 mirrored the preflight Operator Receipt into the compact operator completion brief. The top-level external operator runbook still showed current edit/proof rows but did not directly mirror the current operator command sequence or preflight Operator Receipt, so this plan brings the same preflight-first handoff into the broader external runbook.
- 2026-07-03: Added current operator command sequence and preflight Operator Receipt mirrors to `npm run desktop:external-operator-runbook-smoke`, including JSON fields, Markdown sections, console summaries, value-free checks, and `run_qa.py` static coverage.
- 2026-07-03: `npm run release:check` passed with approved GUI/AppKit execution. The external operator runbook now reports current operator command sequence ready, first command `npm run release:channel-apply-private-env-preflight`, preflight-before-apply/apply-before-strict-proof ordering, preflight Operator Receipt source ready, six value-free receipt rows, and hard-gate inclusion while external distribution remains unclaimed.
- 2026-07-03: `npm run release:completion-summary-refresh-smoke` passed after moving the plan to completed. The refreshed summary reports latest completed plan `plan-1317`, current 10-plan progress `1311-1320: 7/10`, overall completion `99.999999%`, remaining completion `0.000001%`, four release-channel placeholder keys still blocking external distribution, and current operator first command `npm run release:channel-apply-private-env-preflight`.
