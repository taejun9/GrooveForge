# plan-1069-project-io-status-gate

## Goal

Propagate desktop project IO evidence from completion audit into completion status and the external distribution gate.

GrooveForge is an all-genre direct beat workstation. Project save/open proof is now part of completion audit, but user-facing completion status and hard-gate requirement rows should also show it explicitly. This makes progress reporting clearer for both first-time beat makers and working producers who need confidence that local project-file persistence works through native, packaged, and simulated installed paths.

## Scope

- Update `harness/scripts/run_desktop_completion_status_smoke.mjs` to read `desktopProjectIoEvidenceReady` from the completion audit.
- Add desktop project IO readiness to completion status Markdown, JSON summary, dimensions, validation, and console output.
- Update `harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` so hard external distribution gating has an explicit desktop project IO requirement.
- Update README, release readiness, harness architecture, quality rules, and QA expectations so docs match the propagated status/gate evidence.

## Out of Scope

- Changing project-file serialization or save/open IPC behavior.
- Adding new project IO smoke variants.
- Claiming Developer ID signing, notarization, Gatekeeper acceptance, auto-update, release upload, app-store submission, or external distribution completion.
- Adding cloud sync, accounts, analytics, remote AI, payment, or update feed publishing.

## Plan

1. Inspect completion status and external gate current contracts.
2. Add explicit desktop project IO readiness propagation and gate requirement.
3. Align docs and `run_qa.py` text expectations.
4. Run focused syntax/QA checks, then `release:check`.
5. Complete QA, review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_completion_status_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run release:check`
- Expected failure: hard external gate without `--dry-run` still fails until private external-distribution evidence exists.

## Decision Log

- 2026-06-28: Chose to update completion status and the hard gate instead of adding another smoke. Completion audit already proves project IO; this plan makes downstream completion reporting and gate requirements explicit.

## Status

- Completed on 2026-06-28.
