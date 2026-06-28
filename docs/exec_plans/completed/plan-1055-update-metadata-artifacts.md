# plan-1055-update-metadata-artifacts

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local, redacted update metadata artifact smoke that creates draft `latest-mac.yml`, `app-update.yml`, and DMG blockmap evidence from the local release manifest so auto-update readiness can distinguish missing metadata files from missing signed/notarized distribution prerequisites.

## Non-Goals

- Do not publish update feeds, upload releases, contact update servers, submit to Apple, or claim auto-update/external distribution completion.
- Do not record feed URLs, channel values, credentials, tokens, Developer ID identity labels, private beats, or real user audio.
- Do not change runtime updater behavior, app UI, audio rendering, project schema, export behavior, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/run_desktop_update_metadata_policy_smoke.mjs`: defines required update metadata artifacts but does not create artifact drafts.
- `harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`: checks for local update metadata files and currently reports them as missing with signing/notarization blockers.
- `package.json`: `verify` runs update feed config, update metadata policy, and auto-update readiness before signing/distribution smokes.
- `docs/quality/rules.md`, `docs/architecture/harness.md`, `docs/release/readiness.md`, and `README.md`: release harness descriptions must stay aligned with scripts.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1055-update-metadata-artifacts` and `.worktree/plan-1055-update-metadata-artifacts`.
- Generated update metadata drafts must remain local ignored build artifacts.
- Drafts must record checksums, sizes, filenames, and placeholder-safe feed/channel policy only; never private feed/channel values.

## Implementation Plan

- [x] Add `run_desktop_update_metadata_artifacts_smoke.mjs`.
- [x] Generate local draft `latest-mac.yml`, `app-update.yml`, and DMG blockmap artifacts from the release manifest without publishing or claiming auto-update.
- [x] Update auto-update readiness to read artifact draft evidence and report metadata file readiness separately from signing/notarization readiness.
- [x] Add npm scripts, verify/release chain order, docs, and QA expectations.
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
| 2026-06-28 | Add local update metadata artifact drafts before auto-update readiness. | The hard gate still needs auto-update evidence; local metadata artifact generation can be proven without remote feed publishing or private credentials. |
| 2026-06-28 | Keep auto-update readiness false until signed/notarized prerequisites exist. | Draft metadata files prove local artifact generation only; they are not published feed evidence and do not replace Developer ID signing, notarization, Gatekeeper, or channel QA. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local update metadata artifact draft evidence. |
| 2026-06-28 | harness_builder | Added the update metadata artifact smoke and connected it between update metadata policy and auto-update readiness. |
| 2026-06-28 | quality_runner | `python3 -B harness/scripts/run_qa.py`, `git diff --check`, and `npm run release:check` passed. |
| 2026-06-28 | quality_runner | Hard external distribution gate failed as expected without private inputs, feed/provider evidence, Developer ID signing, notarization/stapling, notarized Gatekeeper, and manual channel QA. |

## Completion Notes

Completed. The release check now drafts local `latest-mac.yml`, `app-update.yml`, DMG blockmap, and `update-metadata-artifacts.json` evidence from the release manifest. Auto-update readiness reads that draft evidence and reports `Update metadata files ready: yes` while keeping `Auto-update ready: no` until real provider/feed values, Developer ID signing, notarization/stapling, Gatekeeper acceptance, and channel QA are complete.
