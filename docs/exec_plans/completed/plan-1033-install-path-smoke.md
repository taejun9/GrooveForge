# plan-1033-install-path-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local macOS DMG install-path smoke that mounts the generated DMG, copies `GrooveForge.app` into an ignored simulated install directory, verifies the copied app retains the ad-hoc signature and branded payload, then launches the installed copy through the production hidden-window smoke.

## Non-Goals

- Do not copy the app into the real `/Applications` directory.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, PKG installer creation, or external distribution-channel QA.
- Do not submit anything to Apple notary services or make network calls.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not add accounts, analytics, payments, cloud sync, remote AI, imported-audio requirements, or sampling-first copy.

## Context Map

- `harness/scripts/run_desktop_dmg_smoke.mjs`: creates and mounts the local ad-hoc signed DMG artifact.
- `harness/scripts/run_desktop_adhoc_sign_smoke.mjs`: proves the packaged app can be signed and launched before DMG creation.
- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: records local app/DMG checksum evidence.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1033-install-path-smoke` and `.worktree/plan-1033-install-path-smoke` for git repository work.
- Keep generated install artifacts under ignored `build/`.
- Keep GrooveForge direct-composition first; sampling remains optional and out of this plan.

## Implementation Plan

- [x] Add a `desktop:install-smoke` script that mounts the local DMG and copies `GrooveForge.app` into an ignored simulated install directory.
- [x] Verify the installed copy has the GrooveForge bundle id, icon, packaged renderer/main/preload assets, no `electron.icns`, and retained `Signature=adhoc`.
- [x] Launch the installed copy through `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1` and validate the same first-run desktop evidence.
- [x] Wire the install-path smoke into `npm run verify` after DMG smoke and before release manifest/readiness smoke.
- [x] Update docs and QA expectations without claiming real `/Applications`, Developer ID signing, notarization, or external distribution QA.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_install_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:install-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Simulate install under ignored `build/desktop/` instead of real `/Applications`. | The smoke should prove the DMG install path without mutating the user's system Applications directory. |
| 2026-06-28 | Keep external distribution claims unclaimed. | Copy-and-launch from a local DMG is useful install-path evidence, but it is not Developer ID signing, notarization, Gatekeeper approval, or external channel QA. |
| 2026-06-28 | Run install smoke after DMG smoke and before manifest/readiness. | The install check consumes the final local DMG artifact and should run before release metadata/readiness reporting completes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local DMG install-path smoke. |
| 2026-06-28 | harness_builder | Added `harness/scripts/run_desktop_install_smoke.mjs`, `npm run desktop:install-smoke`, verify wiring after DMG smoke, and docs/QA expectations for simulated Applications copy-and-launch validation. |
| 2026-06-28 | quality_runner | Passed `git diff --check`, `node --check harness/scripts/run_desktop_install_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `npm run build`, `npm run desktop:package-smoke`, `npm run desktop:adhoc-sign-smoke`, `npm run desktop:dmg-smoke`, `npm run desktop:install-smoke`, and `npm run release:check`. Electron GUI, codesign, and hdiutil checks ran with macOS GUI/process/disk-image access outside the sandbox. |

## Completion Notes

Completed local DMG install-path smoke. The release gate now mounts the generated DMG, copies `GrooveForge.app` into `build/desktop/GrooveForge-darwin-arm64/install-smoke/Applications/GrooveForge.app`, verifies retained branded payload and `Signature=adhoc`, and launches the installed copy through hidden-window production smoke. The latest observed install smoke recorded a 2880x1856 visual capture, 420029 PNG bytes, and 69 sampled colors. This plan does not claim real `/Applications` install, Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
