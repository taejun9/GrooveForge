# plan-1056-signed-update-artifact-chain

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Connect the local update metadata artifact draft path to the signed/notarized distribution evidence chain so update metadata can prefer a notarized isolated DMG when Developer ID signing and notarization evidence exist, while keeping the current unsigned local DMG fallback and no external-distribution claims.

## Non-Goals

- Do not publish update feeds, upload releases, submit to Apple, or probe remote update servers.
- Do not record feed URLs, channel values, credentials, tokens, Developer ID identity labels, private beats, or real user audio.
- Do not claim auto-update, Developer ID signing, notarization, Gatekeeper approval, or external distribution completion without matching evidence.
- Do not change app UI, audio rendering, project schema, export behavior, generation behavior, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/run_desktop_update_metadata_artifacts_smoke.mjs`: drafts `latest-mac.yml`, `app-update.yml`, and a DMG blockmap from the local release manifest DMG.
- `harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`: reads update metadata draft state and currently requires signed/notarized update artifacts before auto-update readiness.
- `harness/scripts/run_desktop_developer_id_signing_smoke.mjs`: can produce an isolated Developer ID signed app copy when private identity evidence exists.
- `harness/scripts/run_desktop_notarization_smoke.mjs`: can produce an isolated notarized/stapled DMG when signing, credentials, and explicit submission are available.
- `harness/scripts/run_desktop_notarized_gatekeeper_smoke.mjs`: validates the isolated notarized DMG through local Gatekeeper checks.
- `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, and `harness/scripts/run_qa.py`: release harness descriptions and QA expectations must stay aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1056-signed-update-artifact-chain` and `.worktree/plan-1056-signed-update-artifact-chain`.
- Generated update metadata drafts must remain local ignored build artifacts.
- Signed/notarized artifact selection must be value-free and path/checksum based.

## Implementation Plan

- [x] Teach the update metadata artifact smoke to read Developer ID signing, notarization, and notarized Gatekeeper summaries.
- [x] Prefer a notarized/stapled isolated DMG as the update metadata source when it is present and accepted; otherwise retain the release manifest DMG fallback with blockers.
- [x] Expose selected update artifact readiness, signing/notarization/Gatekeeper evidence booleans, and source fallback reason in the artifact summary without private values.
- [x] Update auto-update readiness to use the selected update artifact evidence instead of relying only on release manifest signing claims.
- [x] Update docs and QA expectations.
- [x] Run QA/release checks, then complete plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_update_metadata_artifacts_smoke.mjs`
- `node --check harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:update-metadata-artifacts-smoke`
- `npm run desktop:auto-update-readiness-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Prefer notarized isolated DMG evidence for update metadata when present. | The final update feed should target the artifact that actually satisfies signing, notarization, and Gatekeeper checks, while local development still needs a safe fallback. |
| 2026-06-28 | Keep unsigned fallback metadata draft generation available. | The release gate must remain runnable without private Apple credentials while still showing that signed/notarized update artifact evidence is missing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for signed/notarized update artifact evidence selection. |
| 2026-06-28 | harness_builder | Added selected DMG source evidence to update metadata artifact drafts and wired auto-update readiness to signed/notarized/Gatekeeper artifact evidence. |
| 2026-06-28 | quality_runner | `git diff --check`, `python3 -B harness/scripts/run_qa.py`, and `npm run release:check` passed. |
| 2026-06-28 | quality_runner | Hard external distribution gate failed as expected without private inputs, update provider/feed/channel, Developer ID signing, notarization/stapling, notarized Gatekeeper, and manual channel QA evidence. |

## Completion Notes

Completed. Update metadata artifacts now record selected DMG evidence, prefer a notarized isolated DMG when Developer ID signing, notarization/stapling, and notarized Gatekeeper summaries are ready, and otherwise fall back to the release manifest DMG. Auto-update readiness now reads that selected signed/notarized update artifact evidence and reports `Update artifact source: release-manifest-dmg` and `Signed update artifacts ready: no` in the current credential-free local run. External distribution remains blocked on private inputs, update provider/feed/channel metadata, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, and manual channel QA.
