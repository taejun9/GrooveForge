# plan-1057-manual-channel-qa-checklist

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local manual distribution-channel QA checklist artifact to the release evidence chain so the final `GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1` approval is tied to a durable, value-free checklist rather than a standalone environment toggle.

## Non-Goals

- Do not upload releases, probe download/support/update URLs, submit to Apple, or publish update feeds.
- Do not record release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identity labels, private beats, or real user audio.
- Do not claim manual channel QA approval, auto-update, Developer ID signing, notarization, Gatekeeper approval, or external distribution completion without matching evidence.
- Do not change app UI, audio rendering, project schema, export behavior, generation behavior, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`: validates redacted channel metadata and currently uses `GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1` as the manual approval signal.
- `harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs`: groups private inputs and reports manual QA approval blockers.
- `harness/scripts/run_desktop_distribution_handoff_smoke.mjs` and `run_desktop_distribution_bundle_manifest_smoke.mjs`: consolidate local distribution evidence after channel QA.
- `package.json`: `verify` runs distribution-channel QA before handoff and bundle manifest.
- `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, and `harness/scripts/run_qa.py`: release harness descriptions and QA expectations must stay aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1057-manual-channel-qa-checklist` and `.worktree/plan-1057-manual-channel-qa-checklist`.
- The checklist artifact must be local, ignored, and value-free.
- Channel QA should remain runnable without private credentials while clearly reporting approval blockers.

## Implementation Plan

- [x] Add a `desktop:distribution-manual-qa-smoke` script that writes Markdown/JSON checklist artifacts from the local release evidence chain.
- [x] Include required manual checks for signed artifact selection, release/support pages, update feed metadata, install/launch, notarization/Gatekeeper, privacy, and all-genre direct-composition scope.
- [x] Wire the checklist into `verify` before distribution-channel QA.
- [x] Teach distribution-channel QA to read and report checklist readiness without recording private values.
- [x] Update docs and QA expectations.
- [x] Run QA/release checks, then complete plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_distribution_manual_qa_smoke.mjs`
- `node --check harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:distribution-manual-qa-smoke`
- `npm run desktop:distribution-channel-qa-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a value-free manual QA checklist before channel QA. | Manual approval should be attached to a durable local checklist so final distribution evidence is auditable without storing private channel values. |
| 2026-06-28 | Keep hard external distribution gate failing without manual approval and private distribution evidence. | The local release gate should pass, but real external distribution still requires private channel inputs, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, and explicit manual approval. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for manual channel QA checklist evidence. |
| 2026-06-28 | harness_builder | Added distribution manual QA smoke artifacts and wired them into verify before distribution-channel QA. |
| 2026-06-28 | harness_builder | Updated distribution-channel QA to read the manual checklist and report `Manual QA checklist ready` separately from final approval. |
| 2026-06-28 | quality_runner | `git diff --check`, script syntax checks, `python3 -B harness/scripts/run_qa.py`, targeted manual/channel QA smokes, and `npm run release:check` passed. |
| 2026-06-28 | quality_runner | Hard external distribution gate failed as expected without private inputs, auto-update readiness, Developer ID signing, notarization/stapling, notarized Gatekeeper, and manual channel QA approval evidence. |

## Completion Notes

Completed. The release evidence chain now writes a local value-free distribution manual QA checklist before final distribution-channel QA, and distribution-channel QA now reads that checklist before reporting external distribution readiness. The current credential-free local run records `Manual QA checklist ready: yes` and `Manual QA approval ready: no`, keeps private values out, and leaves external distribution blocked until private inputs, signed/notarized/Gatekeeper-accepted artifacts, update metadata, channel metadata, and `GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1` are provided and verified.
