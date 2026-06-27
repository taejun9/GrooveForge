# plan-1028-branded-package-polish

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Replace the remaining Electron-default package presentation in the local portable app smoke with GrooveForge branded icon and bundle metadata, then prove the packaged app still launches and renders through the release gate.

## Non-Goals

- Do not claim DMG/PKG installer creation, hardened runtime signing, notarization, auto-update, app-store submission, or distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not add remote services, analytics, accounts, payments, imported-audio requirements, or sampling-first copy.

## Context Map

- `harness/scripts/run_desktop_package_smoke.mjs`: local macOS portable app assembly and packaged launch evidence.
- `electron/main.ts`: hidden-window production desktop visual launch smoke and screenshot capture evidence.
- `harness/scripts/run_desktop_entry_smoke.mjs`: Electron entry contract validation.
- `package.json`: final verify/release gate wiring.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: package smoke quality expectations.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: MVP target and validation summary.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1028-branded-package-polish` and `.worktree/plan-1028-branded-package-polish` for git repository work.
- Keep generated package artifacts under ignored `build/`.
- Keep GrooveForge direct-composition first; sampling remains optional and out of this plan.

## Implementation Plan

- [x] Add a durable GrooveForge brand icon source asset.
- [x] Make package smoke generate and install a GrooveForge `.icns` file into the portable app bundle.
- [x] Update root bundle and helper app metadata from Electron defaults to GrooveForge package metadata where safe.
- [x] Extend package smoke validation, docs, and QA expectations for branded icon/metadata.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_package_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Improve branded package presentation before installer/signing work. | The portable app smoke already proves bundle assembly, but branded icon and metadata remove the remaining Electron-default presentation without requiring external distribution credentials. |
| 2026-06-28 | Keep installer/signing/notarization out of scope. | Those require a selected distribution target and developer identity; this plan should improve local package polish without overclaiming external release readiness. |
| 2026-06-28 | Generate the packaged `.icns` deterministically from the durable SVG source inside package smoke. | This keeps the repo lightweight, gives the package gate reproducible icon bytes, and avoids adding an external image conversion dependency. |
| 2026-06-28 | Remove the Electron default icon file from the assembled app bundle. | The package should not merely point away from `electron.icns`; the default icon artifact should be absent from the portable app resources. |
| 2026-06-28 | Wait for `ready-to-show` and retry visual evidence before failing hidden-window launch smoke. | The release gate observed a packaged-app black-frame capture after the DOM had mounted; visual smoke should fail only after the renderer has had a fair hidden paint window. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for branded package polish. |
| 2026-06-28 | harness_builder | Added `assets/brand/grooveforge-icon.svg`, deterministic PNG/ICNS generation, `GrooveForge.icns` installation, Electron default icon removal, root/helper metadata rewrites, and package structure validation. |
| 2026-06-28 | harness_builder | Stabilized hidden-window visual smoke by painting while initially hidden, waiting for `ready-to-show`, and retrying visual evidence until the smoke deadline. |
| 2026-06-28 | quality_runner | Passed `git diff --check`, `node --check harness/scripts/run_desktop_package_smoke.mjs`, `node --check harness/scripts/run_desktop_entry_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:package-smoke`, and `npm run release:check`. Electron GUI checks ran with macOS GUI/process access outside the sandbox. |

## Completion Notes

Completed branded local portable package polish. The package smoke now installs deterministic `GrooveForge.icns` from the durable brand source, removes the Electron default icon file, validates root/helper bundle metadata away from Electron defaults, keeps the privacy posture stripped of unused permissions, and proves the packaged app renders through the same hidden-window visual smoke. The release gate still does not claim DMG/PKG installer creation, hardened runtime signing, notarization, auto-update, app-store submission, or distribution-channel QA.
