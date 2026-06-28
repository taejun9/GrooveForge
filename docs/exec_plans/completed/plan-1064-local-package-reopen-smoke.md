# plan-1064-local-package-reopen-smoke

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local package reopen smoke that reads the real sample-free 8-bar delivery package from ignored `build/desktop/`, verifies the manifest checksums against files on disk, reopens the `.grooveforge.json` project through the project parser, regenerates analysis/MIDI/Handoff output from the reopened project, and writes a value-free reopen report. This proves the local deliverable package is durable after it leaves memory.

## Non-Goals

- Do not change app UI, project schema, MIDI encoding semantics, Handoff wording, export filenames, or audio features. A narrowly scoped deterministic render seed fix is allowed if required for package reopen fidelity.
- Do not write media artifacts outside ignored `build/desktop/`.
- Do not add sampling, imported audio, sampler tracks, remote services, accounts, analytics, or cloud sync.
- Do not claim external distribution readiness, Developer ID signing, notarization, Gatekeeper approval, auto-update, release upload, or manual QA approval.
- Do not replace the local delivery package smoke; the reopen smoke depends on that package evidence.

## Context Map

- `harness/scripts/run_desktop_local_delivery_package_smoke.mjs`: writes the real local delivery package and manifest.
- `src/domain/workstation.ts`: project parser, project filenames, arrangement bars, delivery target data.
- `src/audio/render.ts`: export/stem analysis, deterministic render seed input, and WAV file naming.
- `src/audio/midi.ts`: arrangement MIDI bytes and filenames.
- `src/audio/handoff.ts`: Handoff Sheet text and filenames.
- `package.json`, `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/release/readiness.md`, and `harness/scripts/run_qa.py`: command wiring and quality expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1064-local-package-reopen-smoke` and `.worktree/plan-1064-local-package-reopen-smoke`.
- The smoke must keep output value-free and must not print or store private user audio, private beats, URLs, credentials, tokens, identity labels, channel values, or local env values.
- The smoke must fail if the package has not first been produced by `npm run desktop:local-delivery-package-smoke`.

## Implementation Plan

- [x] Add `desktop:local-package-reopen-smoke` that reads the real local delivery package produced under ignored `build/desktop/`.
- [x] Validate manifest paths, byte sizes, SHA-256 checksums, WAV headers, MIDI header, Handoff sections, project-file roundtrip, and regenerated export/MIDI/Handoff contracts from the reopened project.
- [x] Write ignored Markdown/JSON reopen evidence with explicit privacy and release non-claims.
- [x] Wire the smoke into `npm run verify` immediately after `npm run desktop:local-delivery-package-smoke`.
- [x] Update README, harness architecture, quality rules, release readiness evidence, and QA expectations.
- [x] Run QA/release checks, then complete the plan and review mirror.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_local_package_reopen_smoke.mjs`
- `python3 -B harness/scripts/run_qa.py`
- `npm run desktop:local-delivery-package-smoke`
- `npm run desktop:local-package-reopen-smoke`
- `npm run release:check`
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` should still fail until private external-distribution evidence is complete.

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a reopen smoke after the real local delivery package smoke. | The package writer proves files are created; a separate reader proves the package remains durable and internally consistent when reopened from disk. |
| 2026-06-28 | Keep the reopen report under ignored `build/desktop/`. | Reopen evidence should be reproducible without committing generated media or touching user folders. |
| 2026-06-28 | Canonicalize render noise seed input with stable object-key ordering. | The reopen smoke exposed that structurally identical project data could render different drum noise after JSON save/load because key order affected seed generation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local package reopen evidence. |
| 2026-06-28 | harness_builder | Added initial reopen smoke and found byte mismatch for drum-noise render after reopening the saved project. |
| 2026-06-28 | harness_builder | Canonicalized render noise seed input with stable object-key ordering so saved/reopened projects render matching audio artifacts. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness evidence, and QA expectations for local package reopen evidence. |
| 2026-06-28 | quality_runner | `node --check`, `git diff --check`, `python3 -B harness/scripts/run_qa.py`, local delivery package smoke, local package reopen smoke, and `npm run release:check` passed. Hard external distribution gate failed as expected because private external-distribution evidence is incomplete. |

## Completion Notes

Implemented a local package reopen smoke that reads the real local delivery package from ignored `build/desktop/`, verifies manifest paths, byte sizes, SHA-256 checksums, WAV headers, MIDI header, Handoff sections, project-file roundtrip, reopened 8-bar arrangement, delivery target, filenames, non-silent mix/stem analysis, and regenerated mix WAV, four stem WAVs, arrangement MIDI, and Handoff output matching the disk artifacts.

The work also canonicalized render noise seed input with stable object-key ordering so structurally identical project data renders the same drum-noise output after `.grooveforge.json` save/load.

Validation:

- `node --check harness/scripts/run_desktop_local_package_reopen_smoke.mjs` passed.
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` passed.
- `git diff --check` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run desktop:local-delivery-package-smoke` passed.
- `npm run desktop:local-package-reopen-smoke` passed and verified 8/8 artifacts totaling 18,045,311 bytes.
- `npm run release:check` passed with the new smoke in the verify chain after `npm run desktop:local-delivery-package-smoke`.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected because private distribution inputs, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, auto-update/channel metadata, and manual QA approval are not complete.

Review found no follow-up code changes before completion. The reopen smoke writes only ignored Markdown/JSON evidence, does not record private values or real user audio, and does not claim external distribution readiness.
