# plan-1073-release-progress-command

## Goal

Add a direct release progress command that regenerates the local release gate evidence and prints a compact completion progress summary.

The user asks for completion progress after each finished work item. `release:check` already creates the required evidence chain, and `desktop:completion-progress-smoke` writes a detailed artifact, but there is no single command named for progress reporting. A dedicated command should make progress reporting reproducible without weakening the hard external distribution gate.

## Scope

- Add a `release:progress` package script.
- Add a Node wrapper that runs `npm run release:check`, reads the completion progress JSON artifact, and prints the compact readiness summary.
- Keep the wrapper value-free: no release URLs, support URLs, feed values, credentials, tokens, identity labels, channel values, private beats, or real user audio.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Changing the `release:check` gate or making `release:progress` part of `verify`.
- Claiming Developer ID signing, notarization, Gatekeeper approval, auto-update, upload, manual QA approval, app-store submission, or external distribution completion.
- Changing project-file behavior, audio rendering, signing/notarization behavior, cloud sync, accounts, analytics, remote AI, payments, or sampling scope.

## Plan

1. Inspect current release/progress artifacts and scripts.
2. Add the progress wrapper and package script.
3. Align docs and QA expectations.
4. Run focused syntax/QA checks and release progress checks.
5. Complete QA, review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_release_progress_report.mjs`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run release:progress`
  - Ran `npm run release:check` first, then wrote the release progress Markdown/JSON artifacts.
  - Reported source evidence ready, local release readiness 100.0%, desktop project IO evidence ready, external hard gate not ready, external gate requirements 8/15, and remediation groups 1/8.
- Passed expected failure: `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`
  - Failed because external distribution remains blocked by missing private distribution inputs, channel QA approval, auto-update provider/feed readiness, Developer ID signing, notarization/stapling, and notarized Gatekeeper acceptance.

## Decision Log

- 2026-06-28: Chose a wrapper around `release:check` instead of a standalone calculator so progress reports always come from freshly regenerated release evidence.

## Status

- Completed on 2026-06-28.
