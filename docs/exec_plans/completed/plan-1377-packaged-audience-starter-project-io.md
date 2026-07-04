# plan-1377-packaged-audience-starter-project-io

## Goal

Prove that both Audience Starter projects remain usable after save/open through the packaged `GrooveForge.app` bundle. First-time composers and professional producers should get the same starter project IO confidence in the packaged desktop app as in the native development Electron app.

## Scope

- Extend packaged desktop project IO smoke with first-time composer and professional producer Audience Starter fixtures.
- Save and reopen each fixture through the actual packaged app preload bridge.
- Report value-free per-fixture evidence for audience, mode, style, key, BPM, bars, delivery target, editable event count, and SHA-256 match.
- Preserve existing packaged project IO framework dependency checks and release/privacy boundaries.

## Non-Goals

- Do not change starter project generation content.
- Do not add remote AI, accounts, analytics, cloud sync, sampling-first flows, or external distribution behavior.
- Do not record private values, real user audio, release URLs, support URLs, feed URLs, credentials, or channel values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, or external distribution completion.

## Context Map

- `harness/scripts/run_desktop_packaged_project_io_smoke.mjs`
- `harness/scripts/run_desktop_project_io_smoke.mjs`
- `src/domain/workstation.ts`
- `README.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1377-packaged-audience-starter-project-io` and `.worktree/plan-1377-packaged-audience-starter-project-io`.
- Keep the app local-first and direct-composition-first.
- Actual screen behavior must be verified through Electron launch/project IO smoke before final reporting.

## Implementation Plan

- [x] Compare native and packaged project IO smoke structure.
- [x] Add packaged Audience Starter roundtrip fixtures and report rows.
- [x] Update README, quality rules, and QA guard strings.
- [x] Run focused QA, build/package, and actual Electron launch/project IO smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_desktop_packaged_project_io_smoke.mjs`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run desktop:project-io-smoke`
- `npm run desktop:package-smoke`
- `npm run desktop:packaged-project-io-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Review Plan

QA completes before review starts.

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Extend packaged project IO next because plan-1376 proved the native app path but left packaged app Audience Starter roundtrip coverage as residual risk. |
| 2026-07-05 | quality_runner | Full `release:check` was started with approved GUI/AppKit access and passed through PKG payload project IO, then stopped at `desktop:install-smoke` because ignored build output exhausted disk space; only failed partial install output and already-verified PKG extraction directories were deleted before resuming the remaining evidence chain. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | project_lead | Started plan-1377 from clean main after plan-1376; current overall completion remains `99.999999%` with private release-channel metadata as the external blocker. |
| 2026-07-05 | harness_builder | Added packaged app Audience Starter fixtures for `First Guided Beat` and `Producer Fast Pass`, saving and reopening them through the bundled packaged app preload bridge and IPC handlers. |
| 2026-07-05 | quality_runner | Passed `node --check harness/scripts/run_desktop_packaged_project_io_smoke.mjs`, `git diff --check`, `npm run qa`, `npm run build`, approved GUI `npm run desktop:launch-smoke`, approved GUI `npm run desktop:project-io-smoke`, approved GUI `npm run desktop:package-smoke`, approved GUI `npm run desktop:packaged-project-io-smoke`, resumed the remaining release evidence chain after ENOSPC cleanup, and passed `npm run release:completion-summary-refresh-smoke`. |
| 2026-07-05 | review_judge | Review found no follow-up code changes required; remaining blocker is external/private release-channel metadata outside this implementation scope. |
