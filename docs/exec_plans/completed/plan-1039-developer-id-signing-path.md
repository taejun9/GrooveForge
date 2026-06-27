# plan-1039-developer-id-signing-path

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local Developer ID signing path smoke that can sign and verify an isolated copy of the packaged GrooveForge app when an explicit Developer ID Application identity is provided, while passing truthfully with blockers when no identity is configured and keeping notarization/Gatekeeper/external-distribution claims false.

## Non-Goals

- Do not sign the primary ad-hoc release artifact in place.
- Do not submit anything to Apple notary services or make network calls.
- Do not claim notarization, stapling, Gatekeeper approval, app-store submission, real `/Applications` install, auto-update completion, or external distribution-channel QA.
- Do not print Apple credential values or private feed values.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`: reports Developer ID identity and notary credential readiness.
- `harness/scripts/run_desktop_adhoc_sign_smoke.mjs`: local ad-hoc hardened-runtime signing path.
- `harness/fixtures/macos-hardened-runtime-entitlements.plist`: Electron runtime entitlements used for hardened-runtime signing.
- `docs/release/readiness.md`: release evidence matrix and unclaimed external-distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1039-developer-id-signing-path` and `.worktree/plan-1039-developer-id-signing-path` for git repository work.
- Write generated signing summaries and signed-copy artifacts only under ignored `build/desktop/`.
- Require explicit `GROOVEFORGE_DEVELOPER_ID_IDENTITY` before attempting Developer ID signing.

## Implementation Plan

- [x] Add `desktop:developer-id-signing-smoke`.
- [x] Have the smoke inspect keychain Developer ID Application identities and require explicit `GROOVEFORGE_DEVELOPER_ID_IDENTITY`.
- [x] If no matching identity is configured, write a machine-readable blocker summary without attempting signing.
- [x] If a matching identity is configured, copy the packaged app to an isolated ignored path, sign it with hardened-runtime options and Electron entitlements, then verify Developer ID authority, bundle id, runtime flags, and entitlements.
- [x] Wire the smoke into `npm run verify` after Developer ID readiness reporting.
- [x] Update docs, QA expectations, release readiness, review, and completion notes without claiming notarization or external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_developer_id_signing_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:developer-id-signing-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

QA completed before the review mirror was written.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Require `GROOVEFORGE_DEVELOPER_ID_IDENTITY` before signing. | Developer ID signing should be an explicit release action, not something triggered just because a certificate is present in a keychain. |
| 2026-06-28 | Sign an isolated copy under ignored `build/desktop/`. | The release gate can verify the Developer ID path without mutating the primary local ad-hoc artifact chain. |
| 2026-06-28 | Keep release claim flags false even when an isolated copy is signed. | The smoke proves the signing path only; primary artifact signing, notarization, Gatekeeper approval, and external distribution still need separate release work. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for an explicit Developer ID signing path smoke. |
| 2026-06-28 | harness_builder | Added `run_desktop_developer_id_signing_smoke.mjs`, package script wiring, and verify-chain integration. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness, and QA expectations for the new signing-path smoke. |
| 2026-06-28 | quality_runner | `node --check`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run build`, package smoke, ad-hoc signing smoke, Developer ID signing smoke, and `npm run release:check` passed. |

## Completion Notes

Completed. `desktop:developer-id-signing-smoke` now writes `build/desktop/GrooveForge-<platform>-<arch>-developer-id-signing.json`, requires explicit `GROOVEFORGE_DEVELOPER_ID_IDENTITY`, signs only an isolated ignored app copy when a matching Developer ID Application identity exists, and otherwise records blockers without attempting signing.

Current local run had no Developer ID Application identity and no `GROOVEFORGE_DEVELOPER_ID_IDENTITY`, so the smoke passed with `developerIdSigningAttempted: false` and `developerIdSigned: false`. It did not submit to Apple notary services and did not claim primary release artifact Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
