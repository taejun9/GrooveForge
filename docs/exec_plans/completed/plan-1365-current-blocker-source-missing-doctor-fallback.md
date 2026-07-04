# plan-1365-current-blocker-source-missing-doctor-fallback

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

Continue completing GrooveForge for working producers like 천재노창 or GroovyRoom and first-time composers, report overall completion after each completed work, and test by running the actual app and checking behavior on screen.

## Goal

Keep the release current-blocker path usable when local source release evidence is missing but `release:doctor` has already identified the real current release-channel placeholder blocker.

## Non-Goals

- Fill, infer, or modify real release URL, support URL, channel, feed, credential, token, Developer ID, notary, or manual QA values.
- Edit `.env.release-channel.local` or `.env.distribution.local`.
- Run release upload, update feed publish, Apple notary submission, signing, Gatekeeper approval, external hard gate completion, or distribution-channel probes.
- Change workstation music behavior, project schema, playback, export, or sampling scope.

## Context Map

- `harness/scripts/run_release_current_blocker_smoke.mjs`
- `harness/scripts/run_release_external_proof_bundle.mjs`
- `harness/scripts/run_release_next_actions.mjs`
- `harness/scripts/run_release_doctor.mjs`
- `harness/scripts/run_qa.py`
- `docs/release/readiness.md`
- `docs/quality/rules.md`
- `docs/architecture/harness.md`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1365-current-blocker-source-missing-doctor-fallback` and `.worktree/plan-1365-current-blocker-source-missing-doctor-fallback` for repository work.
- Keep private values redacted and do not record git status paths in release receipts.
- Actual screen behavior must be verified through an app launch smoke before final reporting.

## Implementation Plan

- [x] Inspect the failing source-missing `release:current-blocker` path.
- [x] Preserve doctor-derived release-channel placeholder action fields when source release evidence is missing.
- [x] Update validation, docs, and QA expectations so bootstrap/source-missing evidence still carries a ready operator command sequence from doctor.
- [x] Run focused QA, completion/current-blocker smokes, and actual app launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check` for touched release scripts.
- `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- `npm run release:doctor`
- `npm run release:current-blocker`
- `npm run desktop:launch-smoke` with approved macOS GUI/AppKit access
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-04 | Treat source-missing release evidence as a bootstrap state that can still surface the doctor current action. | The operator should see the actionable release-channel placeholder path instead of being blocked by a proof-bundle sequence validation failure while source release artifacts are being regenerated. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-04 | project_lead | Started after `npm run release:doctor` showed `.env.distribution.local` exists but has 21 placeholder keys, including four current release-channel metadata placeholders, and `npm run release:current-blocker` failed because proof-bundle read source-missing next-actions with an unready operator sequence. |
| 2026-07-04 | harness_builder | Added source-missing next-actions bootstrap preservation for doctor `replace-release-channel-placeholders` evidence, keeping `release:check` as source prerequisite while preserving the release-channel operator command sequence. |
| 2026-07-04 | quality_runner | Passed `node --check` for touched release scripts, `git diff --check`, `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`, `npm run build`, actual GUI `npm run desktop:launch-smoke`, and source-missing placeholder repros for `release:next-actions` and `release:proof-bundle`. |
| 2026-07-04 | quality_runner | `release:current-blocker` now passes the former proof-bundle sequence failure and reaches its intended source-evidence guard with current proof bundle command/blocker details; full current-blocker receipt still requires `npm run release:check` source evidence. |
