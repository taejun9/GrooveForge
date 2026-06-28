# plan-1058-manual-qa-approval-digest

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Bind final manual distribution QA approval to the current local manual QA checklist digest so `GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1` cannot stand alone without proving which value-free checklist was approved.

## Non-Goals

- Do not upload releases, probe download/support/update URLs, submit to Apple, or publish update feeds.
- Do not record release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identity labels, private beats, or real user audio.
- Do not claim manual channel QA approval, auto-update, Developer ID signing, notarization, Gatekeeper approval, or external distribution completion without matching evidence.
- Do not change app UI, audio rendering, project schema, export behavior, generation behavior, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/run_desktop_distribution_manual_qa_smoke.mjs`: writes the local manual QA checklist Markdown/JSON artifact.
- `harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`: currently reads the checklist and checks `GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1`.
- `harness/scripts/distribution_local_env.mjs`: allowlist for ignored local distribution env values.
- `harness/templates/distribution-private-inputs.env.example`: documents the local env keys operators set outside committed code.
- `harness/scripts/run_desktop_distribution_env_template_smoke.mjs` and `run_desktop_distribution_private_inputs_smoke.mjs`: validate redacted env/key readiness.
- `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, and `harness/scripts/run_qa.py`: release harness descriptions and QA expectations must stay aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1058-manual-qa-approval-digest` and `.worktree/plan-1058-manual-qa-approval-digest`.
- The digest must be deterministic for the checklist evidence and safe to print because it must not contain private values.
- Channel QA should remain runnable without private credentials while clearly reporting approval blockers.

## Implementation Plan

- [x] Add a deterministic manual QA checklist digest to the manual QA smoke artifact and Markdown approval instructions.
- [x] Add `GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256` to the local distribution env allowlist and template.
- [x] Require distribution-channel QA to match the provided digest before accepting `GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1`.
- [x] Update env-template/private-inputs smokes, docs, release evidence, and QA expectations.
- [x] Run QA/release checks, then complete plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_distribution_manual_qa_smoke.mjs`
- `node --check harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`
- `node --check harness/scripts/run_desktop_distribution_env_template_smoke.mjs`
- `node --check harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:distribution-manual-qa-smoke`
- `npm run desktop:distribution-channel-qa-smoke`
- `npm run desktop:distribution-env-template-smoke`
- `npm run desktop:distribution-private-inputs-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Bind manual approval to a deterministic checklist digest. | Final channel approval should prove which local checklist evidence was approved without recording private channel values. |
| 2026-06-28 | Treat the checklist digest as value-free evidence, not a secret. | The digest identifies the current checklist without exposing release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for manual QA approval digest binding. |
| 2026-06-28 | harness_builder | Added deterministic `manualQaChecklistSha256` evidence to the distribution manual QA smoke and added `GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256` to local env/template flows. |
| 2026-06-28 | harness_builder | Updated distribution-channel QA to require the matching checklist digest before accepting `GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1`. |
| 2026-06-28 | quality_runner | `git diff --check`, script syntax checks, `python3 -B harness/scripts/run_qa.py`, targeted distribution smokes, and `npm run release:check` passed. |
| 2026-06-28 | quality_runner | Verified that providing the current checklist SHA-256 plus `GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1` makes channel QA report `Manual QA checklist digest matched: yes` while external distribution remains blocked by other missing evidence. |
| 2026-06-28 | quality_runner | Hard external distribution gate failed as expected without private inputs, auto-update readiness, Developer ID signing, notarization/stapling, notarized Gatekeeper, and matching manual approval evidence. |

## Completion Notes

Completed. Manual distribution QA now emits a deterministic `manualQaChecklistSha256` digest in the local Markdown/JSON checklist. The redacted local env template and private-input checks include `GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256`, and distribution-channel QA now accepts `GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1` only when that digest matches the current manual QA checklist. The no-credential local release gate still passes, while hard external distribution remains blocked until private release/update/channel inputs, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, and matching manual approval are provided and verified.
