# plan-1043-update-feed-config

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a shared update feed configuration policy so the desktop app and release harness validate provider/feed/channel settings before any user-triggered update check can contact a feed.

## Non-Goals

- Do not claim automatic update support.
- Do not generate, sign, notarize, publish, or probe a live update feed.
- Do not record feed URL values, credentials, tokens, Apple credentials, or private release infrastructure in committed files or readiness summaries.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `electron/main.ts`: resolves update feed env vars and calls Electron `autoUpdater` from the Help menu.
- `harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`: reports provider/feed/channel state and auto-update blockers.
- `harness/scripts/run_desktop_update_metadata_policy_smoke.mjs`: records required update metadata artifacts and prerequisites.
- `harness/scripts/run_desktop_entry_smoke.mjs`: validates Electron main-source update integration.
- `docs/release/readiness.md`: release evidence matrix and unclaimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `README.md`: validation and completion-reporting summary.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1043-update-feed-config` and `.worktree/plan-1043-update-feed-config` for git repository work.
- Keep update checks user-initiated and feed-gated.
- Store only env-key names and validation booleans in readiness output, never feed values.

## Implementation Plan

- [x] Extract update feed env-key resolution and validation into a shared Electron module.
- [x] Reject unsafe feed URLs before `autoUpdater.setFeedURL`, including non-HTTPS release feeds, credential-bearing URLs, fragments, and invalid hostnames.
- [x] Validate release channel syntax and require a bounded channel value.
- [x] Add a network-free smoke that proves valid, missing, and unsafe feed/channel configurations are classified without storing feed values.
- [x] Update auto-update readiness to consume the shared policy and distinguish configured-but-unsafe provider settings from missing provider settings.
- [x] Update desktop entry smoke, docs, QA expectations, release readiness, review, and completion notes without claiming auto-update or external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_update_feed_config_smoke.mjs`
- `node --check harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:update-feed-config-smoke`
- `npm run desktop:auto-update-readiness-smoke`
- `npm run release:check`

## Review Plan

QA completed before review started.

Review completed with no blocking findings.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Validate feed configuration locally before live update checks. | The next external-distribution blocker that can be improved without credentials is safe provider/feed/channel configuration. |
| 2026-06-28 | Keep readiness summaries value-free. | Feed URLs can reveal private release infrastructure and should not be written to logs or JSON evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for shared update feed configuration validation. |
| 2026-06-28 | harness_builder | Added `electron/updateFeedConfig.ts`, wired `electron/main.ts` through the shared feed policy, and added `desktop:update-feed-config-smoke`. |
| 2026-06-28 | harness_builder | Updated auto-update readiness to consume the shared redacted feed policy and report unsafe configured provider settings separately from missing provider settings. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness, package scripts, desktop entry smoke, and QA expectations for the new feed config gate. |
| 2026-06-28 | quality_runner | `node --check`, `npm run desktop:update-feed-config-smoke`, `npm run build`, `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run desktop:smoke`, and `npm run release:check` passed. |
| 2026-06-28 | review_judge | Reviewed post-QA with no blocking findings; remaining blockers are update provider/feed values, Developer ID identity, notarization/stapling, signed/notarized update artifacts, Gatekeeper acceptance, and distribution-channel QA. |

## Completion Notes

Completed. `electron/updateFeedConfig.ts` now owns update feed URL/channel resolution, HTTPS-only feed validation, credential/fragment rejection, release-channel syntax validation, and redacted config output. `electron/main.ts` now uses that shared policy before `autoUpdater.setFeedURL`, so unsafe or incomplete feed settings stop before network contact.

`desktop:update-feed-config-smoke` validates missing, valid, fallback, non-HTTPS, credential-bearing, fragment-bearing, and invalid-channel cases without probing a feed. It writes only redacted env-key names, validation booleans, and blockers under ignored `build/desktop/`.

`desktop:auto-update-readiness-smoke` now reports `updateFeedConfigReady` and distinguishes missing provider/feed/channel metadata from present-but-unsafe provider metadata. The latest `npm run release:check` passed and still reports auto-update ready: no because no provider/feed/channel metadata is configured and signed/notarized update metadata artifacts are not ready. It did not claim auto-update, Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA.
