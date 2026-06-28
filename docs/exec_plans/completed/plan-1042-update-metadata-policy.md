# plan-1042-update-metadata-policy

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local signed-update metadata policy smoke so the auto-update readiness gate can distinguish "no update metadata policy exists" from the remaining external signing, notarization, feed, and distribution-channel blockers.

## Non-Goals

- Do not claim automatic update support.
- Do not generate or publish a live update feed.
- Do not record private feed URLs, tokens, credentials, or signing secrets.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA.
- Do not submit to Apple notary services or probe remote update providers.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: writes local release artifact manifest and current signing claims.
- `harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`: reports updater integration, provider/feed state, and update metadata blockers.
- `electron/main.ts`: exposes the user-facing Help > Check for Updates path through Electron's built-in updater API.
- `docs/release/readiness.md`: release evidence matrix and unclaimed external-distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1042-update-metadata-policy` and `.worktree/plan-1042-update-metadata-policy` for git repository work.
- Write generated update metadata policy summaries only under ignored `build/desktop/`.
- Treat missing provider/feed, Developer ID, notarization, and signed update artifacts as blockers in readiness output, not as default QA failures.

## Implementation Plan

- [x] Add `desktop:update-metadata-policy-smoke`.
- [x] Have the smoke read the release manifest and write a local update metadata policy JSON with required feed metadata, blockmap/latest metadata, signing, notarization, and checksum inputs.
- [x] Keep all release claim flags false and avoid recording private feed values.
- [x] Update auto-update readiness to read the policy and distinguish policy availability from actual signed/notarized update readiness.
- [x] Wire the policy smoke into `npm run verify` before auto-update readiness.
- [x] Update docs, QA expectations, release readiness, review, and completion notes without claiming auto-update or external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_update_metadata_policy_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:release-manifest-smoke`
- `npm run desktop:update-metadata-policy-smoke`
- `npm run desktop:auto-update-readiness-smoke`
- `npm run release:check`

## Review Plan

QA completed before review started.

Review completed with no blocking findings.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add policy evidence before live provider/feed work. | A local policy makes signed update metadata requirements explicit without claiming automatic updates or probing remote infrastructure. |
| 2026-06-28 | Keep auto-update readiness false until provider/feed and signed/notarized artifacts exist. | A policy is a prerequisite, not proof that users can receive automatic updates. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local signed-update metadata policy evidence. |
| 2026-06-28 | harness_builder | Added `run_desktop_update_metadata_policy_smoke.mjs`, package script wiring, and verify-chain integration. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness, and QA expectations for update metadata policy evidence. |
| 2026-06-28 | quality_runner | `node --check`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run build`, release manifest smoke, update metadata policy smoke, auto-update readiness smoke, and `npm run release:check` passed. |
| 2026-06-28 | review_judge | Reviewed post-QA with no blocking findings; remaining blockers are update provider/feed/channel metadata, Developer ID identity, notarization/stapling, signed/notarized update artifacts, Gatekeeper acceptance, and distribution-channel QA. |

## Completion Notes

Completed. `desktop:update-metadata-policy-smoke` now writes `build/desktop/GrooveForge-<platform>-<arch>/GrooveForge-<version>-<platform>-<arch>-update-metadata-policy.json`, records required `latest-mac.yml`, `app-update.yml`, and DMG blockmap policy, keeps feed/channel values out of output, and lists Developer ID signing, notarization, Gatekeeper acceptance, and external distribution-channel prerequisites without claiming auto-update support.

`desktop:auto-update-readiness-smoke` now reads that policy and separates `updateMetadataPolicyReady` from `signedUpdateArtifactsReady`. The latest local run reports update metadata policy ready: yes, signed update artifacts ready: no, and blockers for missing provider/feed/channel metadata plus missing Developer ID/notarized update metadata artifacts. It did not probe remote update feeds and did not claim auto-update, Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA.
