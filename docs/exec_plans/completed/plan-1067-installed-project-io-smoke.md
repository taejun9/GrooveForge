# plan-1067-installed-project-io-smoke

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add installed desktop project IO evidence by launching the simulated Applications copy produced from the local DMG install smoke and exercising the production preload bridge plus IPC save/open handlers against a real sample-free `.grooveforge.json` project. This closes the gap between packaged-app project IO and the local DMG copy-and-launch path.

## Non-Goals

- Do not touch the real `/Applications` directory.
- Do not change normal visible save/open dialog behavior outside explicit smoke mode.
- Do not add cloud sync, accounts, analytics, remote AI, payments, imported audio, sampler tracks, or sampling-first workflow.
- Do not write outside ignored `build/desktop/`.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, release upload, manual QA approval, app-store submission, or external distribution completion.

## Context Map

- `harness/scripts/run_desktop_install_smoke.mjs`: simulated Applications copy and installed app launch pattern.
- `harness/scripts/run_desktop_packaged_project_io_smoke.mjs`: packaged app project IO smoke pattern.
- `electron/main.ts`: project IO smoke mode, smoke-only file path selection, BrowserWindow hooks.
- `src/domain/workstation.ts`: sample-free project construction, serialization, parser, filenames, arrangement bars, delivery targets.
- `package.json`, `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, `harness/scripts/run_qa.py`: command wiring and documentation expectations.

## Constraints

- QA and review are separate loops.
- Use `codex/plan-1067-installed-project-io-smoke` and `.worktree/plan-1067-installed-project-io-smoke`.
- Do not implement, commit, or push feature work directly on `main`.
- The installed project IO smoke must run after `desktop:install-smoke` and before Gatekeeper readiness.
- Keep all output redacted and value-free: no private beats, real user audio, URLs, credentials, tokens, identity labels, channel values, or local env values.

## Implementation Plan

- [x] Add `run_desktop_installed_project_io_smoke.mjs` that requires the simulated installed `GrooveForge.app`, launches its executable with `GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE=1`, writes/reopens a sample-free project, and validates parser/roundtrip evidence.
- [x] Add `desktop:installed-project-io-smoke` and wire it into `npm run verify` after `desktop:install-smoke` and before `desktop:gatekeeper-readiness-smoke`.
- [x] Update README, harness architecture, quality rules, release readiness evidence, and QA expectations.
- [x] Run QA/release checks, then complete the plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_installed_project_io_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:packaged-project-io-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:dmg-smoke`
- `npm run desktop:install-smoke`
- `npm run desktop:installed-project-io-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should still fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add installed app project IO smoke after install smoke. | Package-level project IO is useful, but the local DMG copy path should also prove the same save/open behavior before Gatekeeper readiness. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for installed desktop project IO evidence. |
| 2026-06-28 | harness_builder | Added installed project IO smoke, package script wiring, verify ordering, documentation, and QA expectations. |
| 2026-06-28 | quality_runner | QA completed: `git diff --check`, `node --check` for the new and updated desktop scripts, `python3 -B harness/scripts/run_qa.py`, `npm run build`, focused desktop package/project/signing/DMG/install/installed-project-IO smokes, and `npm run release:check` passed. Hard external gate failed as expected because external distribution evidence is still missing. |

## Completion Notes

`desktop:installed-project-io-smoke` now launches the simulated Applications copy created by `desktop:install-smoke`, exercises the installed app's bundled preload bridge and IPC save/open handlers, writes/reopens a sample-free 8-bar `beat_store` `.grooveforge.json` under ignored `build/desktop/`, verifies exact bytes plus parser roundtrip, and records no private values or external-distribution claims. `npm run verify` runs this smoke after `desktop:install-smoke` and before Gatekeeper readiness.
