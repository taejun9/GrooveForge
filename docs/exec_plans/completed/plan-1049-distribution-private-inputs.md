# plan-1049-distribution-private-inputs

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local distribution private-inputs smoke that summarizes the remaining external distribution environment requirements for signing, notarization, update feeds, release/support URLs, channel metadata, and manual channel QA without recording private values, uploading artifacts, probing remote services, or claiming external distribution readiness.

## Non-Goals

- Do not upload releases, publish pages, publish update feeds, or probe remote services.
- Do not record release URLs, support URLs, feed URLs, channel values, Developer ID identity labels, credentials, tokens, Apple credentials, or API key material.
- Do not sign primary artifacts, notarize, staple, run Gatekeeper approval as a success claim, or mark external distribution complete.
- Do not change project schema, audio behavior, export semantics, UI workflow, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/run_desktop_distribution_bundle_manifest_smoke.mjs`: latest redacted bundle evidence checklist.
- `harness/scripts/run_desktop_distribution_handoff_smoke.mjs`: redacted local handoff artifact.
- `harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`: channel blocker summary.
- `harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`: local signing/notary prerequisite signals.
- `docs/release/readiness.md`: release evidence matrix and external distribution blockers.
- `docs/quality/rules.md`: QA contract for release-readiness smokes.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1049-distribution-private-inputs` and `.worktree/plan-1049-distribution-private-inputs` for git repository work.
- Keep private input reporting local, deterministic, redacted, and value-free.
- Treat missing private inputs and manual approvals as blockers, not QA failures.

## Implementation Plan

- [x] Add `desktop:distribution-private-inputs-smoke`.
- [x] Have the smoke read the bundle manifest, handoff, distribution-channel QA, auto-update readiness, Developer ID readiness/signing, notarization, and notarized Gatekeeper summaries when available.
- [x] Write Markdown and JSON private-input checklist artifacts under ignored `build/desktop/`.
- [x] Group required input keys by distribution channel, release/support URLs, update feed/channel, Developer ID signing, notarization credentials, and manual approval.
- [x] Record only key names, presence booleans, validation booleans, blockers, and next local commands; never record values.
- [x] Wire the smoke into `npm run verify` after distribution bundle manifest.
- [x] Update docs, QA expectations, release readiness, review, and completion notes without claiming external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:distribution-private-inputs-smoke`
- `npm run release:check`

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a redacted private-inputs distribution smoke after the bundle manifest. | External distribution is blocked by private values and manual approval; a single value-free checklist makes the remaining release work concrete without weakening privacy. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local distribution private-input readiness reporting. |
| 2026-06-28 | harness_builder | Added `desktop:distribution-private-inputs-smoke`, Markdown/JSON redacted private-input artifacts, verify wiring, docs, and QA expectations. |
| 2026-06-28 | quality_runner | Passed `node --check harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs`, `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run desktop:distribution-private-inputs-smoke`, and `npm run release:check`. |

## Completion Notes

Completed. The new smoke writes redacted distribution private-input checklist artifacts after the distribution bundle manifest, records only key names, presence/validation booleans, blockers, and false release claims, and keeps release/support/feed URLs, credentials, tokens, Developer ID identity labels, and channel values out of output. External distribution remains blocked by actual private release inputs, Developer ID signing identity, notary credentials/submission, notarization/stapling, Gatekeeper acceptance, update provider/feed/channel metadata, and manual distribution QA approval.
