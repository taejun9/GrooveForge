# plan-1214-final-handoff-refresh-smoke

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge for working producers and first-time composers, report completion after each completed work item, and report progress every 10 plans.

## Goal

Add a one-command value-free refresh smoke that updates release progress/current-blocker freshness, refreshes final handoff receipts, and proves final-handoff/post-edit-proof labels match the latest 10-plan checkpoint.

## Non-Goals

- Replacing real private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel value, credential, token, identity, or private values.
- Running the full `npm run release:check` gate.
- Probing remote feeds/channels, publishing update feeds, uploading releases, signing artifacts, submitting to Apple, approving manual QA, or claiming auto-update/external distribution completion.
- Changing app UI, audio, project schema, export behavior, or sampling scope.
- Adding this refresh smoke to `npm run verify`.

## Context Map

- Plan 1213 added `release:progress-refresh-smoke`, which refreshes progress/current-blocker/freshness labels to the latest dynamic 10-plan checkpoint.
- Current ignored build evidence shows progress/current-blocker/update-feed receipts at `1211-1220: 3/10`, while final-handoff and post-edit-proof receipts can remain stale at an older 10-plan window until their heavier commands are rerun.
- Operators need one explicit value-free command to refresh final handoff receipts and prove they match the latest progress checkpoint without making external distribution claims.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add `harness/scripts/run_release_final_handoff_refresh_smoke.mjs`.
- [x] Add `npm run release:final-handoff-refresh-smoke`.
- [x] Write value-free JSON/Markdown artifacts summarizing progress refresh, final handoff refresh, success-redaction refresh, final source labels, and freshness posture.
- [x] Update README/docs/quality/release readiness/QA expectations for the new command and artifacts.
- [x] Prove the command refreshes final-handoff/post-edit-proof labels to the latest 10-plan checkpoint and preserves non-claim posture.

## QA Plan

- `node --check harness/scripts/run_release_final_handoff_refresh_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:final-handoff-refresh-smoke`
- Direct JSON inspection for command order, final handoff labels, completion fields, value redaction, non-claim posture, and current 10-plan label

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add a final handoff refresh smoke instead of changing `release:final-handoff` to refresh progress automatically. | It keeps final handoff focused on its source receipts while giving operators one explicit command to make progress/current-blocker/final-handoff labels fresh together. |
| 2026-06-30 | Run `release:proof-bundle` before `release:progress-refresh-smoke` inside the final handoff refresh smoke. | The progress-refresh path requires external proof bundle evidence; generating it first keeps the new command usable as a one-command refresh in a fresh worktree evidence set. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main progress refresh proof showed `1211-1220: 3/10`, completion `99.999999%`, remaining `0.000001%`, and ignored final-handoff/post-edit-proof receipts still carried stale `1201-1210: 6/10` labels before refresh. |
| 2026-06-30 | harness_builder | Added `release:final-handoff-refresh-smoke`, which runs `release:proof-bundle`, `release:progress-refresh-smoke`, `release:final-handoff`, and `release:final-handoff-success-redaction-smoke` in order and writes ignored final-handoff-refresh Markdown/JSON artifacts. |
| 2026-06-30 | quality_runner | Passed `node --check harness/scripts/run_release_final_handoff_refresh_smoke.mjs`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run release:next-actions-smoke`, and `npm run release:final-handoff-refresh-smoke`; after moving the plan to completed, the generated refresh JSON reported `1211-1220: 4/10`, `labelsMatch: true`, completion `99.999999`, remaining `0.000001`, `valueRecorded: false`, and no external distribution claim. |
