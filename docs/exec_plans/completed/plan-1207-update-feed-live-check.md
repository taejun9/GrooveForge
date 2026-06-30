# plan-1207-update-feed-live-check

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge for working producers and first-time composers, report completion after each completed work item, and report progress every 10 plans.

## Goal

Add a value-free update feed live check for the `auto-update-feed` operator step. The check should read the real ignored distribution env file, inspect only update feed URL and update channel readiness, support a strict mode for post-edit proof, and provide a synthetic strict success smoke without recording feed/channel values or claiming auto-update or external distribution completion.

## Non-Goals

- Replacing real private `.env.distribution.local` values.
- Recording update feed URL, channel, release URL, support URL, credential, token, identity, or private values.
- Probing remote update feeds, publishing update feeds, signing artifacts, submitting to Apple, approving manual QA, uploading releases, or claiming auto-update/external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.
- Adding the new live check to `npm run verify`.

## Context Map

- Plan 1206 proved that once release-channel metadata clears, the next priority action is `auto-update-feed`.
- `desktop:update-feed-config-smoke` already validates redacted update feed/channel configuration shapes and unsafe cases.
- `desktop:auto-update-readiness-smoke` reports real auto-update readiness blockers, including missing feed/channel metadata and unsigned/not-notarized update artifacts.
- Release-channel metadata already has operator-facing live, strict, success, post-edit, and handoff checks. The next `auto-update-feed` action needs a similarly value-free live check for real ignored env edits.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add `npm run release:update-feed-live-check`.
- [x] Add `npm run release:update-feed-live-check-strict`.
- [x] Add `npm run release:update-feed-live-check-strict-success-smoke`.
- [x] Write value-free Markdown/JSON receipts for real and synthetic update feed/channel readiness.
- [x] Update README, release readiness docs, harness docs, quality rules, package scripts, and QA expectations.
- [x] Prove receipts report current 10-plan progress `1201-1210: 7/10` after completion.

## QA Plan

- `node --check harness/scripts/run_release_update_feed_live_check.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:update-feed-live-check`
- `npm run release:update-feed-live-check-strict-success-smoke`
- Direct JSON inspection for real placeholder/blocker posture, synthetic strict-ready posture, value redaction, non-claim posture, and 10-plan progress

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add a dedicated update feed live check instead of changing auto-update readiness semantics. | Auto-update readiness must still include signed/notarized update artifacts, while this command should isolate the operator's feed/channel edit proof without fabricating downstream external evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main showed overall completion `99.999999%`, current 10-plan progress `1201-1210: 6/10`, current real blocker `release-channel-metadata`, and next priority action `auto-update-feed`. |
| 2026-06-30 | harness_builder | Added the update feed live check, strict mode, and strict success smoke with redacted six-key feed/channel inspection, selected-ready counts, current 10-plan progress, and false feed/channel value recording. |
| 2026-06-30 | repo_cartographer | Updated README, release readiness, harness architecture, quality rules, package scripts, and QA expectations for the operator-facing `auto-update-feed` live check. |
| 2026-06-30 | quality_runner | Passed `node --check` for the two new scripts, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run release:update-feed-live-check`, `npm run release:update-feed-live-check-strict-success-smoke`, and direct JSON inspection for readiness, redaction, claims, and progress. |
| 2026-06-30 | plan_keeper | After moving plan-1207 to completed, reran `npm run release:update-feed-live-check`, `npm run release:update-feed-live-check-strict-success-smoke`, and direct JSON inspection; receipts now report `1201-1210: 7/10` with no 10-plan report due. |
