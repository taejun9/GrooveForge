# plan-1384-private-input-location-summary

## Goal

Fix the release completion summary so the current private input placeholder summary shows the actual ignored private input file locations instead of `none KEY` when `.env.release-channel.local` placeholder rows are present.

## Scope

- Repair the value-free private input placeholder location summary used by completion refresh, source prerequisite, and external packet evidence.
- Preserve the existing location rows and private-value redaction.
- Fix the live production Electron Command Reference launch path found by the required screen smoke.
- Update QA guards and release docs if needed.
- Run focused QA plus actual app/screen validation before completion reporting.

## Non-Goals

- Do not edit `.env.release-channel.local` or `.env.distribution.local`.
- Do not infer or record release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identities, or private audio.
- Do not upload releases, publish feeds, probe distribution channels, submit to Apple notarization, or claim external distribution completion.

## Constraints

- Work on `codex/plan-1384-private-input-location-summary` in `.worktree/plan-1384-private-input-location-summary`.
- Keep all release evidence value-free.
- QA and review are separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Confirm the current evidence mismatch.
- [x] Fix the summary string generation while preserving row data.
- [x] Update QA/docs guards.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_progress_refresh_smoke.mjs`
- `npm run qa`
- `npm run release:progress-refresh-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `npm run release:source-evidence-prereq-smoke`
- `npm run desktop:launch-smoke`
- `git diff --check`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Fix the location summary because main evidence has correct private input placeholder rows for `.env.release-channel.local:6-9`, but the top-level summary still reports `none KEY`, weakening the operator handoff for the remaining release-channel blocker. |
| 2026-07-05 | quality_runner | Expand scope to fix the production Electron Command Reference launch path after the required `npm run desktop:launch-smoke` screen test timed out collecting live Command Reference evidence. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | quality_runner | Confirmed main completion evidence reports `currentPrivateInputPlaceholderLocations` with `.env.release-channel.local:6-9` rows while `currentPrivateInputPlaceholderLocationSummary` says `none` for those keys. |
| 2026-07-05 | harness_builder | Added fallback formatting from row file/line fields so current private input placeholder summaries keep `.env.release-channel.local:line` locations while preserving value redaction. |
| 2026-07-05 | harness_builder | Limited the default Command Reference `All` preview render so the live Electron smoke can open the command map and search without blocking on the full command list. |
| 2026-07-05 | harness_builder | Replaced the monolithic Command Reference launch smoke collection with staged open/search/handoff waits so the live production Electron screen test validates the actual route instead of timing out on a single long JavaScript evaluation. |
| 2026-07-05 | quality_runner | `node --check` passed for release proof bundle, current blocker, progress refresh, completion summary, and source evidence prerequisite scripts. |
| 2026-07-05 | quality_runner | `npm run build` passed after the Command Reference UI and Electron launch-smoke changes. |
| 2026-07-05 | quality_runner | `npm run desktop:launch-smoke` passed against the live production Electron app, including Command Reference search, row context, and Quick Actions handoff evidence. |
| 2026-07-05 | quality_runner | `npm run qa`, `npm run release:source-evidence-prereq-smoke`, and `git diff --check` passed. The isolated plan worktree does not have the main worktree's full ignored source evidence, so `npm run release:progress-refresh-smoke` remains a post-merge main-worktree verification step. |
