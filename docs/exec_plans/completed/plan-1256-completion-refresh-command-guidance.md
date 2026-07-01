# plan-1256-completion-refresh-command-guidance

## Status

completed

## Owner

repo_cartographer / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사용자 모두 사용할 수 있도록 앱 제작을 완료하고, 작업이 끝날 때마다 전체 기준 완성도를 알려준다.

## Goal

Make the documented completion-report refresh workflow explicitly require `npm run release:progress-refresh-smoke` after each completed work so user-facing completion reports use the refreshed progress/current-blocker/completion-packet/freshness/operator-brief evidence set.

## Non-Goals

- Do not record, infer, invent, or commit release/support/feed/channel/credential values.
- Do not modify `.env.distribution.local`.
- Do not run network probes, publish update feeds, upload releases, sign artifacts, submit to Apple, approve manual QA, or submit to an app store.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA completion, or app-store submission.

## Context Map

- Current completion reports already run `npm run release:progress-refresh-smoke` after each completed work.
- `docs/release/readiness.md` still emphasizes `release:progress-smoke` as the fast user-facing completion refresh near the top of the release gate section.
- `release:progress-refresh-smoke` is the stronger command for completion reports because it refreshes update-feed checkpoint, progress, current blocker, completion packet, freshness, and operator brief in one value-free sequence.
- Current completion remains `99.999999%` with `0.000001%` pending private/operator-owned external distribution proof.

## Constraints

- QA and review are separate loops.
- Keep docs value-free and non-claiming.
- Update this plan when scope or approach changes.

## Implementation Plan

- [x] Clarify release readiness guidance so completion reports after each completed work run `release:progress-refresh-smoke`.
- [x] Add a quality rule and QA expectation for the post-work completion refresh command.
- [x] Run focused quality checks.
- [x] Complete review, move this plan to completed, create the review mirror, and refresh progress evidence for `1251-1260: 6/10`.

## QA Plan

- `npm run qa`
- `git diff --check`
- Direct text check for completion refresh guidance
- `npm run release:progress-refresh-smoke` after merge from main, using existing ignored release evidence

## Review Plan

QA completes before review starts. Review verifies that the documented completion-report refresh workflow points to `release:progress-refresh-smoke` without replacing the full `release:check` gate or claiming external distribution completion.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Add plan-1256 for completion refresh command guidance. | The stronger refresh command is already used after each completed work, but top-level release readiness guidance still makes `progress-smoke` look sufficient for user-facing completion refreshes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Plan created on `codex/plan-1256-completion-refresh-command-guidance` after confirming completion reports should use the progress refresh receipt after each completed work. |
| 2026-07-01 | repo_cartographer | Clarified release readiness guidance so post-work completion reports run `npm run release:progress-refresh-smoke` before reporting the user-facing completion percentage. |
| 2026-07-01 | harness_builder | Added QA expectations and a quality rule to preserve the completion-refresh command guidance. |
| 2026-07-01 | quality_runner | Passed `npm run qa`, `git diff --check`, and direct completion refresh guidance text checks. |
| 2026-07-01 | review_judge | Reviewed the completion refresh guidance update; no blocking findings remain. |
