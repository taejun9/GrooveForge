# plan-1036-hardened-runtime-readiness-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local macOS hardened runtime readiness smoke that inspects the packaged GrooveForge app code-signature details, writes a machine-readable readiness summary, and keeps notarization/Gatekeeper/external-distribution claims false until the app is signed with hardened runtime and a non-ad-hoc Developer ID identity.

## Non-Goals

- Do not replace local ad-hoc signing with Developer ID signing.
- Do not claim hardened runtime readiness unless `codesign --display --verbose=4` shows runtime flags on the app bundle and executable signature evidence.
- Do not claim Developer ID signing, notarization, stapling, Gatekeeper approval, app-store submission, PKG installer creation, real `/Applications` install, auto-update, or external distribution-channel QA.
- Do not submit anything to Apple notary services or make network calls.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_adhoc_sign_smoke.mjs`: currently signs the packaged app locally with ad-hoc signing.
- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: records signature kind and false Developer ID/notarization claims.
- `harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`: checks Developer ID/notary credential prerequisites.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1036-hardened-runtime-readiness-smoke` and `.worktree/plan-1036-hardened-runtime-readiness-smoke` for git repository work.
- Keep generated readiness artifacts under ignored `build/`.
- Keep GrooveForge local-first unless there is an explicit rationale for remote distribution behavior.

## Implementation Plan

- [x] Add a `desktop:hardened-runtime-readiness-smoke` script that inspects packaged app code-signature details and executable evidence.
- [x] Write a local hardened runtime readiness JSON summary under ignored `build/desktop/`.
- [x] Treat missing runtime flags and ad-hoc signature state as readiness blockers, not a false release failure.
- [x] Wire the smoke into `npm run verify` after ad-hoc signing smoke and before DMG/install/Gatekeeper/release metadata.
- [x] Update docs, official source registry, and QA expectations without claiming notarization or Gatekeeper approval.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_hardened_runtime_readiness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:hardened-runtime-readiness-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add hardened runtime readiness reporting before real notarization. | The current release gate proves local ad-hoc signing, but hardened runtime is a separate prerequisite signal that should not be silently assumed. |
| 2026-06-28 | Run the smoke after ad-hoc signing and before DMG packaging. | The check should inspect the signed app bundle before downstream release artifacts are created from it. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local hardened runtime readiness reporting. |
| 2026-06-28 | harness_builder | Added hardened runtime readiness smoke, release-gate wiring, docs, and QA expectations. |
| 2026-06-28 | quality_runner | QA and release gate passed; current ad-hoc app reports runtime flags no, Developer ID authority no, and readiness no. |
| 2026-06-28 | review_judge | Reviewed post-QA with no blocking findings; remaining blockers are real Developer ID hardened-runtime signing and notarization/Gatekeeper validation. |

## Completion Notes

Completed the local hardened runtime readiness smoke and wired it into `npm run verify` after ad-hoc signing and before DMG/install/Gatekeeper/release metadata.

The smoke writes `build/desktop/GrooveForge-darwin-arm64-hardened-runtime-readiness.json` and intentionally reports the current ad-hoc app as not hardened-runtime ready because the packaged app and executable do not include runtime flags, the signature is ad-hoc, and no Developer ID authority is present.

QA passed:

- `git diff --check`
- `node --check harness/scripts/run_desktop_hardened_runtime_readiness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:hardened-runtime-readiness-smoke`
- `npm run release:check`
