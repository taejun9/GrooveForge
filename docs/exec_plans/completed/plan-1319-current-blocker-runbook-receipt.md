# plan-1319-current-blocker-runbook-receipt

## Goal

Fix the `npm run release:current-blocker` path when an ignored local distribution env file exists with release-channel placeholders, so the external proof bundle and operator runbook can refresh value-free evidence without requiring private values.

## Scope

- Reproduce the primary workspace failure where `external-operator-runbook-smoke` rejects a missing private-env preflight Operator Receipt source after `release:doctor` detects `.env.distribution.local` placeholder rows.
- Make the refresh path generate or preserve the value-free private-env preflight receipt before the external operator runbook validates it.
- Keep all evidence value-free: no release URLs, support URLs, feed URLs, credentials, tokens, channel values, Developer ID identity values, user audio, or private beats.
- Keep external distribution, Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, and upload claims false.

## Non-Goals

- Do not fill private release-channel values.
- Do not edit product UI, audio, project schema, packaging identity, or export behavior.
- Do not run remote network probes, Apple notarization, release uploads, or external hard-gate claims.
- Do not store `.env.distribution.local` in git.

## Validation

- [x] `node --check harness/scripts/run_release_next_actions.mjs`
- [x] `npm run release:prepare-env`
- [x] `npm run release:channel-apply-private-env-preflight-blocked-smoke`
- [x] `npm run release:next-actions`
- [x] `npm run release:check`
- [x] `npm run desktop:external-operator-runbook-smoke`
- [x] `npm run release:current-blocker`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after the primary workspace `npm run release:current-blocker` failed with local `.env.distribution.local` loaded and 4 release-channel placeholder keys. The failing validator expected a ready private-env preflight Operator Receipt in `external-operator-runbook-smoke`, but the refresh path did not guarantee that receipt before the runbook check.
- 2026-07-03: Updated `release:next-actions` so the non-bootstrap external preflight refresh first runs `npm run release:channel-apply-private-env-preflight-blocked-smoke`. This guarantees the value-free private-env Operator Receipt exists before `release:external-preflight` refreshes the external operator runbook and proof bundle.
- 2026-07-03: Kept the source-missing bootstrap boundary intact. In a fresh worktree without release source evidence, `npm run release:next-actions` still reports `npm run release:check` as the first action rather than claiming external readiness.
- 2026-07-03: `npm run release:check` passed after regenerating full local release evidence. The external operator runbook reported `Preflight operator receipt source ready: yes`, 6 value-free receipt rows, the first command `npm run release:channel-apply-private-env-preflight`, and no private values recorded.
- 2026-07-03: Direct `npm run release:current-blocker` passed after refreshing release doctor, proof bundle, external gate, update-feed checkpoint, and release progress evidence. The current blocker is now correctly reported as 4 release-channel metadata placeholders, not a missing receipt/tooling failure.
- 2026-07-03: Moved the plan to completed and refreshed completion summary evidence. Latest completed plan is `plan-1319`, current 10-plan progress is `1311-1320: 9/10`, user-facing completion is `99.999999%`, remaining completion is `0.000001%`, and the current external blocker remains the 4 release-channel metadata placeholders in the ignored local env handoff.
