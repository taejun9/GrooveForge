# plan-1213-release-progress-refresh-smoke

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge for working producers and first-time composers, report completion after each completed work item, and report progress every 10 plans.

## Goal

Add a one-command existing-evidence refresh smoke that updates release progress, updates current blocker, and verifies freshness against the latest update-feed checkpoint without running the full release gate.

## Non-Goals

- Replacing real private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel value, credential, token, identity, or private values.
- Running the full `npm run release:check` gate.
- Probing remote feeds/channels, publishing update feeds, uploading releases, signing artifacts, submitting to Apple, approving manual QA, or claiming auto-update/external distribution completion.
- Changing app UI, audio, project schema, export behavior, or sampling scope.
- Adding this refresh smoke to `npm run verify`.

## Context Map

- Plan 1212 added `release:progress-freshness-smoke`, which exposes stale release progress/current-blocker artifacts against the dynamic update-feed checkpoint.
- The current repo can refresh stale progress/current-blocker artifacts with `npm run release:progress-smoke` followed by `npm run release:current-blocker-smoke`, then recheck freshness.
- Operators should have one explicit value-free command for that existing-evidence refresh loop.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add `harness/scripts/run_release_progress_refresh_smoke.mjs`.
- [x] Add `npm run release:progress-refresh-smoke`.
- [x] Write value-free JSON/Markdown artifacts summarizing the three-command refresh sequence and final freshness posture.
- [x] Update README/docs/quality/release readiness/QA expectations for the new command and artifacts.
- [x] Prove the command refreshes existing-evidence progress/current-blocker artifacts and preserves non-claim posture.

## QA Plan

- `node --check harness/scripts/run_release_progress_refresh_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:progress-refresh-smoke`
- Direct JSON inspection for command order, final freshness, completion fields, value redaction, non-claim posture, and current 10-plan label

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add a separate existing-evidence refresh command instead of making freshness smoke refresh progress/current-blocker automatically. | It keeps freshness smoke observational while providing an explicit operator action to refresh stale artifacts without the full release gate. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main freshness proof showed `1211-1220: 2/10`, completion `99.999999%`, remaining `0.000001%`, and existing `release:progress-smoke` plus `release:current-blocker-smoke` successfully refreshed stale progress/current-blocker artifacts. |
| 2026-06-30 | harness_builder | Added `release:progress-refresh-smoke` as an explicit progress/current-blocker/freshness sequence that writes value-free refresh Markdown/JSON artifacts and validates matching 10-plan labels. |
| 2026-06-30 | quality_runner | `npm run release:check` passed in the plan worktree after preparing ignored local release env placeholders; `npm run release:progress-refresh-smoke` passed with `1211-1220: 2/10`, 3/3 fresh artifacts, zero stale artifacts, and zero missing artifacts. |
| 2026-06-30 | review_judge | Review passed with no findings. The command remains outside `npm run verify`, does not run the full release gate, records no private values, and keeps auto-update/external distribution unclaimed. |
| 2026-06-30 | plan_keeper | After moving the plan to completed, reran `npm run release:progress-refresh-smoke` and direct JSON inspection. Final proof reported `1211-1220: 3/10`, refresh ready `true`, 3/3 fresh artifacts, zero stale artifacts, zero missing artifacts, completion `99.999999%`, remaining `0.000001%`, no values, no network probe, and no auto-update or external distribution claims. |
