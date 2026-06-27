# plan-1029-local-dmg-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local unsigned macOS DMG smoke gate that packages the already validated portable `GrooveForge.app` into a distributable disk image, verifies the image contents and metadata, and keeps the release evidence honest about signing/notarization still being out of scope.

## Non-Goals

- Do not claim hardened runtime signing, notarization, app-store submission, auto-update, paid distribution, or external distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not add remote services, analytics, accounts, payments, imported-audio requirements, or sampling-first copy.
- Do not replace the existing portable app smoke; the DMG smoke should build on it.

## Context Map

- `harness/scripts/run_desktop_package_smoke.mjs`: validated local macOS portable app assembly.
- `harness/scripts/run_desktop_dmg_smoke.mjs`: local unsigned macOS DMG creation and mounted payload validation.
- `package.json`: verify/release gate wiring.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1029-local-dmg-smoke` and `.worktree/plan-1029-local-dmg-smoke` for git repository work.
- Keep generated package artifacts under ignored `build/`.
- Keep GrooveForge direct-composition first; sampling remains optional and out of this plan.

## Implementation Plan

- [x] Add a `desktop:dmg-smoke` script that creates a local unsigned DMG from the validated `GrooveForge.app`.
- [x] Verify DMG existence, UDIF format metadata, mounted contents, app bundle presence, and absence of unrelated payloads.
- [x] Wire DMG smoke into `npm run verify` after package smoke.
- [x] Update QA expectations, release evidence, and harness docs without claiming signing/notarization.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_dmg_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:dmg-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add unsigned DMG smoke before signing/notarization work. | The app now has a branded portable bundle; a local DMG is the next concrete distributable artifact that does not require external credentials. |
| 2026-06-28 | Keep signing, notarization, auto-update, and distribution-channel QA out of scope. | Those require a selected developer identity, credentials, and distribution target. |
| 2026-06-28 | Validate the mounted DMG payload instead of relying on localized `hdiutil imageinfo` volume-name text. | `hdiutil imageinfo` output varies by macOS locale and APFS metadata; mounted contents, app metadata, and DMG file naming provide stronger deterministic evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local unsigned DMG smoke. |
| 2026-06-28 | harness_builder | Added `harness/scripts/run_desktop_dmg_smoke.mjs`, `npm run desktop:dmg-smoke`, verify wiring after package smoke, and docs/QA expectations for local unsigned DMG evidence. |
| 2026-06-28 | quality_runner | Passed `git diff --check`, `node --check harness/scripts/run_desktop_dmg_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `npm run build`, `npm run desktop:package-smoke`, `npm run desktop:dmg-smoke`, and `npm run release:check`. Electron GUI and hdiutil checks ran with macOS GUI/process/disk-image access outside the sandbox. |

## Completion Notes

Completed local unsigned DMG smoke. The release gate now creates `build/desktop/GrooveForge-darwin-*/GrooveForge-0.1.0-darwin-*.dmg`, verifies UDZO image metadata, mounts it read-only, checks that it contains only `GrooveForge.app` plus an Applications shortcut, validates the mounted app payload and branded metadata, and detaches the image. This plan still does not claim code signing, notarization, auto-update, app-store submission, or external distribution-channel QA.
