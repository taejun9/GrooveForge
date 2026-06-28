# plan-1074-release-doctor-command

## Goal

Add a fast value-free release doctor command for external distribution inputs.

`release:progress` regenerates the full local release gate. Before an operator runs that expensive gate or the hard external gate, they need a quick check for ignored distribution env loading, private input presence, manual QA digest posture, channel metadata blockers, and signing/notary signal blockers. The command should lower external-distribution friction without recording private values or claiming distribution completion.

## Scope

- Add a `release:doctor` package script.
- Add a Node wrapper that runs targeted redacted distribution-input/readiness smokes and writes a compact Markdown/JSON doctor report.
- Include env template readiness, private input group counts, manual QA digest posture, channel QA blockers, Developer ID readiness, and notarization signal blockers.
- Keep all release URLs, support URLs, feed values, credentials, tokens, identity labels, channel values, private beats, and real user audio out of output.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Running the full `release:check` gate.
- Uploading releases, probing remote channels or feeds, signing artifacts, submitting to Apple notary services, or claiming external distribution completion.
- Changing app behavior, project files, audio rendering, sampling scope, cloud sync, accounts, analytics, remote AI, or payments.

## Plan

1. Inspect targeted distribution input/readiness scripts and their JSON outputs.
2. Add the release doctor wrapper and package script.
3. Align docs and QA expectations.
4. Run focused syntax/QA checks, doctor command, release progress, and hard gate expected failure.
5. Complete QA, review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_release_doctor.mjs`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run release:doctor`
- Passed: `npm run build`
- Passed: `npm run release:progress`
- Passed: hard external gate expected-failure check with `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` returning exit code 1 because private distribution inputs, channel QA, auto-update readiness, Developer ID signing, notarization/stapling, and notarized Gatekeeper evidence are intentionally not ready.

## Decision Log

- 2026-06-28: Chose a targeted doctor command instead of another full release wrapper so operators can validate private-input posture quickly before running the heavier release gate.
- 2026-06-28: During full release-progress QA, Electron launch/project IO smoke checks hit deadline flakes while their standalone reruns passed. Aligned the shorter desktop launch/project/package timeouts to the existing 120-second ad-hoc/install smoke deadline to reduce release-gate flakes without changing product behavior.

## Status

- Completed on 2026-06-28.
