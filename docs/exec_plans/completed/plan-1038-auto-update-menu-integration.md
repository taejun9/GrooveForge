# plan-1038-auto-update-menu-integration

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a smoke-safe Electron auto-update integration surface so the desktop app has a real user-facing "Check for Updates" path and local readiness evidence, while keeping provider/feed, signed update metadata, Developer ID, notarization, Gatekeeper, and external distribution claims false until those prerequisites are actually present.

## Non-Goals

- Do not add a remote update feed, probe a network feed during QA, or claim auto-update support is complete.
- Do not add or require accounts, analytics, telemetry, cloud sync, payments, ads, or remote AI.
- Do not print private update feed values or notary credential values.
- Do not replace the local-first app model.
- Do not change beat composition, playback, rendering, export semantics, project schema, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `electron/main.ts`: native desktop menus, project file handlers, app launch smoke.
- `harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`: current readiness smoke that reports missing updater integration and user-facing update behavior as blockers.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1038-auto-update-menu-integration` and `.worktree/plan-1038-auto-update-menu-integration` for git repository work.
- Keep generated readiness artifacts under ignored `build/`.
- Keep update feed values out of logs and JSON summaries.

## Implementation Plan

- [x] Add Electron built-in `autoUpdater` integration behind an explicit Help > Check for Updates command.
- [x] Keep smoke mode network-free and make missing feed/provider state user-facing without probing remote update feeds.
- [x] Add update event handling for available, not-available, error, and downloaded states, including explicit install behavior only after a downloaded update.
- [x] Update auto-update readiness smoke so Electron built-in autoUpdater integration and user-facing behavior are recognized while provider/feed and signed update policy remain blockers.
- [x] Update docs, QA expectations, and release readiness without claiming auto-update completion.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:smoke`
- `npm run desktop:launch-smoke`
- `npm run desktop:auto-update-readiness-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Use Electron's built-in `autoUpdater` instead of adding a package dependency. | The current desktop app already depends on Electron; using the built-in API keeps the app local-first and avoids adding a new update framework before a provider is selected. |
| 2026-06-28 | Keep update checks user-initiated and feed-gated. | QA must stay network-free and auto-update completion should remain unclaimed until a real feed/provider and signed update metadata policy exist. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for smoke-safe auto-update menu integration. |
| 2026-06-28 | harness_builder | Added Help > Check for Updates with Electron built-in `autoUpdater`, feed-gated checks, downloaded-update install handling, and private feed-safe error copy. |
| 2026-06-28 | quality_runner | Updated auto-update readiness smoke so integration and user-facing behavior report ready while provider/feed and signed update metadata remain blockers. |
| 2026-06-28 | quality_runner | `npm run release:check` passed; auto-update readiness reported updater integration ready yes, user-facing update behavior ready yes, auto-update ready no. |
| 2026-06-28 | review_judge | Reviewed post-QA with no blocking findings; remaining blockers are update provider/feed/channel metadata, signed update metadata, Developer ID identity, notary credentials, and Gatekeeper acceptance. |

## Completion Notes

Completed smoke-safe auto-update menu integration.

The Electron Help menu now exposes `Check for Updates...`. It uses Electron's built-in `autoUpdater`, stays network-free in launch smoke mode, shows a local "not configured" status when feed/channel env keys are absent, and only calls `autoUpdater.checkForUpdates()` after an explicit user action with feed/channel signals present. Update events cover checking, available, not available, error, and downloaded states; `quitAndInstall()` is offered only after an update is downloaded.

The auto-update readiness smoke now reports updater integration ready and user-facing update behavior ready, while keeping auto-update ready false because provider/feed/channel metadata and signed update metadata are still missing.

QA passed:

- `git diff --check`
- `node --check harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:smoke`
- `npm run desktop:launch-smoke`
- `npm run release:check`
