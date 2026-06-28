# plan-1041-notarized-gatekeeper-path

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local notarized Gatekeeper-path smoke that can assess the isolated notarized and stapled DMG produced by the notarization smoke, while default QA stays network-free and reports missing external-distribution prerequisites truthfully.

## Non-Goals

- Do not submit to Apple notary services during default `npm run verify` or `npm run release:check`.
- Do not print Apple credential values, app-specific passwords, private key values, update feed values, or notarization secrets.
- Do not claim primary release artifact Developer ID signing, notarization, Gatekeeper approval, auto-update completion, app-store submission, or external distribution-channel QA.
- Do not mutate the primary ad-hoc app/DMG artifact chain or install into the real `/Applications` directory.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_notarization_smoke.mjs`: writes notarization-path summary and optionally staples an isolated notarization DMG.
- `harness/scripts/run_desktop_gatekeeper_readiness_smoke.mjs`: records local Gatekeeper readiness for the ad-hoc simulated install path.
- `docs/release/readiness.md`: release evidence matrix and unclaimed external-distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1041-notarized-gatekeeper-path` and `.worktree/plan-1041-notarized-gatekeeper-path` for git repository work.
- Write generated notarized Gatekeeper summaries only under ignored `build/desktop/`.
- Treat missing notarized/stapled artifacts as blockers in the summary, not as default QA failures.

## Implementation Plan

- [x] Add `desktop:notarized-gatekeeper-smoke`.
- [x] Have the smoke inspect the notarization summary and require `notarizationReady`, `stapled`, and `stapleValidationPassed` before assessing artifacts.
- [x] If the notarized/stapled isolated DMG is missing, write a machine-readable blocker summary without network submission.
- [x] If a notarized/stapled isolated DMG is present, assess the DMG and mounted app with `spctl`, detach the mount deterministically, and record blockers for rejection.
- [x] Wire the smoke into `npm run verify` after notarization reporting.
- [x] Update docs, QA expectations, release readiness, review, and completion notes without claiming external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_notarized_gatekeeper_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:developer-id-signing-smoke`
- `npm run desktop:notarization-smoke`
- `npm run desktop:notarized-gatekeeper-smoke`
- `npm run release:check`

## Review Plan

QA completed before review started.

Review completed with no blocking findings.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Gatekeeper acceptance for notarized artifacts is a separate smoke after notarization. | The ad-hoc Gatekeeper readiness smoke and notarization smoke answer different questions; the release gate needs explicit evidence for the stapled isolated artifact path. |
| 2026-06-28 | Keep default QA network-free and blocker-based. | Most local runs do not have Developer ID identity, credentials, or explicit notary submission; default verification should stay deterministic while reporting the missing release prerequisites. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for a notarized Gatekeeper path smoke. |
| 2026-06-28 | harness_builder | Added `run_desktop_notarized_gatekeeper_smoke.mjs`, package script wiring, and verify-chain integration. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness, and QA expectations for the notarized Gatekeeper smoke. |
| 2026-06-28 | quality_runner | `node --check`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run build`, package smoke, ad-hoc signing smoke, Developer ID signing smoke, notarization smoke, notarized Gatekeeper smoke, and `npm run release:check` passed. |
| 2026-06-28 | review_judge | Reviewed post-QA with no blocking findings; remaining blockers are real Developer ID identity, notary credentials, explicit notarization/stapling, Gatekeeper acceptance, update metadata, and distribution-channel QA. |

## Completion Notes

Completed. `desktop:notarized-gatekeeper-smoke` now writes `build/desktop/GrooveForge-<platform>-<arch>-notarized-gatekeeper.json`, reads the notarization summary, requires a notarized/stapled isolated DMG before assessment, and records local `spctl` acceptance for the stapled DMG plus mounted app while detaching the mount with `hdiutil detach -force`.

Current local run had no Developer ID signed isolated app copy, no notary credential signal, no `GROOVEFORGE_NOTARY_SUBMIT=1`, and therefore no notarized/stapled isolated DMG. The new smoke passed with `notarizedInputReady: false`, `notarizedGatekeeperAccepted: false`, and the blocker `No notarized and stapled isolated DMG is available for Gatekeeper assessment.` It did not submit to Apple notary services and did not claim primary release artifact Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
