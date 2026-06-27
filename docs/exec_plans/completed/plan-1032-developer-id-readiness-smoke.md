# plan-1032-developer-id-readiness-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local Developer ID / notarization readiness smoke that inspects the current macOS environment for external-distribution prerequisites, records whether Developer ID signing can run now, and keeps the release gate honest when certificates or notary credentials are missing.

## Non-Goals

- Do not claim Developer ID signing, hardened runtime readiness, notarization, Gatekeeper approval, auto-update, app-store submission, PKG installer creation, or external distribution-channel QA unless the required local identity and credentials are actually present and verified.
- Do not submit anything to Apple notary services or make network calls.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not add accounts, analytics, payments, cloud sync, remote AI, imported-audio requirements, or sampling-first copy.

## Context Map

- `harness/scripts/run_desktop_adhoc_sign_smoke.mjs`: local ad-hoc signing proof already in the release gate.
- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: local release manifest records ad-hoc signing and explicit unclaimed Developer ID/notarization fields.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1032-developer-id-readiness-smoke` and `.worktree/plan-1032-developer-id-readiness-smoke` for git repository work.
- Keep generated package artifacts under ignored `build/`.
- Keep GrooveForge direct-composition first; sampling remains optional and out of this plan.

## Implementation Plan

- [x] Add a `desktop:developer-id-readiness-smoke` script that checks local macOS signing/notary prerequisites without network calls.
- [x] Detect whether `codesign`, `security`, `xcrun notarytool`, and `xcrun stapler` are available.
- [x] Detect whether a valid Developer ID Application identity and bounded notary credential signal are present without printing secret values.
- [x] Emit a machine-readable readiness summary under ignored `build/desktop/`.
- [x] Wire docs/QA expectations so completion reports distinguish local ad-hoc readiness from external Developer ID/notarization readiness.
- [x] Run QA, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:developer-id-readiness-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a readiness smoke before Developer ID signing. | The current environment has no valid code-signing identities, so a readiness check can make the missing external prerequisites explicit without overclaiming distribution completion. |
| 2026-06-28 | Avoid Apple notary submissions in this plan. | Notarization requires Apple credentials and network service access; this plan should not make remote calls or leak secrets. |
| 2026-06-28 | Keep Developer ID readiness smoke non-blocking for local release checks. | The local MVP gate can still prove build/package/export readiness while separately reporting that external distribution remains unready without installed credentials. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Current environment inspection found 0 valid code-signing identities, available notarytool/stapler CLIs, and no matching notary/developer environment variable names. |
| 2026-06-28 | harness_builder | Added `harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`, `npm run desktop:developer-id-readiness-smoke`, verify wiring after release manifest smoke, and docs/QA expectations for Developer ID/notary readiness reporting. |
| 2026-06-28 | quality_runner | Passed `git diff --check`, `node --check harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `npm run desktop:developer-id-readiness-smoke`, and `npm run release:check`. Release check ran with macOS GUI/process/disk-image/keychain access outside the sandbox. |

## Completion Notes

Completed Developer ID readiness smoke. The release gate now writes `build/desktop/GrooveForge-darwin-arm64-developer-id-readiness.json`, reports Developer ID signing readiness, notary credential signal readiness, external distribution readiness, blockers, `networkSubmissionAttempted: false`, and `releaseGateClaimedExternalDistribution: false`. The latest observed run reported Developer ID signing ready `no`, notarization credential signal ready `no`, external distribution ready `no`, 0 valid Developer ID Application identities, no bounded notary credential signal, and no Apple notary submission attempted.
