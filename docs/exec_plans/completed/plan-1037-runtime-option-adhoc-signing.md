# plan-1037-runtime-option-adhoc-signing

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Move the local macOS signed desktop artifact closer to external distribution readiness by applying the hardened runtime signing option during the ad-hoc signing smoke, verifying runtime flags on the packaged app and executable, and keeping Developer ID/notarization/Gatekeeper/external-distribution claims false.

## Non-Goals

- Do not replace local ad-hoc signing with Developer ID signing.
- Do not claim notarization, stapling, Gatekeeper approval, app-store submission, real `/Applications` install, auto-update, or external distribution-channel QA.
- Do not submit anything to Apple notary services or make network calls.
- Do not print credential values or depend on private certificates.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_adhoc_sign_smoke.mjs`: applies local ad-hoc signing and launches the signed app.
- `harness/scripts/run_desktop_hardened_runtime_readiness_smoke.mjs`: inspects runtime flags and Developer ID authority after signing.
- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: records release artifact signing evidence.
- `docs/release/readiness.md`: release evidence matrix and not-claimed distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1037-runtime-option-adhoc-signing` and `.worktree/plan-1037-runtime-option-adhoc-signing` for git repository work.
- Keep generated readiness artifacts under ignored `build/`.
- Keep GrooveForge local-first unless there is an explicit rationale for remote distribution behavior.

## Implementation Plan

- [x] Add `--options runtime` and Electron runtime entitlements to the local ad-hoc signing smoke.
- [x] Verify `codesign --display --verbose=4` reports hardened runtime flags on both the app bundle and main executable after signing.
- [x] Verify the signed app records the required Electron runtime entitlements needed to launch under hardened runtime.
- [x] Update hardened runtime readiness expectations so runtime flags are no longer blockers for the local ad-hoc artifact, while ad-hoc signing and missing Developer ID authority remain blockers.
- [x] Update release/quality/harness docs and QA expectations without claiming Developer ID signing, notarization, or Gatekeeper approval.
- [x] Run QA, release gate, review, and completion move.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`
- `node --check harness/scripts/run_desktop_hardened_runtime_readiness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:hardened-runtime-readiness-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add hardened runtime options to local ad-hoc signing. | The packaged app can prove hardened-runtime flag compatibility locally before real Developer ID signing exists. |
| 2026-06-28 | Keep readiness false until Developer ID authority is present. | Hardened runtime flags alone are not enough to claim external macOS distribution readiness or notarization readiness. |
| 2026-06-28 | Add explicit Electron runtime entitlements to the local hardened-runtime ad-hoc signature. | A runtime-only ad-hoc signature set the runtime flags but the packaged Electron app aborted during framework loading because hardened runtime library validation needed the Electron entitlement posture to be explicit. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for runtime-option ad-hoc signing. |
| 2026-06-28 | quality_runner | Initial runtime-option signing produced runtime flags but the app aborted with Electron Framework library-validation evidence, so the plan now includes explicit Electron runtime entitlements. |
| 2026-06-28 | harness_builder | Added durable Electron runtime entitlements fixture, runtime-option ad-hoc signing validation, and release manifest entitlement evidence. |
| 2026-06-28 | quality_runner | `npm run release:check` passed; ad-hoc signing smoke reports runtime flags app yes/executable yes and release manifest reports runtime entitlements 3/3. |
| 2026-06-28 | review_judge | Reviewed post-QA with no blocking findings; remaining blockers are Developer ID identity, notary credentials, Gatekeeper acceptance, and auto-update implementation/provider flow. |

## Completion Notes

Completed local hardened-runtime ad-hoc signing compatibility.

The ad-hoc signing smoke now signs the packaged app with `--options runtime` and `harness/fixtures/macos-hardened-runtime-entitlements.plist`, verifies the app bundle and main executable expose runtime flags, verifies the required Electron runtime entitlements, and proves the signed app still launches through the hidden-window desktop smoke.

The hardened runtime readiness smoke now reports runtime flags as present while keeping readiness false because the app is still ad-hoc signed and does not include Developer ID authority. The release manifest records hardened runtime flag evidence and runtime entitlement evidence without claiming Developer ID signing, notarization, Gatekeeper approval, or external distribution completion.

QA passed:

- `git diff --check`
- `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`
- `node --check harness/scripts/run_desktop_hardened_runtime_readiness_smoke.mjs`
- `node --check harness/scripts/run_desktop_release_manifest_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:hardened-runtime-readiness-smoke`
- `npm run desktop:dmg-smoke`
- `npm run desktop:release-manifest-smoke`
- `npm run release:check`
