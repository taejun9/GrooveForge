# plan-1202-strict-live-check-success-smoke

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge for working producers and first-time composers, report completion after each completed work item, and report progress every 10 plans.

## Goal

Add a value-free synthetic success smoke for the strict release-channel live check. The smoke should prove that `npm run release:channel-live-check-strict` exits zero when the four current release-channel metadata keys are present, non-placeholder, and shape-ready, without reading or modifying the real ignored `.env.distribution.local` and without recording URL or channel values.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, synthetic, or private values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.
- Adding the synthetic strict success smoke to `npm run verify`.

## Context Map

- Plan 1201 added `npm run release:channel-live-check-strict`, which fails correctly while current private release-channel metadata placeholders remain.
- The remaining external completion work still requires operator-owned private values.
- A synthetic success smoke can prove the strict pass branch separately without exposing or overwriting real release-channel metadata evidence.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add a safe artifact-stem override to `run_release_channel_live_check.mjs` for the strict success smoke only.
- [x] Add `harness/scripts/run_release_channel_live_check_strict_success_smoke.mjs`.
- [x] Add `npm run release:channel-live-check-strict-success-smoke` to `package.json`.
- [x] Update README, release readiness docs, harness docs, quality rules, and QA expectations.
- [x] Prove the synthetic strict success receipt is ready and value-free.

## QA Plan

- `node --check harness/scripts/run_release_channel_live_check.mjs`
- `node --check harness/scripts/run_release_channel_live_check_strict_success_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:channel-live-check-strict-success-smoke`
- Direct JSON inspection for strict ready success, 4/4 rows, zero placeholders, synthetic source isolation, no real local env read/modify, and value redaction

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Use a separate strict-success-smoke artifact stem. | The current real strict receipt should continue to show the real placeholder blocker; synthetic success evidence should not overwrite it. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main showed overall completion `99.999999%`, current 10-plan progress `1201-1210: 1/10`, and four release-channel metadata placeholders still blocking external distribution. |
| 2026-06-30 | harness_builder | Added the strict success smoke command, a smoke-only artifact stem/env-root path in the live-check script, docs, and QA expectations. |
| 2026-06-30 | quality_runner | `node --check harness/scripts/run_release_channel_live_check.mjs`, `node --check harness/scripts/run_release_channel_live_check_strict_success_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run release:channel-live-check-strict-success-smoke`, and direct JSON inspection passed. The synthetic receipt shows strict ready, 4/4 current-ready rows, zero placeholders, no real local env read/modify, no URL values, and no external distribution claim. |
