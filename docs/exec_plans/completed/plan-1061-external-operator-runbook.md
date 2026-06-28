# plan-1061-external-operator-runbook

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a value-free external operator runbook artifact that turns the current completion status, external remediation groups, manual QA digest evidence, and hard-gate posture into a concise final distribution command sequence and evidence checklist without recording private values or claiming external distribution completion.

## Non-Goals

- Do not replace `npm run release:external-check` as the hard external distribution gate.
- Do not upload releases, probe download/support/update URLs, submit to Apple, publish update feeds, sign artifacts, or contact remote distribution channels.
- Do not record release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identity labels, private beats, real user audio, or local env values.
- Do not change app UI, audio rendering, project schema, export behavior, generation behavior, optional sampling scope, or release artifact semantics.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/run_desktop_completion_status_smoke.mjs`: current completion status and pending external groups.
- `harness/scripts/run_desktop_external_remediation_smoke.mjs`: ordered remediation groups and rerun commands.
- `harness/scripts/run_desktop_distribution_manual_qa_smoke.mjs`: current manual QA checklist digest evidence.
- `harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`: dry-run and hard final external distribution gate.
- `harness/templates/distribution-private-inputs.env.example`: value-free private input template.
- `package.json`: release/check and verify command wiring.
- `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, and `harness/scripts/run_qa.py`: release-harness docs and QA text expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1061-external-operator-runbook` and `.worktree/plan-1061-external-operator-runbook`.
- The runbook must stay value-free and must not weaken the hard external gate.
- The no-credential `npm run release:check` path must continue to pass while hard external distribution remains blocked.

## Implementation Plan

- [x] Add `desktop:external-operator-runbook-smoke` that reads completion status, remediation, manual QA, private-input template, and hard-gate evidence.
- [x] Write Markdown/JSON runbook artifacts under ignored `build/desktop/` with command phases, evidence checklist, current manual QA digest, final hard-gate command, and not-recorded/not-claimed posture.
- [x] Wire the runbook smoke into `npm run verify` after completion status.
- [x] Update README, harness architecture, quality rules, release readiness evidence, and QA expectations.
- [x] Run QA/release checks, then complete the plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_external_operator_runbook_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:external-operator-runbook-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should still fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add an operator runbook after completion status. | Completion status proves local readiness, and remediation lists blockers; a concise command-sequence runbook makes the final external handoff less error-prone without weakening the hard gate. |
| 2026-06-28 | Keep the runbook non-claiming and value-free. | The artifact should guide final distribution work but must not imply private values, signing, notarization, Gatekeeper approval, auto-update, manual QA approval, or external distribution completion are already done. |
| 2026-06-28 | Keep the hard external gate authoritative. | The runbook can order the remaining operator work and expose the manual QA digest, but only `npm run release:external-check` can prove final external distribution readiness. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for a value-free external operator runbook. |
| 2026-06-28 | harness_builder | Added `run_desktop_external_operator_runbook_smoke.mjs`, package wiring, release docs, quality rules, and QA expectations. |
| 2026-06-28 | quality_runner | `node --check`, package JSON parse, standalone `desktop:external-operator-runbook-smoke`, `git diff --check`, and `python3 -B harness/scripts/run_qa.py` passed. |
| 2026-06-28 | quality_runner | `npm run release:check` passed and generated the runbook with `Operator runbook ready: yes`, `Completion stage: local release ready; external distribution pending`, seven pending remediation groups, and manual QA digest evidence. |
| 2026-06-28 | quality_runner | Hard external distribution gate failed as expected until private channel inputs, auto-update/feed metadata, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, and manual QA digest approval are present. |

## Completion Notes

Completed. GrooveForge now writes a value-free external operator runbook Markdown/JSON artifact after completion status. The runbook consolidates the current completion stage, remediation groups, command sequence, evidence checklist, required private key names, manual QA checklist digest evidence, and the final hard-gate command without recording private values or claiming external distribution completion.

QA completed:

- `node --check harness/scripts/run_desktop_external_operator_runbook_smoke.mjs`
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package json ok')"`
- `npm run desktop:external-operator-runbook-smoke`
- `git diff --check`
- `python3 -B harness/scripts/run_qa.py`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected until private external-distribution evidence is complete.
