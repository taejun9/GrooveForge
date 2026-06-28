# plan-1066-packaged-project-io-smoke

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add packaged desktop project IO evidence by launching the assembled macOS `GrooveForge.app` bundle and exercising the same production preload bridge plus IPC save/open handlers against a real sample-free `.grooveforge.json` project. This closes the gap between built-output native IO evidence and the actual local portable app bundle users would run.

## Non-Goals

- Do not change normal visible save/open dialog behavior outside explicit smoke mode.
- Do not add cloud sync, accounts, analytics, remote AI, payments, imported audio, sampler tracks, or sampling-first workflow.
- Do not write outside ignored `build/desktop/`.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, release upload, manual QA approval, app-store submission, or external distribution completion.

## Context Map

- `harness/scripts/run_desktop_project_io_smoke.mjs`: built-output native project IO smoke pattern.
- `harness/scripts/run_desktop_package_smoke.mjs`: macOS `GrooveForge.app` assembly and packaged launch pattern.
- `electron/main.ts`: project IO smoke mode, smoke-only file path selection, BrowserWindow hooks.
- `src/domain/workstation.ts`: sample-free project construction, serialization, parser, filenames, arrangement bars, delivery targets.
- `package.json`, `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, `harness/scripts/run_qa.py`: command wiring and documentation expectations.

## Constraints

- QA and review are separate loops.
- Use `codex/plan-1066-packaged-project-io-smoke` and `.worktree/plan-1066-packaged-project-io-smoke`.
- Do not implement, commit, or push feature work directly on `main`.
- The packaged project IO smoke must run after `desktop:package-smoke` and before signing/readiness smokes.
- Keep all output redacted and value-free: no private beats, real user audio, URLs, credentials, tokens, identity labels, channel values, or local env values.

## Implementation Plan

- [x] Add `run_desktop_packaged_project_io_smoke.mjs` that requires an existing packaged `GrooveForge.app`, launches its executable with `GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE=1`, writes/reopens a sample-free project, and validates parser/roundtrip evidence.
- [x] Add `desktop:packaged-project-io-smoke` and wire it into `npm run verify` after `desktop:package-smoke` and before `desktop:adhoc-sign-smoke`.
- [x] Update README, harness architecture, quality rules, release readiness evidence, and QA expectations.
- [x] Run QA/release checks, then complete the plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_packaged_project_io_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:packaged-project-io-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should still fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add packaged app project IO smoke after package smoke. | Built-output native IO is useful, but users run the packaged app bundle; the package needs its own save/open evidence before signing/readiness steps. |
| 2026-06-28 | Keep hard external distribution gate failing without private external evidence. | The new packaged project IO proof is local app-bundle evidence only; it must not imply Developer ID, notarization, Gatekeeper, auto-update, manual QA, upload, or external-channel readiness. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for packaged desktop project IO evidence. |
| 2026-06-28 | harness_builder | Added `run_desktop_packaged_project_io_smoke.mjs`, `desktop:packaged-project-io-smoke`, verify ordering, docs, and QA self-check expectations. |
| 2026-06-28 | quality_runner | Ran static checks, focused package/project IO smokes, full `npm run release:check`, and the hard external distribution gate negative check. |

## Completion Notes

Completed with a packaged app project save/open smoke that launches the assembled macOS `GrooveForge.app`, calls the bundled `window.grooveforge.saveProject/openProject` bridge through IPC, writes/reopens a sample-free 8-bar `beat_store` `.grooveforge.json`, verifies exact byte and parser roundtrip evidence, and records no private values or external-distribution claims.

Validation completed:

- `git diff --check`
- `node --check harness/scripts/run_desktop_packaged_project_io_smoke.mjs`
- `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"`
- `python3 -B harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:packaged-project-io-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected because private distribution inputs, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, update/channel metadata, and manual QA approval are still not proven.
