# plan-1065-native-project-io-smoke

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a native desktop project IO smoke that exercises the production Electron preload bridge and IPC handlers for `saveProject` and `openProject`, writes a real `.grooveforge.json` project under ignored `build/desktop/`, reads it back through the native bridge, and verifies the saved file through the domain project parser. This proves the packaged-style desktop save/open path is more than a bridge-existence check.

## Non-Goals

- Do not change normal visible desktop save/open behavior outside explicit smoke mode.
- Do not add cloud sync, accounts, remote services, analytics, payments, imported audio, sampler tracks, or sampling-first workflow.
- Do not write files outside ignored `build/desktop/`.
- Do not claim external distribution readiness, Developer ID signing, notarization, Gatekeeper approval, auto-update, release upload, or manual QA approval.

## Context Map

- `electron/main.ts`: production BrowserWindow, preload bridge, project save/open IPC handlers, and launch smoke hooks.
- `electron/preload.cts`: context-isolated `window.grooveforge.saveProject` and `openProject` bridge.
- `src/domain/workstation.ts`: valid sample-free project creation, serialization, parsing, filenames, arrangement bars, and delivery target data.
- `harness/scripts/run_desktop_launch_smoke.mjs`: existing Electron launch smoke runner pattern.
- `package.json`, `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, and `harness/scripts/run_qa.py`: command wiring and quality expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1065-native-project-io-smoke` and `.worktree/plan-1065-native-project-io-smoke`.
- The smoke must keep output value-free and must not print or store private user audio, private beats, URLs, credentials, tokens, identity labels, channel values, or local env values.
- Native dialog bypass is allowed only under explicit project-IO smoke environment variables.

## Implementation Plan

- [x] Add a production Electron project-IO smoke mode that uses the real preload bridge and IPC handlers while selecting ignored smoke file paths without visible dialogs.
- [x] Add `desktop:project-io-smoke` harness script that builds a valid sample-free project, runs `npm run build` output through Electron smoke mode, validates saved/opened contents, and parses the saved project with domain code.
- [x] Wire the smoke into `npm run verify` after `npm run desktop:launch-smoke` and before packaging checks.
- [x] Update README, harness architecture, quality rules, release readiness evidence, and QA expectations.
- [x] Run QA/release checks, then complete the plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_project_io_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:project-io-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should still fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add native project save/open IO smoke. | Existing desktop smokes verify the bridge exists; the app also needs evidence that the production desktop bridge and IPC handlers can write and reopen real project files. |
| 2026-06-28 | Use explicit smoke-only dialog path bypass. | Automated QA needs deterministic project file paths under ignored `build/desktop/` without changing normal user-facing dialogs. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for native desktop project IO evidence. |
| 2026-06-28 | harness_builder | Added `GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE` Electron mode, smoke-only project path selection, and `desktop:project-io-smoke` harness coverage. |
| 2026-06-28 | quality_runner | `npm run release:check` passed with native project IO smoke in the verify chain; hard external distribution gate still fails as expected until private distribution evidence exists. |

## Completion Notes

Completed. The new native desktop project IO smoke starts the production Electron app, calls `window.grooveforge.saveProject` and `window.grooveforge.openProject` through the real context-isolated preload bridge and IPC handlers, writes `native-project-io-smoke-beat.grooveforge.json` under ignored `build/desktop/`, reopens exact contents, verifies parser roundtrip, 8-bar arrangement, `beat_store` delivery target, filename slug, sample-free content, and value-free release posture.

Validation passed:

- `git diff --check`
- `node --check harness/scripts/run_desktop_project_io_smoke.mjs`
- `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:project-io-smoke` (passed with external Electron execution after sandboxed Electron SIGABRT)
- `npm run release:check`

Hard external distribution gate was rerun without `--dry-run` and failed as expected because private distribution inputs, distribution-channel QA, auto-update readiness, Developer ID signing, notarization/stapling, and notarized Gatekeeper evidence are not complete.
