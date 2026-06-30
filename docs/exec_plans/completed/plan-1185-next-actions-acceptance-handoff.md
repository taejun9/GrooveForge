# plan-1185-next-actions-acceptance-handoff

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Continue finishing GrooveForge for working producers and first-time composers, report completion after each completed work item, and report every 10 completed plans.

## Goal

Add value-free current-action acceptance, post-edit verification, and handoff rows to the external next-actions report so the first operator-facing release action list shows what must become ready after the four release-channel metadata placeholders are replaced.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, synthetic, or private values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.

## Context Map

- `harness/scripts/run_release_next_actions.mjs` writes the prioritized external next-actions report.
- `harness/scripts/run_release_current_blocker_smoke.mjs` already exposes current-action acceptance, post-edit verification, and handoff rows after proof-bundle/current-blocker evidence exists.
- `harness/scripts/run_release_doctor.mjs` emits the release-channel focus receipt used by next-actions.
- `harness/scripts/run_qa.py` guards script/doc contract strings.
- `docs/release/readiness.md`, `docs/architecture/harness.md`, and `docs/quality/rules.md` describe the release operator loop.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add current-action acceptance rows to external next-actions JSON, Markdown, console output, and self-validation.
- [x] Add current-action post-edit verification rows to external next-actions JSON, Markdown, console output, and self-validation.
- [x] Add current-action handoff rows to external next-actions JSON, Markdown, console output, and self-validation.
- [x] Update QA expectations and durable release/harness docs.

## QA Plan

- `node --check harness/scripts/run_release_next_actions.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:doctor`
- `npm run release:external-preflight`
- `npm run release:next-actions-smoke`
- direct JSON inspection for next-actions acceptance, post-edit verification, and handoff rows
- `npm run release:proof-bundle-smoke`
- `npm run desktop:external-distribution-gate-smoke`
- `npm run release:progress-smoke`
- `npm run release:current-blocker-smoke`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Surface acceptance, post-edit verification, and handoff rows in external next-actions. | The external next-actions report is the first operator-facing action list, so it should show the same value-free readiness signals the operator will use after editing the ignored release-channel metadata. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main confirmed `99.999999%` completion, `1181-1190: 4/10` 10-plan progress, and current action still blocked by four release-channel metadata placeholders. |
| 2026-06-30 | harness_builder | Added external next-actions current-action acceptance, post-edit verification, and handoff summaries with value-free JSON, Markdown, console output, and self-validation. |
| 2026-06-30 | repo_cartographer | Updated harness, release readiness, quality rules, README, and QA contract coverage for the new next-actions operator evidence. |
| 2026-06-30 | quality_runner | Ran syntax, QA, release doctor, external preflight, next-actions smoke, proof-bundle smoke, external distribution gate smoke, progress smoke, current-blocker smoke, and direct JSON inspection. Current acceptance remains blocked by four release-channel metadata placeholders; post-edit verification and handoff rows are ready. |

## Completion Notes

- External next-actions now exposes current-action acceptance rows and blocker rows for the release-channel metadata action.
- External next-actions now exposes value-free post-edit verification rows that state what must become ready after the placeholders are replaced.
- External next-actions now exposes a handoff package with source artifacts, edit target, acceptance, rerun command, and hard-gate command rows.
- The current external blocker remains `.env.distribution.local:10-13`, where the four release-channel metadata placeholders still need real private values before release completion can be claimed.
