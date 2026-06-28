# plan-1040-notarization-path

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local notarization-path smoke that can prepare and, only when explicitly requested with notarization credentials and a Developer ID signed isolated app copy, submit a notarization artifact and staple/validate the result, while default QA stays network-free and reports blockers truthfully.

## Non-Goals

- Do not submit to Apple notary services during default `npm run verify` or `npm run release:check`.
- Do not print Apple credential values, app-specific passwords, private key values, update feed values, or notarization secrets.
- Do not claim primary release artifact Developer ID signing, notarization, Gatekeeper approval, auto-update completion, app-store submission, or external distribution-channel QA.
- Do not mutate the primary ad-hoc app/DMG artifact chain.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_developer_id_signing_smoke.mjs`: creates a Developer ID signed isolated app copy when `GROOVEFORGE_DEVELOPER_ID_IDENTITY` is configured.
- `harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`: checks notarytool, stapler, and bounded credential signals.
- `harness/scripts/run_desktop_dmg_smoke.mjs`: creates the current local ad-hoc DMG.
- `docs/release/readiness.md`: release evidence matrix and unclaimed external-distribution scope.
- `docs/quality/rules.md`: release/package quality rules.
- `docs/architecture/harness.md`: harness command architecture.
- `README.md`: validation summary and completion reporting.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1040-notarization-path` and `.worktree/plan-1040-notarization-path` for git repository work.
- Write generated notarization summaries and isolated notarization artifacts only under ignored `build/desktop/`.
- Require explicit `GROOVEFORGE_NOTARY_SUBMIT=1` before attempting any Apple notary submission.

## Implementation Plan

- [x] Add `desktop:notarization-smoke`.
- [x] Have the smoke inspect the Developer ID signing summary, signed isolated app copy, `notarytool`, `stapler`, and bounded credential signals.
- [x] If prerequisites are missing or `GROOVEFORGE_NOTARY_SUBMIT` is not `1`, write a machine-readable blocker summary without network submission.
- [x] If explicit submission is requested and prerequisites are present, create an isolated notarization DMG, submit it with `notarytool --wait --output-format json`, staple it, and validate the staple.
- [x] Wire the smoke into `npm run verify` after Developer ID signing reporting.
- [x] Update docs, QA expectations, release readiness, review, and completion notes without claiming external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_notarization_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:developer-id-signing-smoke`
- `npm run desktop:notarization-smoke`
- `npm run release:check`

## Review Plan

QA completes before review starts.

QA completed before the review mirror was written.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Require `GROOVEFORGE_NOTARY_SUBMIT=1` before Apple notary submission. | Default QA must remain deterministic and network-free while still exposing the real notarization path for credentialed release runs. |
| 2026-06-28 | Use the isolated Developer ID signed app copy as notarization input. | Notarization preparation should not mutate the primary ad-hoc release artifact chain. |
| 2026-06-28 | Keep release claim flags false even if explicit isolated notarization succeeds. | The smoke proves a gated path; primary release artifact signing, notarization, Gatekeeper approval, and external distribution still need separate release ownership. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for a gated notarization and stapling path smoke. |
| 2026-06-28 | harness_builder | Added `run_desktop_notarization_smoke.mjs`, package script wiring, and verify-chain integration. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness, and QA expectations for the notarization smoke. |
| 2026-06-28 | quality_runner | `node --check`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run build`, package smoke, ad-hoc signing smoke, Developer ID signing smoke, notarization smoke, and `npm run release:check` passed. |

## Completion Notes

Completed. `desktop:notarization-smoke` now writes `build/desktop/GrooveForge-<platform>-<arch>-notarization.json`, requires explicit `GROOVEFORGE_NOTARY_SUBMIT=1` before Apple notary submission, prepares an isolated notarization DMG only from a Developer ID signed isolated app copy, submits with bounded credentials only when requested, staples accepted tickets, and validates the staple.

Current local run had no Developer ID signed isolated app copy, no notary credential signal, and no `GROOVEFORGE_NOTARY_SUBMIT=1`, so the smoke passed with `notarySubmissionAttempted: false`, `notarizationAccepted: false`, `stapled: false`, and blockers recorded. It did not submit to Apple notary services and did not claim primary release artifact Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
