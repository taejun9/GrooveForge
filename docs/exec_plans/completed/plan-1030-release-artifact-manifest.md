# plan-1030-release-artifact-manifest

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local release artifact manifest smoke that records checksums, sizes, bundle metadata, and unsigned/notarization-unclaimed status for the packaged `GrooveForge.app` and unsigned DMG artifact, so release handoff evidence is traceable without pretending external signing/distribution gates are complete.

## Non-Goals

- Do not claim code signing, notarization, auto-update, app-store submission, PKG installer creation, or external distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not add remote services, analytics, accounts, payments, imported-audio requirements, or sampling-first copy.
- Do not replace package or DMG smoke; this manifest smoke should run after them.

## Context Map

- `harness/scripts/run_desktop_package_smoke.mjs`: validated local macOS portable app assembly.
- `harness/scripts/run_desktop_dmg_smoke.mjs`: local unsigned DMG creation and mounted payload validation.
- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: release artifact checksum and metadata manifest validation.
- `package.json`: verify/release gate wiring.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1030-release-artifact-manifest` and `.worktree/plan-1030-release-artifact-manifest` for git repository work.
- Keep generated manifests and package artifacts under ignored `build/`.
- Keep GrooveForge direct-composition first; sampling remains optional and out of this plan.

## Implementation Plan

- [x] Add a `desktop:release-manifest-smoke` script that reads the built app and DMG artifacts after DMG smoke.
- [x] Generate and validate a local JSON release manifest with app/DMG paths, byte sizes, SHA-256 checksums, key bundle metadata, payload hashes, and explicit unsigned/notarization-unclaimed flags.
- [x] Wire release manifest smoke into `npm run verify` after DMG smoke.
- [x] Update QA expectations, release evidence, and harness docs without claiming external distribution readiness.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_release_manifest_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:dmg-smoke`
- `npm run desktop:release-manifest-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a release artifact manifest after local DMG smoke. | App and DMG artifacts are now generated locally; checksums and bundle metadata make handoff evidence traceable before signing/notarization credentials are available. |
| 2026-06-28 | Keep signing/notarization as explicit unclaimed manifest fields. | The manifest should make the current local unsigned scope machine-readable instead of implying external release completion. |
| 2026-06-28 | Hash the DMG and key app payloads rather than the entire app bundle as a single archive. | The DMG is the distributable artifact, while key payload hashes provide targeted app integrity evidence without creating extra archives. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for release artifact manifest smoke. |
| 2026-06-28 | harness_builder | Added `harness/scripts/run_desktop_release_manifest_smoke.mjs`, `npm run desktop:release-manifest-smoke`, verify wiring after DMG smoke, and docs/QA expectations for local release artifact traceability. |
| 2026-06-28 | quality_runner | Passed `git diff --check`, `node --check harness/scripts/run_desktop_release_manifest_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `npm run build`, `npm run desktop:package-smoke`, `npm run desktop:dmg-smoke`, `npm run desktop:release-manifest-smoke`, and `npm run release:check`. Electron GUI and hdiutil checks ran with macOS GUI/process/disk-image access outside the sandbox. |

## Completion Notes

Completed release artifact manifest smoke. The release gate now writes `build/desktop/GrooveForge-darwin-*/GrooveForge-0.1.0-darwin-*-release-manifest.json` with app/DMG paths, byte sizes, SHA-256 checksums, key app payload hashes, bundle metadata, local unsigned distribution scope, and explicit false claims for code signing, notarization, auto-update, and external distribution-channel QA. The latest observed manifest run recorded a `GrooveForge-0.1.0-darwin-arm64.dmg` artifact at 125757219 bytes, an app payload of 314 files / 274722534 bytes, and bundle id `app.grooveforge.desktop`.
