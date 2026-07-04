# plan-1364-completion-refresh-real-preflight-preserve

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

Continue completing GrooveForge for working producers like 천재노창 or GroovyRoom and first-time composers, report overall completion after each completed work, and test by running the actual app and checking behavior on screen.

## Goal

Make the completion summary refresh preserve and report the real operator private-env apply preflight receipt consistently after external completion resume packet refreshes run their isolated blocked-smoke fixture.

## Non-Goals

- Fill, infer, or modify real release URL, support URL, channel, feed, credential, token, Developer ID, notary, or manual QA values.
- Edit `.env.release-channel.local` or `.env.distribution.local`.
- Run release upload, update feed publish, Apple notary submission, signing, Gatekeeper approval, external hard gate completion, or distribution-channel probes.
- Change workstation music behavior, project schema, playback, export, or sampling scope.

## Context Map

- `harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- `harness/scripts/run_release_completion_summary_smoke.mjs`
- `harness/scripts/run_release_external_completion_run_packet_smoke.mjs`
- `harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`
- `harness/scripts/run_qa.py`
- `docs/release/readiness.md`
- `docs/quality/rules.md`
- `docs/architecture/harness.md`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1364-completion-refresh-real-preflight-preserve` and `.worktree/plan-1364-completion-refresh-real-preflight-preserve` for git repository work.
- Keep real and synthetic private preflight receipts value-free and clearly separated.
- Actual screen behavior must be verified through an app launch smoke before final reporting.

## Implementation Plan

- [x] Reproduce or inspect the mismatch between final completion refresh summary and external completion run/resume packet real preflight fields.
- [x] Preserve the real preflight receipt snapshot across the refresh after isolated blocked-smoke resume evidence is regenerated.
- [x] Add self-checks so final completion refresh fails if the summary/run/resume real preflight fields disagree.
- [x] Update QA expectations and release docs for the preserved real-preflight invariant.
- [x] Run focused smokes, QA, completion refresh, and actual app launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- `node --check harness/scripts/run_release_completion_summary_smoke.mjs`
- `node --check harness/scripts/run_release_external_completion_run_packet_smoke.mjs`
- `node --check harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`
- `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- `npm run release:completion-summary-refresh-smoke`
- `npm run desktop:launch-smoke` with approved macOS GUI/AppKit access
- `git diff --check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-04 | Preserve the real operator preflight snapshot across completion refresh. | The resume packet must still run the isolated missing-input blocked-smoke fixture, but final user-facing completion evidence should not let that fixture overwrite or obscure the actual current operator preflight receipt. |
| 2026-07-04 | Keep the isolated blocked-smoke artifact mutable while preserving the real preflight under a separate refresh snapshot name. | The existing resume packet contract relies on the blocked-smoke fixture overwriting `release-channel-apply-private-env-preflight.json`; the safer fix is to capture the real receipt immediately after the real preflight step and validate all downstream packets against that preserved value-free snapshot. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-04 | project_lead | Started after main reported `plan-1363`, `1361-1370: 3/10`, `99.999999%` completion, and a release-channel metadata placeholder blocker. |
| 2026-07-04 | harness_builder | Added a preserved `release-completion-summary-refresh-real-operator-preflight` JSON snapshot, report fields, Markdown/console readouts, and validation checks that require the real preflight fields to match the compact completion summary plus external run/resume packets. |
| 2026-07-04 | doc_gardener | Updated harness architecture, release readiness, and quality rules so after-work completion refresh evidence documents the preserved real preflight snapshot and the separate synthetic blocked-smoke fixture. |
| 2026-07-04 | quality_runner | Passed `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`, `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`, `npm run build`, and approved-GUI `npm run desktop:launch-smoke`; the launch smoke opened the production Electron app, captured the mounted workstation screen, and verified beginner/professional producer Quick Actions. |
| 2026-07-04 | quality_runner | Started approved-GUI `npm run release:check`; it passed QA, quality gate, renderer/workflow/persona/runtime, actual desktop launch, package, packaged/project IO, ad-hoc signing, DMG/PKG, payload launch, simulated install launch, installed project IO, and external/readiness smokes before the later `release:progress-smoke` persona rewrite hit `ENOSPC`; duplicate ignored build app copies were removed and `npm run release:completion-summary-refresh-smoke` then passed. |
| 2026-07-04 | quality_runner | Confirmed the completion refresh JSON reports `realOperatorPreflightMatchesCompletionSummary`, `realOperatorPreflightMatchesExternalRunPacket`, and `realOperatorPreflightMatchesExternalResumePacket` as `true`, with latest completed plan still `plan-1363` before moving this plan to completed. |
