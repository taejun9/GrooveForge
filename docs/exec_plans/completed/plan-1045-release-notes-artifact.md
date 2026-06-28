# plan-1045-release-notes-artifact

## Status

completed

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a release notes artifact smoke that produces local, publish-ready release notes evidence from the desktop release manifest without requiring a distribution channel, credentials, uploads, or private URLs.

## Non-Goals

- Do not publish release notes or upload artifacts.
- Do not record release download URLs, release notes URLs, support URLs, credentials, tokens, Apple credentials, or private feed values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
- Do not change project schema, playback, audio rendering, export semantics, first-run workflow, or optional sampling scope.
- Do not make sampling part of the core MVP.

## Context Map

- `harness/scripts/run_desktop_release_manifest_smoke.mjs`: local release artifact manifest with checksums and signing claims.
- `harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`: final redacted distribution-channel blocker summary.
- `docs/release/readiness.md`: release evidence matrix and unclaimed distribution scope.
- `docs/quality/rules.md`: release gate command list and QA contract.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1045-release-notes-artifact` and `.worktree/plan-1045-release-notes-artifact` for git repository work.
- Keep release notes generation local, deterministic, and value-free.
- Treat missing Developer ID signing, notarization, Gatekeeper acceptance, update metadata, and live distribution QA as blockers, not QA failures.

## Implementation Plan

- [x] Add `desktop:release-notes-smoke`.
- [x] Have the smoke read the local desktop release manifest after it is generated.
- [x] Write Markdown and JSON release notes artifacts under ignored `build/desktop/`.
- [x] Include product scope, install/test posture, artifact identity, checksum evidence, privacy/local-first posture, and current external-distribution blockers.
- [x] Ensure release notes do not record private URLs, credentials, tokens, or release channel values.
- [x] Wire the smoke into `npm run verify` before distribution-channel QA.
- [x] Update docs, QA expectations, release readiness, review, and completion notes without claiming external distribution completion.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/run_desktop_release_notes_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:release-notes-smoke`
- `npm run release:check`

## Review Plan

QA completed before review started.

Review completed with no blocking findings.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a local release notes artifact before channel QA. | External distribution needs release notes content before a public release-notes URL can be approved, and this can be verified without external credentials or publishing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for local release notes artifact evidence. |
| 2026-06-28 | harness_builder | Added `run_desktop_release_notes_smoke.mjs`, wired `desktop:release-notes-smoke` into `verify`, and taught distribution-channel QA to require the local release notes artifact. |
| 2026-06-28 | repo_cartographer | Updated README, harness architecture, quality rules, release readiness, package scripts, and QA expectations for release notes artifact evidence. |
| 2026-06-28 | quality_runner | `node --check`, `git diff --check`, `python3 harness/scripts/run_qa.py`, standalone unsandboxed `desktop:launch-smoke`, and unsandboxed `npm run release:check` passed. A sandboxed `release:check` attempt failed at Electron AppKit registration before app code; unsandboxed rerun passed. |
| 2026-06-28 | review_judge | Reviewed post-QA with no blocking findings; remaining blockers are distribution channel metadata/URLs, manual channel QA approval, update provider/feed metadata, signed update metadata, Developer ID identity, notarization/stapling, and Gatekeeper acceptance. |

## Completion Notes

Completed. `desktop:release-notes-smoke` now writes ignored Markdown and JSON artifacts under `build/desktop/GrooveForge-<platform>-<arch>/`, reads the local release manifest, records all-genre direct-composition product scope, beginner and producer audience posture, app/DMG/checksum evidence, local privacy posture, and current external-distribution blockers, and keeps URL, credential, token, feed, and channel value-recording flags false.

The latest unsandboxed `npm run release:check` passed. The release notes artifact was ready, and the final distribution-channel QA summary now reports release artifact ready: yes and release notes artifact ready: yes, while external distribution remains not ready because channel metadata, manual approval, auto-update readiness, Developer ID signing, notarization/stapling, and notarized Gatekeeper acceptance are still missing. No upload, remote channel probe, Developer ID signing claim, notarization claim, Gatekeeper approval claim, auto-update claim, app-store claim, or external distribution-channel QA claim was made.
