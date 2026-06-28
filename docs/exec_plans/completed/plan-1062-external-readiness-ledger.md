# plan-1062-external-readiness-ledger

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a value-free external readiness ledger artifact that summarizes the current local release stage, external hard-gate requirement readiness, remediation group readiness, manual QA digest posture, and first blockers per external distribution dimension so completion reports can cite a compact machine-readable evidence ledger.

## Non-Goals

- Do not replace `npm run release:external-check` as the hard external distribution gate.
- Do not upload releases, probe download/support/update URLs, submit to Apple, publish update feeds, sign artifacts, or contact remote distribution channels.
- Do not record release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, private beats, or real user audio.
- Do not change app UI, audio rendering, project schema, export behavior, generation behavior, optional sampling scope, or release artifact semantics.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/run_desktop_completion_status_smoke.mjs`: local release stage and completion dimensions.
- `harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`: hard-gate requirement rows and blockers.
- `harness/scripts/run_desktop_external_remediation_smoke.mjs`: remediation groups and blockers.
- `harness/scripts/run_desktop_external_operator_runbook_smoke.mjs`: command sequence and operator evidence checklist.
- `harness/scripts/run_desktop_distribution_manual_qa_smoke.mjs`: manual QA checklist digest evidence.
- `package.json`: release/check and verify command wiring.
- `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, and `harness/scripts/run_qa.py`: release-harness docs and QA text expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1062-external-readiness-ledger` and `.worktree/plan-1062-external-readiness-ledger`.
- The ledger must stay value-free and must not weaken the hard external gate.
- The no-credential `npm run release:check` path must continue to pass while hard external distribution remains blocked.

## Implementation Plan

- [x] Add `desktop:external-readiness-ledger-smoke` that reads completion status, external gate, remediation, operator runbook, and manual QA summaries.
- [x] Write Markdown/JSON ledger artifacts under ignored `build/desktop/` with readiness counts, requirement rows, remediation rows, first blockers, manual QA digest posture, and not-recorded/not-claimed posture.
- [x] Wire the ledger smoke into `npm run verify` after the external operator runbook.
- [x] Update README, harness architecture, quality rules, release readiness evidence, and QA expectations.
- [x] Run QA/release checks, then complete the plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_external_readiness_ledger_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:external-readiness-ledger-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should still fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add an external readiness ledger after the operator runbook. | The runbook gives an action sequence; a compact ledger gives completion reports machine-readable ready/blocked counts and first blockers without weakening the hard gate. |
| 2026-06-28 | Keep the ledger non-claiming and value-free. | The artifact should summarize evidence state but must not imply private values, signing, notarization, Gatekeeper approval, auto-update, manual QA approval, or external distribution completion are already done. |
| 2026-06-28 | Keep `npm run release:external-check` as the only hard external distribution gate. | The new ledger improves reporting, while the hard gate must still fail until private inputs, signing, notarization, Gatekeeper, update, and manual QA evidence are real. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for a value-free external readiness ledger. |
| 2026-06-28 | harness_builder | Added `run_desktop_external_readiness_ledger_smoke.mjs`, package script wiring, and verify-chain integration after the external operator runbook. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness matrix, and QA expectations for the compact external readiness ledger. |
| 2026-06-28 | quality_runner | `node --check`, `git diff --check`, `python3 -B harness/scripts/run_qa.py`, standalone ledger smoke, and `npm run release:check` passed. Hard external gate failed as expected because private external-distribution evidence is incomplete. |

## Completion Notes

Implemented a value-free external readiness ledger smoke that writes ignored Markdown/JSON artifacts under `build/desktop/` after the external operator runbook.

Validation:

- `node --check harness/scripts/run_desktop_external_readiness_ledger_smoke.mjs` passed.
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` passed.
- `git diff --check` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run desktop:external-readiness-ledger-smoke` passed standalone and correctly reported incomplete source evidence before the release chain.
- `npm run release:check` passed and produced an external readiness ledger with `Ledger ready: yes`, `Completion stage: local release ready; external distribution pending`, `Local release ready: yes`, `External distribution hard gate ready: no`, `Gate requirements ready: 7/14`, `Remediation groups ready: 1/8`, and manual QA digest evidence available.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected because private distribution inputs, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, auto-update/channel metadata, and manual QA approval are not complete.

Review found no follow-up code changes before completion. The ledger does not record private values and does not claim external distribution readiness.
