# plan-1054-update-local-env

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Let update feed config, update metadata policy, and auto-update readiness smokes consume the existing ignored distribution local env file path so auto-update external-distribution readiness can be driven by the same redacted private-input workflow.

## Non-Goals

- Do not commit private values, release/support/feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, or real user audio.
- Do not probe update feeds, upload releases, publish update feeds, contact remote services, submit to Apple, or claim auto-update/external distribution completion without evidence.
- Do not change project schema, UI workflow, audio rendering, export behavior, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/distribution_local_env.mjs`: shared ignored `.env.distribution.local` loader with placeholder rejection and value-free reporting.
- `harness/scripts/run_desktop_update_feed_config_smoke.mjs`: validates update feed/channel config cases but currently does not load ignored local env.
- `harness/scripts/run_desktop_update_metadata_policy_smoke.mjs`: writes required update metadata policy and currently reads only exported update feed/channel env keys.
- `harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`: checks provider/feed/channel readiness and currently reads only exported update feed/channel env keys.
- `harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`: hard gate fails until auto-update, signing, notarization/Gatekeeper, private inputs, and channel QA are ready.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1054-update-local-env` and `.worktree/plan-1054-update-local-env`.
- The local env loader must never print or write private values.
- Update feed/channel values must be validated locally and redacted from all artifacts.

## Implementation Plan

- [x] Wire `loadDistributionLocalEnv` into update feed config, update metadata policy, and auto-update readiness smokes before they inspect update feed/channel env keys.
- [x] Record only local env loader metadata and key names in JSON summaries and console output.
- [x] Keep feed/channel value redaction checks strict across policy/readiness artifacts.
- [x] Update README, harness architecture, quality rules, release readiness, and QA expectations.
- [x] Run QA/release checks, then complete plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_update_feed_config_smoke.mjs`
- `node --check harness/scripts/run_desktop_update_metadata_policy_smoke.mjs`
- `node --check harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:update-feed-config-smoke`
- `npm run desktop:update-metadata-policy-smoke`
- `npm run desktop:auto-update-readiness-smoke`
- `npm run release:check`

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Extend the redacted local env loader into update feed and auto-update smokes. | External distribution hard gate requires auto-update readiness, so update feed/channel private inputs need the same ignored-file workflow as signing/notarization. |
| 2026-06-28 | Keep external distribution hard gate failing without private evidence. | The plan improves local env consumption and redaction, but must not claim auto-update, signing, notarization, Gatekeeper, channel QA, or external distribution completion. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for update feed and auto-update local env support. |
| 2026-06-28 | harness_builder | Added the shared redacted distribution local env loader to update feed config, update metadata policy, and auto-update readiness smokes. |
| 2026-06-28 | quality_runner | `git diff --check`, three `node --check` commands, `python3 -B harness/scripts/run_qa.py`, and `npm run release:check` passed. |
| 2026-06-28 | quality_runner | Hard external distribution gate failed as expected without private inputs, auto-update provider/feed evidence, Developer ID signing, notarization/stapling, notarized Gatekeeper, and manual channel QA. |

## Completion Notes

Completed. Update feed config, update metadata policy, and auto-update readiness now read the ignored distribution local env file through the shared redacted loader before inspecting update feed/channel signals. The smoke artifacts record loader metadata and key names only, keep `localEnvValueRecorded: false`, and reject private distribution values in output. External distribution remains blocked until the hard gate has real private-input, signing, notarization, Gatekeeper, auto-update, and channel-QA evidence.
