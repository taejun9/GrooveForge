# plan-1080-external-preflight-command Review

## Findings

- None.

## Scope Reviewed

- Added `harness/scripts/run_release_external_preflight.mjs` as a fast redacted operator preflight after local release evidence exists.
- Added `release:external-preflight` and included it at the end of `npm run verify` after completion progress evidence is generated.
- Updated README, release readiness, harness architecture, quality rules, package scripts, and QA expectations.
- Preserved `release:external-check` as the authoritative hard external distribution gate.

## QA

- Passed: `node --check harness/scripts/run_release_external_preflight.mjs`
- Passed: `git diff --check`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run verify`
- Verified external preflight report flags: `externalPreflightReady=true`, `sourceEvidenceReady=true`, `localReleaseReadinessPercent=100`, `desktopProjectIoEvidenceReady=true`, `pkgPayloadProjectIoEvidenceReady=true`, `externalDistributionReady=false`, `externalDistributionGateReady=false`, `hardGateWouldFail=true`, `gateRequirementReadyCount=9`, `gateRequirementTotal=16`, `remediationReadyCount=1`, `remediationTotal=8`, `privateInputGroupReadyCount=0`, `privateInputGroupTotal=9`, `privateValuesRecorded=false`, `releaseGateClaimedExternalDistribution=false`.
- Verified the preflight path did not write root `.env.distribution.local`.

## Residual Risk

- External distribution remains blocked by real private release values, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, auto-update feed/channel readiness, distribution-channel QA, and manual QA approval.
- `release:external-preflight` depends on existing local release evidence; when source evidence is missing or stale, operators still need to run `npm run release:check`.

## Decision

- Ready to merge.
