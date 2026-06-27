# plan-1035-auto-update-readiness-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local desktop auto-update readiness smoke that inspects the packaged GrooveForge app and release metadata for explicit update-channel readiness, writes a machine-readable readiness summary, and keeps auto-update/external-distribution claims false until a real signed update feed, provider, and rollout policy are present.

## Non-Goals

- Do not add remote update checks, background network calls, telemetry, accounts, cloud sync, payments, or analytics.
- Do not claim auto-update support unless a concrete update provider, feed URL/channel, signed artifact policy, and user-facing update behavior are implemented and verified.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, app-store submission, PKG installer creation, real `/Applications` install, or external distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: records local app/DMG artifact metadata and currently marks auto-update unclaimed.
- `harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`: reports external signing/notary readiness without network submission.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1035-auto-update-readiness-smoke` and `.worktree/plan-1035-auto-update-readiness-smoke` for git repository work.
- Keep generated readiness artifacts under ignored `build/`.
- Keep GrooveForge local-first unless there is an explicit rationale for a network update provider.

## Implementation Plan

- [x] Add a `desktop:auto-update-readiness-smoke` script that inspects package/release metadata for update provider, feed/channel, signed artifact, and user-facing update behavior signals.
- [x] Write a local auto-update readiness JSON summary under ignored `build/desktop/`.
- [x] Treat missing update infrastructure as a reported readiness blocker, not a false pass or an accidental network call.
- [x] Wire the smoke into `npm run verify` after release manifest smoke and before Developer ID readiness smoke.
- [x] Update docs and QA expectations without claiming auto-update support.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:auto-update-readiness-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add readiness reporting before auto-update implementation. | The release evidence currently lists auto-update as unclaimed; a machine-readable readiness summary prevents completion reports from overstating external distribution readiness. |
| 2026-06-28 | Keep the smoke local and network-free. | GrooveForge remains local-first, and update feed/network behavior should only be added after an explicit distribution target is chosen. |
| 2026-06-28 | Run auto-update readiness after release manifest smoke. | The smoke consumes release metadata and should run before external distribution readiness reporting finishes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local auto-update readiness reporting. |
| 2026-06-28 | harness_builder | Added `harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`, `npm run desktop:auto-update-readiness-smoke`, verify wiring after release manifest smoke, and docs/QA expectations for auto-update readiness reporting. |
| 2026-06-28 | quality_runner | Passed `git diff --check`, `node --check harness/scripts/run_desktop_auto_update_readiness_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `npm run build`, `npm run desktop:package-smoke`, `npm run desktop:adhoc-sign-smoke`, `npm run desktop:dmg-smoke`, `npm run desktop:install-smoke`, `npm run desktop:gatekeeper-readiness-smoke`, `npm run desktop:release-manifest-smoke`, `npm run desktop:auto-update-readiness-smoke`, and `npm run release:check`. Electron GUI, codesign, hdiutil, spctl, and packaged release artifact checks ran with macOS runtime access where needed. |

## Completion Notes

Completed local auto-update readiness smoke. The release gate now writes `build/desktop/GrooveForge-darwin-arm64-auto-update-readiness.json`, checks updater dependency/API integration, update provider/feed/channel metadata, signed update metadata artifacts, and user-facing update behavior, and keeps `networkProbeAttempted`, `releaseGateClaimedAutoUpdate`, and `releaseGateClaimedExternalDistribution` false.

Latest observed auto-update readiness output reported updater integration ready: no, update provider ready: no, signed update policy ready: no, user-facing update behavior ready: no, and auto-update ready: no. The recorded blockers are: no auto-update package/API integration with update checking is implemented; no update provider, feed URL, and channel metadata are configured; no signed/notarized update metadata artifact policy is available for automatic updates; no user-facing update check, download, and install behavior is implemented. This plan does not claim auto-update, Developer ID signing, notarization, Gatekeeper approval, app-store submission, real `/Applications` install, or external distribution-channel QA.
