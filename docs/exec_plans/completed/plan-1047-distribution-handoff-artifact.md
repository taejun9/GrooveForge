# plan-1047-distribution-handoff-artifact

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local distribution handoff artifact smoke that consolidates the desktop release evidence chain into publish-handoff Markdown and JSON without requiring public URLs, credentials, uploads, remote probes, or private channel values.

## Non-Goals

- Do not publish releases, support pages, update feeds, or distribution pages.
- Do not record release URLs, support URLs, feed URLs, credentials, tokens, Apple credentials, or private channel values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: local release artifact manifest with checksums and signing claims.
- `harness/scripts/run_desktop_release_notes_smoke.mjs`: local release notes Markdown/JSON evidence.
- `harness/scripts/run_desktop_support_artifact_smoke.mjs`: local support Markdown/JSON evidence.
- `harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`: final redacted distribution-channel blocker summary.
- `docs/release/readiness.md`: release evidence matrix and unclaimed distribution scope.
- `docs/quality/rules.md`: release gate command list and QA contract.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1047-distribution-handoff-artifact` and `.worktree/plan-1047-distribution-handoff-artifact` for git repository work.
- Keep handoff generation local, deterministic, and value-free.
- Treat missing public URLs, channel metadata, Developer ID signing, notarization, Gatekeeper acceptance, update metadata, and live distribution QA as blockers, not QA failures.

## Implementation Plan

- [x] Add `desktop:distribution-handoff-smoke`.
- [x] Have the smoke read the local release manifest, release notes artifact, support artifact, update feed/config evidence, signing/notarization/Gatekeeper evidence, and distribution-channel QA summary.
- [x] Write Markdown and JSON handoff artifacts under ignored `build/desktop/`.
- [x] Include artifact identity, checklist status, redacted environment-key requirements, next commands, direct-composition product scope, privacy/local-first posture, and current external-distribution blockers.
- [x] Ensure handoff artifacts do not record release URLs, support URLs, feed URLs, credentials, tokens, or release channel values.
- [x] Wire the smoke into `npm run verify` after distribution-channel QA.
- [x] Update docs, QA expectations, release readiness, review, and completion notes without claiming external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_distribution_handoff_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:distribution-handoff-smoke`
- `npm run release:check`

## Review Plan

QA completed before review started.

Review completed with no blocking findings.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a local distribution handoff artifact after channel QA. | External distribution needs a single redacted handoff packet that proves what is ready and what still requires private credentials or selected channel values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local distribution handoff evidence. |
| 2026-06-28 | harness_builder | Added `run_desktop_distribution_handoff_smoke.mjs`, wired `desktop:distribution-handoff-smoke` into `verify`, and generated redacted Markdown/JSON handoff artifacts from local release evidence. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness, package scripts, and QA expectations for distribution handoff evidence. |
| 2026-06-28 | quality_runner | `node --check`, `git diff --check`, `python3 harness/scripts/run_qa.py`, and unsandboxed `npm run release:check` passed. `release:check` ran `desktop:distribution-handoff-smoke` and reported distribution handoff ready: yes, external distribution ready: no. |
| 2026-06-28 | review_judge | Reviewed post-QA with no blocking findings; remaining blockers are distribution channel metadata/URLs, manual channel QA approval, update provider/feed metadata, signed update metadata, Developer ID identity, notary credentials, notarization/stapling, and Gatekeeper acceptance. |

## Completion Notes

Completed. `desktop:distribution-handoff-smoke` now writes ignored Markdown and JSON artifacts under `build/desktop/GrooveForge-<platform>-<arch>/`, reads the local release manifest, release notes artifact, support artifact, update feed config, update metadata policy, auto-update readiness, Developer ID readiness/signing, notarization, notarized Gatekeeper, and distribution-channel QA summaries, and consolidates artifact identity, evidence readiness, required private input key names, next local commands, product scope, privacy posture, handoff blockers, and external-distribution blockers.

The latest unsandboxed `npm run release:check` passed. The distribution handoff was ready, while external distribution remains not ready because channel metadata/URLs, manual approval, update provider/feed metadata, signed update metadata, Developer ID signing, notarization/stapling, and notarized Gatekeeper acceptance are still missing. No release upload, support page publishing, update feed publishing, remote channel probe, Developer ID signing claim, notarization claim, Gatekeeper approval claim, auto-update claim, app-store claim, or external distribution-channel QA claim was made.
