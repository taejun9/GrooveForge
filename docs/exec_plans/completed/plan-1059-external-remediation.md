# plan-1059-external-remediation

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a value-free external distribution remediation artifact that translates the hard external-distribution gate blockers into ordered operator action groups, required evidence keys, prerequisite commands, and next rerun commands without recording private values.

## Non-Goals

- Do not upload releases, probe download/support/update URLs, submit to Apple, publish update feeds, or contact remote distribution channels.
- Do not record release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identity labels, private beats, or real user audio.
- Do not claim auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, or external distribution completion without current evidence.
- Do not change app UI, audio rendering, project schema, export behavior, generation behavior, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`: final dry-run and hard external-distribution gate.
- `harness/scripts/run_desktop_completion_audit_smoke.mjs`: current evidence-based completion audit and external blocker consolidation.
- `harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs`: redacted private input grouping and validation.
- `harness/templates/distribution-private-inputs.env.example`: committed value-free env template operators copy outside the repo.
- `package.json`: wires desktop distribution smokes into `npm run verify` and `npm run release:check`.
- `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, and `harness/scripts/run_qa.py`: release-harness docs and QA text expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1059-external-remediation` and `.worktree/plan-1059-external-remediation`.
- The remediation artifact must be useful without private credentials and must remain safe to commit/run locally.
- The no-credential `npm run release:check` path must continue to pass while hard external distribution remains blocked.

## Implementation Plan

- [x] Add a new `desktop:external-remediation-smoke` script that reads the current completion audit, private-inputs, distribution-channel QA, auto-update, signing, notarization, Gatekeeper, and external gate summaries.
- [x] Normalize blockers into ordered remediation groups for private metadata, update feed/channel, Developer ID signing, notarization/stapling, Gatekeeper assessment, manual QA approval digest, and final hard-gate rerun.
- [x] Write Markdown/JSON remediation artifacts under ignored `build/desktop/`, including evidence paths, required key names, prerequisite commands, and rerun commands while recording no private values.
- [x] Wire the smoke into `npm run verify` after the external gate dry run and update docs/QA expectations.
- [x] Run QA/release checks, then complete the plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_external_remediation_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:external-remediation-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should still fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add remediation as a separate value-free artifact after the hard gate dry run. | The hard gate already enforces truth; a separate remediation artifact makes the remaining external operator work explicit without weakening the gate. |
| 2026-06-28 | Keep remediation advisory and non-claiming. | The artifact should guide final distribution work but must not imply URLs, credentials, signing, notarization, Gatekeeper, auto-update, or channel approval are complete. |
| 2026-06-28 | Keep final hard gate separate from remediation readiness. | The remediation artifact can order remaining work, but only `release:external-check` may fail/pass the final distribution claim. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for external-distribution remediation evidence. |
| 2026-06-28 | harness_builder | Added `run_desktop_external_remediation_smoke.mjs`, `desktop:external-remediation-smoke`, and verify-chain wiring after the dry-run external distribution gate. |
| 2026-06-28 | harness_builder | Updated README, harness architecture, quality rules, release readiness evidence, and QA expectations for the new remediation artifact. |
| 2026-06-28 | quality_runner | `git diff --check`, `node --check harness/scripts/run_desktop_external_remediation_smoke.mjs`, `python3 -B harness/scripts/run_qa.py`, targeted external remediation smoke, and `npm run release:check` passed. |
| 2026-06-28 | quality_runner | Hard external distribution gate failed as expected until private distribution inputs, auto-update/feed metadata, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, and manual QA digest approval are present. |

## Completion Notes

Completed. The release gate now writes a value-free external remediation Markdown/JSON artifact after the dry-run hard gate. The artifact groups the remaining external-distribution work into ordered operator action groups for redacted evidence, release channel metadata, auto-update feed and signed metadata, Developer ID signing, notarization/stapling, notarized Gatekeeper assessment, manual QA approval digest, and final hard-gate rerun. It records required key names, evidence paths, prerequisite commands, operator actions, rerun commands, blockers, and redaction posture only. `npm run release:check` passes, while the hard external gate still fails until real private inputs, signing, notarization/stapling, Gatekeeper acceptance, update metadata, channel metadata, and manual QA digest approval are provided and verified.
