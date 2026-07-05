# plan-1390-completion-refresh-command-count

## Goal

Fix the completion summary refresh command-row self-check so it follows the actual required refresh command list after source prerequisite mirroring.

## Scope

- Replace the hard-coded completion-summary-refresh command row count and always-run slice with `requiredRefreshCommands.length`.
- Add QA text expectations so static QA catches future hard-coded command counts in this script.
- Run QA plus the required real Electron screen smoke.

## Non-Goals

- Do not edit `.env.release-channel.local` or `.env.distribution.local`.
- Do not change release metadata, private inputs, uploads, signing, notarization, or external-distribution claims.

## Constraints

- Work on `codex/plan-1390-completion-refresh-command-count` in `.worktree/plan-1390-completion-refresh-command-count`.
- Keep QA and review as separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Confirm the post-merge validation failure.
- [x] Update the dynamic command-row checks and QA guard.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run release:source-evidence-prereq-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Fix the validation failure as a separate plan instead of editing main directly, because AGENTS forbids implementation work on main and the issue is a post-merge self-check bug from plan-1389. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | quality_runner | Post-merge `npm run release:completion-summary-refresh-smoke` on main ran the new source prereq step and reported 21/21 source artifacts for plan-1389, then failed only on `release completion summary refresh should record required commands, real preflight, plus conditional checkpoint command` because the validation still expected six command rows. |
| 2026-07-05 | harness_builder | Replaced the hard-coded refresh command count and always-run slice with `requiredRefreshCommands.length`, preserving the conditional checkpoint row as the only extra command row. |
| 2026-07-05 | quality_runner | `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`, `npm run qa`, `git diff --check`, and `npm run build` passed in the plan worktree. |
| 2026-07-05 | quality_runner | `npm run desktop:launch-smoke` passed against the live production Electron app screen, including beginner, producer, Quick Actions, Command Reference, and workstation route evidence. |
| 2026-07-05 | quality_runner | `npm run release:source-evidence-prereq-smoke` passed in the isolated plan worktree with 0/21 source artifacts and value-free source-missing fallback output; full completion-summary-refresh validation is deferred to `main`, where ignored source evidence artifacts are present. |
