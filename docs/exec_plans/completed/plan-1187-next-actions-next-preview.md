# plan-1187-next-actions-next-preview

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Continue finishing GrooveForge for working producers and first-time composers, report completion after each completed work item, and report every 10 completed plans.

## Goal

Add value-free next-action preview rows to the external next-actions report so the first operator-facing release action list shows what comes immediately after the four release-channel metadata placeholders are replaced.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, synthetic, or private values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.

## Context Map

- `harness/scripts/run_release_next_actions.mjs` writes the prioritized external next-actions report.
- `harness/scripts/run_release_current_blocker_smoke.mjs` already derives next-action preview rows from the second pending priority action after current release-channel metadata clears.
- `harness/scripts/run_qa.py` guards script/doc contract strings.
- `docs/release/readiness.md`, `docs/architecture/harness.md`, and `docs/quality/rules.md` describe the release operator loop.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add next priority action summary fields to external next-actions JSON, Markdown, console output, and self-validation.
- [x] Add next-action preview ready criteria, checklist, blocker, verification, prerequisite command, operator action, and env edit rows from the second priority action.
- [x] Update QA expectations and durable release/harness docs.

## QA Plan

- `node --check harness/scripts/run_release_next_actions.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:external-preflight`
- `npm run release:next-actions-smoke`
- direct JSON inspection for next-action preview rows in external next-actions
- `npm run release:proof-bundle-smoke`
- `npm run desktop:external-distribution-gate-smoke`
- `npm run release:progress-smoke`
- `npm run release:current-blocker-smoke`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Surface the next pending priority action in external next-actions. | The external next-actions report is the first operator-facing release list, so it should show the immediate auto-update/feed preparation step that follows release-channel metadata without waiting for a separate current-blocker refresh. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main confirmed `99.999999%` completion, `1181-1190: 6/10` 10-plan progress, and current action still blocked by four release-channel metadata placeholders. |
| 2026-06-30 | harness_builder | Added external next-actions next priority and next-action preview summaries with value-free JSON, Markdown, console output, and self-validation. |
| 2026-06-30 | repo_cartographer | Updated harness, release readiness, quality rules, README, and QA contract coverage for the next-action preview evidence. |
| 2026-06-30 | quality_runner | Ran syntax, QA, external preflight, next-actions smoke, proof-bundle smoke, external distribution gate smoke, progress smoke, current-blocker smoke, and direct JSON inspection. Next-action preview is ready for `auto-update-feed` without recording private values. |

## Completion Notes

- External next-actions now exposes the next priority action after the current release-channel metadata blocker clears: `auto-update-feed`.
- The next-action preview includes `3` ready criteria rows, `2` checklist rows, `1` evidence row, `3` blocker rows, `3` verification rows, `4` prerequisite command rows, `2` operator action rows, and `6` env edit rows.
- The preview remains value-free and points to `npm run desktop:auto-update-readiness-smoke` as the next proof command.
- The current external blocker remains `.env.distribution.local:10-13`, where the four release-channel metadata placeholders still need real private values before release completion can be claimed.
