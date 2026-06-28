# plan-1080-external-preflight-command

## Goal

Add a fast value-free `release:external-preflight` command for operators to rerun after preparing `.env.distribution.local`, so the remaining external distribution blockers are visible without running the full `release:check` hard gate.

The app is locally release-ready, but external distribution still requires private values, Developer ID signing, notarization/stapling, Gatekeeper acceptance, auto-update channel readiness, and manual QA approval. Operators need a short, repeatable command between scaffold creation and final hard-gate execution.

## Scope

- Add an external preflight script that runs targeted redacted distribution/readiness checks.
- Write Markdown/JSON preflight evidence under ignored `build/desktop/`.
- Include release doctor, completion status, external remediation, readiness ledger, completion progress, and external gate dry-run posture.
- Add package scripts, docs, release matrix, and QA expectations.

## Out of Scope

- Filling real private values, credentials, URLs, identity labels, tokens, or channel metadata.
- Developer ID signing, notarization, stapling, Gatekeeper approval, release upload, update feed publish, remote probing, manual QA approval, or claiming external distribution completion.
- Replacing `release:external-check`, which remains the final hard gate.
- Changing product scope, direct-composition-first behavior, sampler/import features, project data, or app UI behavior.

## Plan

1. Completed: Created the active plan and inspected release doctor/progress/gate script patterns.
2. Completed: Implemented the external preflight script and package script.
3. Completed: Updated docs and QA expectations.
4. Completed: Ran targeted QA and preflight validation.
5. Completed: Reviewed, moved this plan to completed, created review mirror, merged to `main`, pushed, deleted the branch, and removed the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_external_preflight.mjs`
- Passed: `git diff --check`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run verify`
- Verified external preflight report flags: `externalPreflightReady=true`, `sourceEvidenceReady=true`, `localReleaseReadinessPercent=100`, `desktopProjectIoEvidenceReady=true`, `pkgPayloadProjectIoEvidenceReady=true`, `externalDistributionReady=false`, `externalDistributionGateReady=false`, `hardGateWouldFail=true`, `gateRequirementReadyCount=9`, `gateRequirementTotal=16`, `remediationReadyCount=1`, `remediationTotal=8`, `privateInputGroupReadyCount=0`, `privateInputGroupTotal=9`, `privateValuesRecorded=false`, `releaseGateClaimedExternalDistribution=false`.
- Verified the preflight path did not write root `.env.distribution.local`.

## Decision Log

- 2026-06-29: Chose a fast redacted preflight command instead of weakening `release:external-check`, because the final gate must keep failing until real external distribution evidence is present.
- 2026-06-29: Kept `release:external-preflight` outside the full `release:check` path but included it at the end of `npm run verify`, so full local evidence is regenerated before the preflight evidence is validated.
- 2026-06-29: Treated external preflight readiness as "the preflight report is reliable" rather than "external distribution is complete"; the hard gate and external distribution booleans remain false until private inputs and Apple/channel evidence are real.

## Status

- Complete after QA and review. External distribution remains intentionally blocked until private inputs, Developer ID signing, notarization/stapling, Gatekeeper acceptance, auto-update channel validation, and manual QA approval are complete.
