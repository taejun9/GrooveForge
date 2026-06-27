# plan-1027-packaged-desktop-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local packaged desktop smoke gate that assembles a macOS portable `GrooveForge.app` from the built Electron runtime, validates the bundled app structure and privacy posture, then launches that packaged app through the existing hidden-window production renderer smoke.

## Non-Goals

- Do not claim code signing, notarization, installer DMG/PKG creation, auto-update, app-store submission, or distribution-channel QA.
- Do not add network-only package tooling or new remote services.
- Do not change beat-composition behavior, project schema, audio rendering, export semantics, or optional sampling scope.

## Context Map

- `package.json`: npm scripts and final release gate.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live hidden-window Electron launch evidence pattern.
- `electron/main.ts`: production file renderer and smoke-only launch mode.
- `docs/release/readiness.md`: release evidence matrix and not-claimed scope.
- `docs/quality/rules.md`: command list and QA expectations.
- `docs/architecture/harness.md`: harness command architecture.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1027-packaged-desktop-smoke` and `.worktree/plan-1027-packaged-desktop-smoke` for git repository work.
- Keep generated package artifacts under ignored `build/`.
- Keep GrooveForge direct-composition first; sampling remains optional and out of this plan.

## Implementation Plan

- [x] Add `npm run desktop:package-smoke` to assemble and validate a local packaged desktop app after build.
- [x] Make the package smoke validate app bundle files, minimal package metadata, renderer assets, Electron main/preload output, app naming, and unnecessary permission prompt removal from `Info.plist`.
- [x] Launch the packaged app with the existing smoke-only environment and verify the live beginner, producer, direct workstation, and visual evidence result.
- [x] Wire the package smoke into `npm run verify` after the build, entry smoke, and launch smoke.
- [x] Update release, quality, harness, README, and QA expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a macOS portable app smoke before claiming installer/signing readiness. | The current release gate proves built Electron rendering, but not a packaged app bundle; portable packaging is a concrete local step that avoids network tooling and does not overclaim notarized distribution. |
| 2026-06-28 | Keep signing, notarization, installers, auto-update, and distribution-channel QA as non-goals. | Those require a selected distribution target and developer identity; the current plan should improve evidence without pretending those external gates are complete. |
| 2026-06-28 | Preserve the existing Electron dependency range. | A temporary Electron version check showed sandboxed GUI execution was the blocker, not the Electron version; the plan should avoid unrelated dependency churn. |
| 2026-06-28 | Run GUI smoke commands with unsandboxed process access in Codex. | Sandboxed commands could not open even system GUI apps; unsandboxed execution proved the existing launch smoke and new package smoke. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for packaged desktop smoke. |
| 2026-06-28 | harness_builder | Added `run_desktop_package_smoke.mjs`, wired `desktop:package-smoke` into `verify`, and updated release/quality/harness/README evidence. |
| 2026-06-28 | quality_runner | Passed `git diff --check`, `node --check harness/scripts/run_desktop_package_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:package-smoke`, and `npm run release:check`; GUI launch commands required unsandboxed process access. |

## Completion Notes

Added packaged desktop smoke coverage for a local macOS portable `GrooveForge.app`. The release gate now proves built renderer/main/preload files can be bundled under ignored `build/desktop/`, the bundle metadata and privacy posture are valid, and the packaged app renders the same beginner, producer, direct workstation, and visual evidence surface through the existing hidden-window smoke path.

This plan does not claim DMG/PKG installer creation, code signing, notarization, auto-update, app-store submission, or distribution-channel QA.
