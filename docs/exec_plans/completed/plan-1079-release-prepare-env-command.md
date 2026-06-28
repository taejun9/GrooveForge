# plan-1079-release-prepare-env-command

## Goal

Add a value-free `release:prepare-env` command that turns the committed distribution private-input template into a safe ignored local env scaffold for final external distribution operation.

External distribution is now blocked on operator-owned private values, Developer ID identity, notary credentials, update feed/channel metadata, and manual QA approval. The repo already validates those inputs when present, but operators still need a bounded command that prepares the local `.env.distribution.local` file without recording or committing private values.

## Scope

- Add a release prepare-env script that parses `harness/templates/distribution-private-inputs.env.example`.
- Add a safe smoke mode that writes value-free Markdown/JSON evidence and an env scaffold under ignored `build/desktop/`.
- Add a write-local mode for `npm run release:prepare-env` that creates `.env.distribution.local` only when requested and refuses to overwrite it without `--force`.
- Include current manual QA checklist digest in the scaffold when local evidence exists; otherwise keep a placeholder and next-command guidance.
- Surface the command in release doctor output, docs, and QA expectations.

## Out of Scope

- Filling real private values, credentials, URLs, identity labels, tokens, or channel metadata.
- Developer ID signing, notarization, stapling, Gatekeeper approval, release upload, update feed publish, remote probing, or claiming external distribution completion.
- Changing product scope, direct-composition-first behavior, sampler/import features, project data, or app UI behavior.

## Plan

1. Completed: Created the active plan and inspected current distribution env/doctor patterns.
2. Completed: Implemented the prepare-env script and package scripts.
3. Completed: Updated release doctor, docs, and QA expectations.
4. Completed: Ran targeted QA and release doctor/prepare-env validation.
5. Completed: Reviewed, moved this plan to completed, created review mirror, merged to `main`, pushed, deleted the branch, and removed the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_prepare_env.mjs`
- Passed: `node --check harness/scripts/run_release_doctor.mjs`
- Passed: `git diff --check`
- Passed: `npm run release:prepare-env-smoke`
- Passed: `npm run release:doctor`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run verify`
- Verified prepare-env report flags: `releasePrepareEnvReady=true`, `scaffoldWritten=true`, `localEnvWriteRequested=false`, `localEnvWritten=false`, `manualQaChecklistDigestApplied=true`, `privateValuesRecorded=false`, `releaseGateClaimedExternalDistribution=false`.
- Verified the smoke path did not write root `.env.distribution.local`.

## Decision Log

- 2026-06-29: Chose a value-free scaffold command instead of weakening the hard external gate, because the app should remain truthful: local release readiness can be complete while external distribution waits for operator-owned private inputs.
- 2026-06-29: Kept `release:prepare-env-smoke` read/write-limited to ignored build artifacts, while `release:prepare-env` is the explicit operator command for creating ignored `.env.distribution.local`.
- 2026-06-29: Added release doctor evidence for prepare-env readiness without treating scaffold generation as private-input readiness or external distribution completion.

## Status

- Complete after QA and review. External distribution remains intentionally blocked until private inputs, Developer ID signing, notarization/stapling, Gatekeeper acceptance, auto-update channel validation, and manual QA approval are complete.
