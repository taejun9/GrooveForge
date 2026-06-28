# plan-1048-distribution-bundle-manifest

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local distribution bundle manifest smoke that turns the generated desktop release, release notes, support, handoff, update, signing, notarization, Gatekeeper, and channel-QA evidence into a redacted bundle manifest and checklist without copying large artifacts, uploading, publishing, probing remote services, or recording private values.

## Non-Goals

- Do not upload releases, publish support/release/update pages, or create public distribution channels.
- Do not copy the DMG or app bundle into a new tracked artifact; reference local ignored paths and checksums only.
- Do not record release URLs, support URLs, feed URLs, credentials, tokens, Apple credentials, Developer ID identity labels, or private channel values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_distribution_handoff_smoke.mjs`: redacted local handoff artifact.
- `harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`: final redacted distribution-channel blocker summary.
- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: local release artifact manifest and checksums.
- `docs/release/readiness.md`: release evidence matrix and unclaimed distribution scope.
- `docs/quality/rules.md`: release gate command list and QA contract.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1048-distribution-bundle-manifest` and `.worktree/plan-1048-distribution-bundle-manifest` for git repository work.
- Keep bundle manifest generation local, deterministic, and value-free.
- Treat missing public URLs, channel metadata, Developer ID signing, notarization, Gatekeeper acceptance, update metadata, and live distribution QA as blockers, not QA failures.

## Implementation Plan

- [x] Add `desktop:distribution-bundle-manifest-smoke`.
- [x] Have the smoke read the local release manifest, release notes artifact, support artifact, distribution handoff, update metadata policy, auto-update readiness, Developer ID signing, notarization, notarized Gatekeeper, and distribution-channel QA summaries.
- [x] Write Markdown and JSON bundle manifest artifacts under ignored `build/desktop/`.
- [x] Include referenced artifact paths, byte sizes, SHA-256 evidence, release checklist state, required private input key names, next local commands, direct-composition product scope, privacy/local-first posture, and current external-distribution blockers.
- [x] Ensure bundle manifest artifacts do not record release URLs, support URLs, feed URLs, credentials, tokens, identity labels, or release channel values.
- [x] Wire the smoke into `npm run verify` after distribution handoff.
- [x] Update docs, QA expectations, release readiness, review, and completion notes without claiming external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_distribution_bundle_manifest_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:distribution-bundle-manifest-smoke`
- `npm run release:check`

## Review Plan

Review starts only after QA completes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a local distribution bundle manifest after handoff. | External handoff still benefits from one redacted file list and checksum checklist that can be reviewed before private signing/channel values exist. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for redacted distribution bundle manifest evidence. |
| 2026-06-28 | harness_builder | Added `run_desktop_distribution_bundle_manifest_smoke.mjs`, wired it into `npm run verify`, and updated release/readiness/harness documentation plus QA expectations. |
| 2026-06-28 | quality_runner | `npm run release:check` passed; bundle manifest ready was yes after the full evidence chain, external distribution remained no, and no large artifact copy was recorded. |

## Completion Notes

Implemented a local redacted distribution bundle manifest smoke. It writes ignored Markdown/JSON artifacts under `build/desktop/`, references local release/handoff/update/signing/notarization/Gatekeeper/channel evidence by path, byte size, and checksum, records required private input key names only, and keeps network/upload/no-claim flags explicit.

External distribution remains blocked by missing Developer ID identity, notary credential signals, notarization/stapling, Gatekeeper acceptance, update provider/feed/channel metadata, release/support URLs, and manual distribution-channel QA approval.
