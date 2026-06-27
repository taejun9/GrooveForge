# plan-1034-gatekeeper-readiness-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local macOS Gatekeeper readiness smoke that assesses the installed-copy `GrooveForge.app` and generated DMG with `spctl`, writes a machine-readable readiness summary, and keeps Gatekeeper approval explicitly unclaimed when the local ad-hoc/not-notarized artifacts are rejected.

## Non-Goals

- Do not claim Gatekeeper approval unless `spctl` actually accepts the assessed app/DMG.
- Do not claim Developer ID signing, notarization, auto-update, app-store submission, PKG installer creation, real `/Applications` install, or external distribution-channel QA.
- Do not submit anything to Apple notary services or make network calls.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not add accounts, analytics, payments, cloud sync, remote AI, imported-audio requirements, or sampling-first copy.

## Context Map

- `harness/scripts/run_desktop_install_smoke.mjs`: creates the simulated installed app copy to assess.
- `harness/scripts/run_desktop_dmg_smoke.mjs`: creates the local ad-hoc signed DMG artifact to assess.
- `harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`: reports Developer ID/notary readiness without external submissions.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1034-gatekeeper-readiness-smoke` and `.worktree/plan-1034-gatekeeper-readiness-smoke` for git repository work.
- Keep generated readiness artifacts under ignored `build/`.
- Keep GrooveForge direct-composition first; sampling remains optional and out of this plan.

## Implementation Plan

- [x] Add a `desktop:gatekeeper-readiness-smoke` script that runs local `spctl` assessment against the installed app copy and generated DMG.
- [x] Write a local Gatekeeper readiness JSON summary under ignored `build/desktop/`.
- [x] Treat rejection as a reported readiness blocker, not a false test failure, unless the script cannot inspect required artifacts.
- [x] Wire the smoke into `npm run verify` after install smoke and before release manifest/developer readiness smoke.
- [x] Update docs and QA expectations without claiming Gatekeeper approval.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_gatekeeper_readiness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:gatekeeper-readiness-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Record Gatekeeper readiness instead of forcing acceptance. | Current artifacts are locally ad-hoc signed and not notarized, so rejection is expected until Developer ID signing and notarization are available. |
| 2026-06-28 | Run Gatekeeper readiness after install smoke. | The assessment should target the same simulated installed copy users would launch from the DMG flow. |
| 2026-06-28 | Keep `release:check` green when `spctl` rejects inspected ad-hoc artifacts. | The smoke is a truth-reporting readiness gate; it should fail only when it cannot inspect required artifacts or when claim flags become unsafe. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local Gatekeeper readiness reporting. |
| 2026-06-28 | harness_builder | Added `harness/scripts/run_desktop_gatekeeper_readiness_smoke.mjs`, `npm run desktop:gatekeeper-readiness-smoke`, verify wiring after install smoke, and docs/QA expectations for Gatekeeper readiness reporting. |
| 2026-06-28 | quality_runner | Passed `git diff --check`, `node --check harness/scripts/run_desktop_gatekeeper_readiness_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `npm run build`, `npm run desktop:package-smoke`, `npm run desktop:adhoc-sign-smoke`, `npm run desktop:dmg-smoke`, `npm run desktop:install-smoke`, `npm run desktop:gatekeeper-readiness-smoke`, and `npm run release:check`. Electron GUI, codesign, hdiutil, and spctl checks ran with macOS runtime access outside the sandbox. |

## Completion Notes

Completed local Gatekeeper readiness smoke. The release gate now assesses `build/desktop/GrooveForge-darwin-arm64/install-smoke/Applications/GrooveForge.app` and `build/desktop/GrooveForge-darwin-arm64/GrooveForge-0.1.0-darwin-arm64.dmg` with local `spctl`, writes `build/desktop/GrooveForge-darwin-arm64-gatekeeper-readiness.json`, and keeps `networkSubmissionAttempted`, `releaseGateClaimedGatekeeperApproval`, and `releaseGateClaimedExternalDistribution` false.

Latest observed Gatekeeper readiness output reported installed app accepted: no, DMG accepted: no, and Gatekeeper ready: no. The recorded blockers are: installed app is not accepted by Gatekeeper assessment; DMG is not accepted by Gatekeeper assessment. This plan does not claim Gatekeeper approval, Developer ID signing, notarization, auto-update, app-store submission, real `/Applications` install, or external distribution-channel QA.
