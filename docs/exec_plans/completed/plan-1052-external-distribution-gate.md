# plan-1052-external-distribution-gate

## Status

complete

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a final external distribution gate that can hard-fail until Developer ID signing, notarization/stapling, Gatekeeper acceptance, update metadata, release/support/channel metadata, private-input readiness, and manual channel QA are all proven by current redacted artifacts.

## Non-Goals

- Do not add real private values, release/support/feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, or real user audio.
- Do not upload releases, publish update feeds, contact remote services, submit to Apple, or claim external distribution completion without evidence.
- Do not change project schema, UI workflow, audio rendering, export behavior, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/run_desktop_completion_audit_smoke.mjs`: writes local completion audit evidence and external blockers.
- `harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs`: records required private input readiness without values.
- `harness/scripts/run_desktop_distribution_env_template_smoke.mjs`: validates the committed template and ignored local env loader.
- `package.json`: `release:check` is the passing local gate; a separate hard external gate is needed for final distribution proof.
- `docs/release/readiness.md`: current release-readiness matrix and not-claimed scope.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1052-external-distribution-gate` and `.worktree/plan-1052-external-distribution-gate`.
- The hard external gate must not be part of the normal `release:check` pass unless it is dry-run/non-failing.
- The hard external gate must never write or print private values.

## Implementation Plan

- [x] Add a desktop external distribution gate script with `--dry-run` support.
- [x] Add a passing dry-run smoke command to `verify` and a hard `release:external-check` command for final distribution proof.
- [x] Validate the gate against completion audit, env-template, private-inputs, channel QA, auto-update, Developer ID signing, notarization, and Gatekeeper artifacts.
- [x] Write value-free Markdown/JSON gate artifacts under ignored `build/desktop/`.
- [x] Update README, harness architecture, quality rules, release readiness, and QA expectations.
- [x] Run QA/release checks, then complete plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:external-distribution-gate-smoke`
- `npm run release:check`

## Review Plan

Review starts only after QA completes.

## QA Results

- `git diff --check` passed.
- `node --check harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run desktop:external-distribution-gate-smoke` passed and wrote value-free Markdown/JSON artifacts under ignored `build/desktop/`, with hard gate would fail: yes.
- `npm run release:check` passed. Completion audit still reported external distribution ready: no, and the dry-run external distribution gate reported hard gate would fail: yes.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected in hard mode because private inputs, distribution-channel QA, auto-update, Developer ID signing, notarization/stapling, and notarized Gatekeeper evidence are not ready.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a hard external gate separate from normal `release:check`. | Local release checks should stay runnable without private credentials, while final distribution completion needs a command that fails until external evidence is real. |
| 2026-06-28 | Keep the hard gate out of normal `release:check` except through dry-run smoke. | The local release gate should remain passable for code quality, while `release:external-check` is reserved for final distribution proof. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for a final external distribution hard gate and dry-run smoke. |
| 2026-06-28 | harness_builder | Added `run_desktop_external_distribution_gate_smoke.mjs`, `desktop:external-distribution-gate-smoke`, and `release:external-check`. |
| 2026-06-28 | quality_runner | `npm run release:check` passed with dry-run external gate evidence; hard mode failed as expected until external distribution evidence is real. |

## Completion Notes

Completed. GrooveForge now has a value-free external distribution gate artifact and a separate hard `release:external-check` command. Normal `npm run release:check` remains a passing local release gate, while hard external distribution completion fails until current redacted artifacts prove private inputs, distribution-channel QA, auto-update, Developer ID signing, notarization/stapling, and notarized Gatekeeper readiness. No private values, release/support/feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio are recorded.
