# plan-1046-support-artifact

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a local support artifact smoke that produces publish-ready support page evidence for the desktop release chain without requiring a public support URL, credentials, uploads, remote probes, or private channel values.

## Non-Goals

- Do not publish support pages or upload artifacts.
- Do not record support URLs, release URLs, feed URLs, credentials, tokens, Apple credentials, or private channel values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: local release artifact manifest with checksums and signing claims.
- `harness/scripts/run_desktop_release_notes_smoke.mjs`: local release notes Markdown/JSON evidence.
- `harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`: final redacted distribution-channel blocker summary.
- `docs/release/readiness.md`: release evidence matrix and unclaimed distribution scope.
- `docs/quality/rules.md`: release gate command list and QA contract.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1046-support-artifact` and `.worktree/plan-1046-support-artifact` for git repository work.
- Keep support artifact generation local, deterministic, and value-free.
- Treat missing support URL, Developer ID signing, notarization, Gatekeeper acceptance, update metadata, and live distribution QA as blockers, not QA failures.

## Implementation Plan

- [x] Add `desktop:support-artifact-smoke`.
- [x] Have the smoke read the local release manifest and release notes artifact.
- [x] Write Markdown and JSON support artifacts under ignored `build/desktop/`.
- [x] Include install scope, first-session help, export help, update support posture, privacy/local-first posture, and current external-distribution blockers.
- [x] Ensure support artifacts do not record support URLs, release URLs, feed URLs, credentials, tokens, or release channel values.
- [x] Wire the smoke into `npm run verify` after release notes and before update feed checks.
- [x] Teach distribution-channel QA to require the local support artifact in addition to the support URL key.
- [x] Update docs, QA expectations, release readiness, review, and completion notes without claiming external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_support_artifact_smoke.mjs`
- `node --check harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:support-artifact-smoke`
- `npm run release:check`

## Review Plan

QA completed before review started.

Review completed with no blocking findings.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a local support artifact before channel QA. | External distribution requires support-page content before a public support URL can be approved, and the content can be verified locally without credentials or publishing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local support artifact evidence. |
| 2026-06-28 | harness_builder | Added `run_desktop_support_artifact_smoke.mjs`, wired `desktop:support-artifact-smoke` into `verify`, and taught distribution-channel QA to require the local support artifact. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness, package scripts, and QA expectations for local support artifact evidence. |
| 2026-06-28 | quality_runner | `node --check`, `git diff --check`, `python3 harness/scripts/run_qa.py`, and unsandboxed `npm run release:check` passed. |
| 2026-06-28 | review_judge | Reviewed post-QA with no blocking findings; remaining blockers are distribution channel metadata/URLs, manual channel QA approval, update provider/feed metadata, signed update metadata, Developer ID identity, notarization/stapling, and Gatekeeper acceptance. |

## Completion Notes

Completed. `desktop:support-artifact-smoke` now writes ignored Markdown and JSON artifacts under `build/desktop/GrooveForge-<platform>-<arch>/`, reads the local release manifest plus release notes artifact, records install/launch scope, first-session help, export help, update support posture, local-first privacy posture, beginner and producer audience posture, and current external-distribution blockers, and keeps support URL, release URL, feed, credential, token, and channel value-recording flags false.

The latest unsandboxed `npm run release:check` passed. The support artifact was ready, and the final distribution-channel QA summary now reports release artifact ready: yes, release notes artifact ready: yes, and support artifact ready: yes, while external distribution remains not ready because channel metadata, manual approval, auto-update readiness, Developer ID signing, notarization/stapling, and notarized Gatekeeper acceptance are still missing. No support page publishing, upload, remote channel probe, Developer ID signing claim, notarization claim, Gatekeeper approval claim, auto-update claim, app-store claim, or external distribution-channel QA claim was made.
