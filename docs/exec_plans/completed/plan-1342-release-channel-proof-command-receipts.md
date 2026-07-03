# plan-1342-release-channel-proof-command-receipts

## Goal

Surface the new release-channel private env proof runner in the value-free operator receipts that drive current-blocker, completion summary, progress, and external completion handoff reports, without replacing the existing preflight-first command order.

## Scope

- Keep `npm run release:channel-apply-private-env-preflight` as the current first operator command.
- Add a separate value-free `npm run release:channel-apply-private-env-proof` convenience/proof runner field and receipt row where current release-channel handoffs already describe preflight, apply, and strict proof.
- Mirror the field through completion summary readout and external completion packets so after-work reports show the one-command option.
- Update QA text expectations and release docs for the new receipt field.

## Non-Goals

- Do not make the proof runner the first operator command.
- Do not edit `.env.distribution.local`, private input files, release URLs, support URLs, channel values, credentials, tokens, Developer ID identities, or real user audio.
- Do not run remote distribution probes, release uploads, Apple notarization, Developer ID signing, update-feed publishing, or the final external hard gate.

## Validation

- [x] `node --check harness/scripts/run_release_progress_refresh_smoke.mjs`
- [x] `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- [x] `node --check harness/scripts/run_release_completion_summary_smoke.mjs`
- [x] `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- [x] `node --check harness/scripts/run_release_external_completion_run_packet_smoke.mjs`
- [x] `node --check harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`
- [x] `npm run release:channel-apply-private-env-proof-smoke`
- [x] `npm run release:current-blocker-smoke`
- [x] `npm run release:completion-summary-smoke`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`

## Decision Log

- 2026-07-04: Created after plan-1341 added the value-free proof runner. Current completion evidence still exposes the granular preflight/apply/strict-proof path only, so this plan mirrors the convenience runner as a separate value-free operator receipt field while preserving preflight as the first command.
- 2026-07-04: `npm run verify` rebuilt release evidence and exposed a runtime `ReferenceError` in `run_release_progress_refresh_smoke.mjs` from shorthanding the report field name instead of mapping it from `releaseChannelApplyPrivateEnvProofCommand`. Fixed the mapping, then reran the direct QA, diff check, proof runner smoke, current-blocker smoke, completion-summary smoke, and completion-summary-refresh smoke successfully.
