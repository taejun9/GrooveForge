# plan-1053-signing-local-env

## Status

complete

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Let the Developer ID readiness, Developer ID signing, and notarization smokes consume the existing ignored distribution local env file path so final external distribution can be driven by one redacted private-input workflow instead of requiring shell-exported secrets only.

## Non-Goals

- Do not commit private values, release/support/feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, or real user audio.
- Do not upload releases, publish update feeds, probe remote services, submit to Apple, sign artifacts without an explicit configured Developer ID identity, or claim external distribution completion without evidence.
- Do not change project schema, UI workflow, audio rendering, export behavior, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/distribution_local_env.mjs`: shared ignored `.env.distribution.local` loader with placeholder rejection and value-free reporting.
- `harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`: checks signing and notary credential signals but currently reads only exported environment variables.
- `harness/scripts/run_desktop_developer_id_signing_smoke.mjs`: signs an isolated app copy only when `GROOVEFORGE_DEVELOPER_ID_IDENTITY` is configured.
- `harness/scripts/run_desktop_notarization_smoke.mjs`: submits/staples only when `GROOVEFORGE_NOTARY_SUBMIT=1` and bounded credentials exist.
- `harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs`: already validates the same private input groups without recording values.
- `harness/scripts/run_desktop_external_distribution_gate_smoke.mjs`: hard gate fails until signing/notarization/Gatekeeper/update/channel evidence is ready.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1053-signing-local-env` and `.worktree/plan-1053-signing-local-env`.
- The local env loader must never print or write private values.
- Signing and notarization must remain gated by explicit private inputs and must not run from placeholder values.

## Implementation Plan

- [x] Add a shared allowed-key list or local constant coverage so signing/notary smokes can use `loadDistributionLocalEnv` safely.
- [x] Wire the loader into Developer ID readiness, Developer ID signing, and notarization smokes before they inspect `process.env`.
- [x] Record only local env loader metadata in their JSON summaries and console output.
- [x] Update README, harness architecture, quality rules, release readiness, and QA expectations.
- [x] Run QA/release checks, then complete plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_developer_id_readiness_smoke.mjs`
- `node --check harness/scripts/run_desktop_developer_id_signing_smoke.mjs`
- `node --check harness/scripts/run_desktop_notarization_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:developer-id-readiness-smoke`
- `npm run desktop:developer-id-signing-smoke`
- `npm run desktop:notarization-smoke`
- `npm run release:check`

## Review Plan

Review starts only after QA completes.

## QA Results

- `git diff --check` passed.
- `node --check harness/scripts/distribution_local_env.mjs` passed.
- `node --check harness/scripts/run_desktop_developer_id_readiness_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_developer_id_signing_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_notarization_smoke.mjs` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run desktop:developer-id-readiness-smoke` passed with local env file loaded: no, and no local env values, credentials, tokens, identity labels, or channel values recorded.
- `npm run desktop:developer-id-signing-smoke` passed with signing attempted: no, Developer ID signed copy: no, and no local env values, credentials, tokens, identity labels, or channel values recorded.
- `npm run desktop:notarization-smoke` passed with submission requested: no, submission attempted: no, and no local env values, credentials, tokens, identity labels, or channel values recorded.
- `npm run release:check` passed.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected in hard mode because real private inputs, Developer ID signing, notarization/stapling, notarized Gatekeeper, auto-update, and channel QA evidence are not ready.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Extend the existing redacted local env loader into signing/notarization smokes. | Final external distribution should use one ignored private-input workflow, while committed artifacts stay value-free. |
| 2026-06-28 | Stop recording Developer ID identity labels/fingerprints in signing/readiness summaries. | The scripts can use an identity internally for matching/signing while final evidence should remain value-free and safe to reference. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for signing/notarization local env support. |
| 2026-06-28 | harness_builder | Added `distributionPrivateInputKeys` and wired `loadDistributionLocalEnv` into Developer ID readiness, Developer ID signing, and notarization smokes. |
| 2026-06-28 | harness_builder | Kept identity labels/fingerprints out of readiness/signing summaries while preserving matching and isolated signing behavior. |
| 2026-06-28 | quality_runner | `npm run release:check` passed; hard external gate still fails as expected until real external distribution evidence exists. |

## Completion Notes

Completed. Developer ID readiness, Developer ID signing, and notarization smokes now consume the same ignored distribution local env workflow used by distribution private-inputs checks. They record only loader metadata, key names, booleans, blockers, and false release claims; they do not record local env values, credential values, tokens, Developer ID identity labels/fingerprints, channel values, private beats, or real user audio. External distribution remains blocked on real private values, valid Developer ID identity, notarization/stapling, notarized Gatekeeper acceptance, update/channel metadata, and manual channel QA approval.
