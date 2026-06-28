# plan-1063-local-delivery-package-smoke

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local delivery package smoke that writes and verifies a real sample-free beat deliverable bundle under ignored `build/desktop/`: project JSON, full mix WAV, four stem WAVs, arrangement MIDI, Handoff Sheet, and a manifest with checksums. This strengthens the proof that a first session can produce actual local files, not only in-memory Blob/download contracts.

## Non-Goals

- Do not change app UI, project schema, audio engine behavior, MIDI encoding semantics, Handoff wording, or export filenames.
- Do not write media artifacts outside ignored `build/desktop/`.
- Do not add sampling, imported audio, sampler tracks, remote services, accounts, analytics, or cloud sync.
- Do not claim external distribution readiness, Developer ID signing, notarization, Gatekeeper approval, auto-update, release upload, or manual QA approval.

## Context Map

- `src/domain/workstation.ts`: starter project, Beat Blueprints, delivery targets, project serialization, project filenames.
- `src/audio/render.ts`: mix/stem WAV Blob creation and export analysis.
- `src/audio/midi.ts`: arrangement MIDI bytes and filenames.
- `src/audio/handoff.ts`: Handoff Sheet text and filenames.
- `harness/scripts/run_runtime_smoke.mjs`: existing no-media-artifact export contract checks.
- `package.json`, `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, and `harness/scripts/run_qa.py`: command wiring and quality expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1063-local-delivery-package-smoke` and `.worktree/plan-1063-local-delivery-package-smoke`.
- Keep the generated delivery package value-free with no private user audio or external release data.
- The smoke must be deterministic enough for local release checks and must keep optional sampling out of the package.

## Implementation Plan

- [x] Add `desktop:local-delivery-package-smoke` that builds a sample-free beat from existing domain data and writes deliverable files under ignored `build/desktop/`.
- [x] Validate WAV headers/byte sizes, MIDI header/byte size, project JSON roundtrip, Handoff Sheet sections, checksums, manifest rows, and no sampling/audio-clip language.
- [x] Wire the smoke into `npm run verify` after `npm run harness:smoke` and before desktop packaging checks.
- [x] Update README, harness architecture, quality rules, release readiness evidence, and QA expectations.
- [x] Run QA/release checks, then complete the plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_local_delivery_package_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:local-delivery-package-smoke`
- `npm run release:check`

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a real local delivery package smoke. | Runtime smoke proves export contracts without writing media; a release-ready app also needs evidence that actual local deliverable files can be produced and verified. |
| 2026-06-28 | Keep all generated files under ignored `build/desktop/`. | The smoke should prove local delivery without adding binary media artifacts to the repo or touching user folders. |
| 2026-06-28 | Place the smoke directly after `npm run harness:smoke` in `npm run verify`. | The runtime smoke proves export contracts first, then the new smoke proves real file delivery before heavier desktop packaging checks. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for a local delivery package smoke. |
| 2026-06-28 | harness_builder | Added `run_desktop_local_delivery_package_smoke.mjs`, package script wiring, and verify-chain integration after the runtime smoke. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness evidence, and QA expectations for the real local delivery package artifact. |
| 2026-06-28 | quality_runner | `node --check`, `git diff --check`, `python3 -B harness/scripts/run_qa.py`, standalone local delivery package smoke, and `npm run release:check` passed. Hard external distribution gate failed as expected because private external-distribution evidence is incomplete. |

## Completion Notes

Implemented a local delivery package smoke that writes an ignored, sample-free 8-bar beat package under `build/desktop/` with a GrooveForge project JSON file, full mix WAV, four stem WAVs, arrangement MIDI, Handoff Sheet, and JSON/Markdown checksum manifests.

Validation:

- `node --check harness/scripts/run_desktop_local_delivery_package_smoke.mjs` passed.
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` passed.
- `git diff --check` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run desktop:local-delivery-package-smoke` passed standalone and produced 8 artifacts totaling 18,045,311 bytes.
- `npm run release:check` passed with the new smoke in the verify chain after `npm run harness:smoke`.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected because private distribution inputs, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, auto-update/channel metadata, and manual QA approval are not complete.

Review found no follow-up code changes before completion. The smoke does not record private values, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, or local env values, and does not claim external distribution readiness.
