# plan-1341-release-channel-proof-runner

## Goal

Add a value-free operator runner that executes the release-channel metadata proof path in one command: preflight first, apply only when preflight is ready, then strict proof and completion readout when the write step succeeds.

## Scope

- Add an npm script and harness runner for the release-channel preflight/apply/proof path.
- Keep blocked runs safe: no local env modification when preflight is not ready, no private values in JSON/Markdown/console output, and no external distribution claim.
- Add a synthetic success smoke proving the runner can preflight, apply, and hand off to strict proof against temporary ignored fixtures.
- Surface the runner in README and quality rules as the next operator convenience command after private release-channel values are prepared.

## Non-Goals

- Do not invent or record release URL, support URL, channel, credential, token, Developer ID identity, local env, private beat, or real user audio values.
- Do not run remote distribution probes, release uploads, Apple notarization, Developer ID signing, update feed publishing, or the final hard gate.
- Do not replace the existing granular preflight/apply/strict-proof commands; the runner is a convenience wrapper with value-free receipts.

## Validation

- [x] `node --check harness/scripts/run_release_channel_apply_private_env_proof.mjs`
- [x] `node --check harness/scripts/run_release_channel_apply_private_env_proof_smoke.mjs`
- [x] `npm run release:channel-apply-private-env-proof-smoke`
- [x] `npm run release:channel-apply-private-env-proof` (expected blocked exit 1 without operator private inputs; wrote value-free receipt and skipped apply)
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`

Post-merge completion reporting remains separate: run `npm run release:completion-summary-refresh-smoke` and `npm run release:completion-summary-smoke` from the main checkout after merge so the ignored release evidence is read from the root working copy used for user-facing completion reports.

## Decision Log

- 2026-07-04: Created after plan-1340 proved the current operator start command through completion packets; the remaining release-channel blocker still requires an operator-owned preflight/apply/proof sequence, so this plan adds a value-free one-command runner without recording private values.
- 2026-07-04: Kept the runner's real mode on the existing completion-summary smoke after strict proof succeeds, but made `--success-smoke` use a self-contained synthetic completion readout so the new proof smoke does not require bootstrapping the full ignored release evidence set in a fresh feature worktree.
