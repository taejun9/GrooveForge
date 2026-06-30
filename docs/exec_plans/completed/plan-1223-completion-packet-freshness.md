# plan-1223-completion-packet-freshness

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge so working producers like 천재노창 or GroovyRoom and first-time composers can use it, report completion after each completed work item, and report progress once per 10 plans.

## Goal

Add completion report packet freshness coverage to the existing release progress freshness smoke, so stale user-facing completion packet evidence is visible alongside release progress and current-blocker freshness.

## Non-Goals

- Replacing real private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel value, credential, token, identity, private beat, or real user audio values.
- Probing remote feeds/channels, publishing feeds, uploading releases, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Running the full `npm run release:check` gate.
- Changing app UI, audio synthesis, project schema, export behavior, optional sampling scope, or completion percentage.
- Making optional completion packet freshness failures block `npm run verify`.

## Context Map

- `release:progress-freshness-smoke` compares release progress and current blocker labels against the latest update-feed checkpoint.
- The user-facing `release:completion-report-packet-smoke` artifact can remain stale unless explicitly refreshed.
- Current overall completion remains `99.999999%`; the remaining `0.000001%` is external/private release proof.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add completion report packet artifact path, label extraction, readiness, and due posture to `release:progress-freshness-smoke`.
- [x] Include completion packet freshness in JSON, Markdown, console summaries, and refresh command rows without making stale optional artifacts claim completion.
- [x] Refresh completion report packet inside `release:progress-refresh-smoke` before final freshness validation.
- [x] Update README/release readiness/harness/quality docs and QA text expectations.
- [x] Prove completion remains `99.999999`, remaining `0.000001`, and no private values or external distribution claim are recorded.

## QA Plan

- `node --check harness/scripts/run_release_progress_freshness_smoke.mjs`
- `node --check harness/scripts/run_release_progress_refresh_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run verify`
- `npm run release:progress-freshness-smoke`
- `npm run release:completion-report-packet-smoke`
- `npm run release:progress-refresh-smoke`
- Direct JSON inspection for completion packet freshness row, refresh command, completion fields, value redaction, and non-claim posture.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Extend freshness smoke instead of adding a new command. | It keeps the existing observational freshness report as the single place that flags stale user-facing progress evidence without forcing heavy refreshes into `npm run verify`. |
| 2026-07-01 | Add completion packet refresh to progress refresh before freshness validation. | Once freshness tracks the packet row, the refresh wrapper must generate that optional artifact before requiring zero stale/missing rows. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Plan created after current evidence showed release progress/current blocker at `1221-1230: 2/10` while optional completion/handoff artifacts can lag until their refresh commands run. |
| 2026-07-01 | harness_builder | Added completion packet freshness rows and refresh guidance, then updated progress refresh to generate the packet before final freshness validation. |
| 2026-07-01 | quality_runner | `npm run verify` and `npm run release:progress-refresh-smoke` passed with completion still `99.999999%`, remaining `0.000001%`, and external distribution unclaimed. |
