# plan-1212-release-progress-freshness-smoke

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge for working producers and first-time composers, report completion after each completed work item, and report progress every 10 plans.

## Goal

Add a lightweight release progress freshness smoke that compares the latest dynamic update-feed checkpoint progress with existing release progress/current-blocker artifacts, so stale progress artifacts are visible without claiming external distribution completion.

## Non-Goals

- Replacing real private `.env.distribution.local` values.
- Recording update feed URL, channel, release URL, support URL, credential, token, identity, or private values.
- Refreshing the full release progress or current-blocker artifacts automatically.
- Probing remote update feeds, publishing update feeds, signing artifacts, submitting to Apple, approving manual QA, uploading releases, or claiming auto-update/external distribution completion.
- Changing app UI, audio, project schema, export behavior, or sampling scope.
- Adding the freshness smoke to `npm run verify`.

## Context Map

- Plan 1211 made update-feed checkpoint progress dynamic and currently reports the `1211-1220` plan window.
- Existing release progress/current-blocker artifacts may remain stale until their heavier commands are rerun.
- Operators need a quick value-free proof that shows whether those artifacts match the latest checkpoint label.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add `harness/scripts/run_release_progress_freshness_smoke.mjs`.
- [x] Add `npm run release:progress-freshness-smoke`.
- [x] Write value-free JSON/Markdown freshness artifacts that compare update-feed checkpoint, release progress report, and current blocker progress labels.
- [x] Update README/docs/quality/QA expectations for the new command and artifacts.
- [x] Prove the command reports the active/completed plan window without recording private values or claiming external distribution.

## QA Plan

- `node --check harness/scripts/run_release_progress_freshness_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:progress-freshness-smoke`
- Direct JSON inspection for freshness rows, value redaction, non-claim posture, completion fields, and current 10-plan label

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add a separate freshness smoke instead of changing the heavier progress/current-blocker commands. | It makes stale progress artifacts visible quickly while keeping existing release proofs and non-claim posture stable. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after user asked for overall completion. Current overall completion remains `99.999999%`, remaining `0.000001%`, and latest main checkpoint progress is `1211-1220: 1/10`. |
| 2026-06-30 | harness_builder | Added `release:progress-freshness-smoke`, value-free freshness Markdown/JSON artifacts, README/harness/readiness/quality docs, and QA expectations. |
| 2026-06-30 | quality_runner | Passed `node --check harness/scripts/run_release_progress_freshness_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `git diff --check`, release artifact prerequisites through update metadata artifacts, `npm run release:progress-freshness-smoke`, and direct JSON inspection. Worktree proof reported `1211-1220: 1/10`, freshness ready `true`, fresh artifacts `1/3`, stale artifacts `0`, missing artifacts `2`, refresh commands `npm run release:progress -> npm run release:current-blocker`, completion `99.999999%`, remaining `0.000001%`, no values, no network probe, and no auto-update or external distribution claims. |
| 2026-06-30 | review_judge | Review passed with no findings. The command remains outside `npm run verify`, records no private values, and treats stale/missing optional artifacts as evidence freshness gaps rather than completion claims. |
| 2026-06-30 | plan_keeper | After moving the plan to completed, reran `npm run release:progress-freshness-smoke` and direct JSON inspection. Final proof reported `1211-1220: 2/10`, freshness ready `true`, fresh artifacts `1/3`, stale artifacts `0`, missing artifacts `2`, refresh commands `npm run release:progress -> npm run release:current-blocker`, completion `99.999999%`, remaining `0.000001%`, no values, no network probe, and no auto-update or external distribution claims. |
