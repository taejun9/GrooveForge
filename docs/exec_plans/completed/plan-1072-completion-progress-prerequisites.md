# plan-1072-completion-progress-prerequisites

## Goal

Make completion progress reporting clearer when the report is run before its required release evidence exists.

`desktop:completion-progress-smoke` is designed to run after `release:check`, but users can also run it directly. Direct execution currently fails with broad readiness checks when the prerequisite `build/desktop/` evidence chain is absent. The report should still be value-free, but it should explicitly list missing source artifacts and the next local command needed to regenerate them.

## Scope

- Improve `harness/scripts/run_desktop_completion_progress_smoke.mjs` prerequisite reporting.
- Include source artifact readiness, missing artifact rows, and next-command guidance in JSON/Markdown output.
- Keep the smoke failing when required source evidence is missing.
- Update README, release readiness, harness architecture, quality rules, and QA expectations.

## Out of Scope

- Auto-running `release:check` from the progress smoke.
- Weakening the release gate or claiming external distribution completion.
- Recording release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio.
- Changing project-file behavior, audio rendering, signing, notarization, Gatekeeper, update-feed behavior, cloud sync, accounts, analytics, remote AI, payment, or sampling scope.

## Plan

1. Inspect the current completion progress smoke and adjacent release evidence scripts.
2. Add explicit prerequisite artifact rows and next-command guidance.
3. Align docs and `run_qa.py` expectations.
4. Run focused syntax/QA checks and release checks.
5. Complete QA, review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_completion_progress_smoke.mjs`
- Passed expected failure before source evidence exists: `node harness/scripts/run_desktop_completion_progress_smoke.mjs`
  - Failed with five missing source evidence artifact rows and `npm run release:check` next-command guidance.
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run release:check`
- Passed: `npm run desktop:completion-progress-smoke` after `release:check`
- Passed expected failure: `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`
  - Failed because external distribution remains blocked by missing private distribution inputs, channel QA approval, auto-update provider/feed readiness, Developer ID signing, notarization/stapling, and notarized Gatekeeper acceptance.

## Decision Log

- 2026-06-28: Chose prerequisite reporting instead of auto-running `release:check` because the progress smoke should remain a focused value-free reporter and should not unexpectedly launch the full desktop release chain.

## Status

- Completed on 2026-06-28.
