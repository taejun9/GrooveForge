# plan-1031-adhoc-signing-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local macOS ad-hoc signing smoke for the packaged `GrooveForge.app`, verify the signed app with `codesign`, prove the signed app still launches through the production hidden-window smoke, and keep Developer ID signing/notarization claims explicitly out of scope.

## Non-Goals

- Do not claim Developer ID signing, hardened runtime readiness, notarization, Gatekeeper approval, auto-update, app-store submission, PKG installer creation, or external distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not add remote services, analytics, accounts, payments, imported-audio requirements, or sampling-first copy.
- Do not replace package, DMG, or release manifest smoke; ad-hoc signing should run after package smoke and before DMG/manifest smoke.

## Context Map

- `harness/scripts/run_desktop_package_smoke.mjs`: validated local macOS portable app assembly.
- `harness/scripts/run_desktop_dmg_smoke.mjs`: local DMG creation and mounted ad-hoc signed payload validation.
- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: release artifact checksum, ad-hoc signing evidence, and metadata manifest validation.
- `package.json`: verify/release gate wiring.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1031-adhoc-signing-smoke` and `.worktree/plan-1031-adhoc-signing-smoke` for git repository work.
- Keep generated package artifacts under ignored `build/`.
- Keep GrooveForge direct-composition first; sampling remains optional and out of this plan.

## Implementation Plan

- [x] Add a `desktop:adhoc-sign-smoke` script that ad-hoc signs the packaged app under ignored `build/desktop/`.
- [x] Verify the signature with `codesign --verify --deep --strict` and `codesign --display`.
- [x] Launch the ad-hoc signed app through the same hidden-window production launch smoke.
- [x] Wire ad-hoc signing smoke into `npm run verify` after package smoke and before DMG/manifest smoke.
- [x] Update release manifest/docs/QA expectations to distinguish ad-hoc signing from Developer ID signing/notarization.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:dmg-smoke`
- `npm run desktop:release-manifest-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add ad-hoc signing before Developer ID signing. | Ad-hoc signing is available locally and proves the app bundle can be signed and still launched without requiring external certificates. |
| 2026-06-28 | Keep Developer ID signing and notarization explicitly unclaimed. | Those require a developer identity, credentials, and external Apple notary service access. |
| 2026-06-28 | Require DMG and release manifest smoke to run after ad-hoc signing. | The release artifact path should prove that the DMG contains the signed app and that manifest metadata records only local ad-hoc signing evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local ad-hoc signing smoke. |
| 2026-06-28 | harness_builder | Added `harness/scripts/run_desktop_adhoc_sign_smoke.mjs`, wired `desktop:adhoc-sign-smoke` into `npm run verify`, updated DMG smoke to verify mounted app `Signature=adhoc`, and updated release manifest smoke to record ad-hoc signature evidence while keeping Developer ID/notarization unclaimed. |
| 2026-06-28 | quality_runner | Passed `git diff --check`, `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`, `node --check harness/scripts/run_desktop_release_manifest_smoke.mjs`, `node --check harness/scripts/run_desktop_dmg_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `npm run build`, `npm run desktop:package-smoke`, `npm run desktop:adhoc-sign-smoke`, `npm run desktop:dmg-smoke`, `npm run desktop:release-manifest-smoke`, and `npm run release:check`. Electron GUI, codesign, and hdiutil checks ran with macOS GUI/process/disk-image access outside the sandbox. |

## Completion Notes

Completed local macOS ad-hoc signing smoke. The release gate now signs the packaged `GrooveForge.app` with a local ad-hoc signature, verifies `Signature=adhoc` and `app.grooveforge.desktop`, launches the signed app through the hidden-window production smoke, creates a DMG containing the ad-hoc signed app, and writes a release manifest with ad-hoc signing evidence plus explicit false claims for Developer ID signing, notarization, auto-update, and external distribution-channel QA. The latest observed release gate recorded `GrooveForge-0.1.0-darwin-arm64.dmg` at 123737556 bytes, app payload 323 files / 273998503 bytes, and bundle id `app.grooveforge.desktop`.
