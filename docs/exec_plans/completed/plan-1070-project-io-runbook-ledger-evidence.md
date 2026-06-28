# plan-1070-project-io-runbook-ledger-evidence

## Goal

Propagate desktop project IO evidence from completion status and the external gate into the external operator runbook and readiness ledger.

GrooveForge is an all-genre direct beat workstation. Project save/open proof is already explicit in completion audit, completion status, and the hard external distribution gate. The downstream operator runbook and readiness ledger should also report that desktop project IO evidence is ready so final handoff and completion reporting do not hide project-file persistence behind broader release status.

## Scope

- Update `harness/scripts/run_desktop_external_operator_runbook_smoke.mjs` to read and report desktop project IO readiness from completion status and the external gate.
- Update `harness/scripts/run_desktop_external_readiness_ledger_smoke.mjs` to ledger desktop project IO readiness explicitly.
- Update README, release readiness, harness architecture, quality rules, and QA expectations so docs match the propagated runbook/ledger evidence.

## Out of Scope

- Changing project-file serialization or save/open IPC behavior.
- Adding new project IO smoke variants.
- Claiming Developer ID signing, notarization, Gatekeeper acceptance, auto-update, release upload, app-store submission, or external distribution completion.
- Adding cloud sync, accounts, analytics, remote AI, payment, or update feed publishing.

## Plan

1. Inspect operator runbook and readiness ledger current contracts.
2. Add explicit desktop project IO readiness fields, Markdown rows, validations, and console output.
3. Align docs and `run_qa.py` text expectations.
4. Run focused syntax/QA checks, then `release:check`.
5. Complete QA, review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_external_operator_runbook_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_external_readiness_ledger_smoke.mjs`
- Passed: `npm run desktop:external-operator-runbook-smoke`
- Passed: `npm run desktop:external-readiness-ledger-smoke`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run release:check`
- Expected failure: hard external gate without `--dry-run` still fails until private external-distribution evidence exists.

## Decision Log

- 2026-06-28: Chose to update runbook and ledger reporting instead of creating another smoke. Completion status and the external gate already expose project IO readiness; this plan carries that signal into the final operator-facing artifacts.

## Status

- Completed on 2026-06-28.
