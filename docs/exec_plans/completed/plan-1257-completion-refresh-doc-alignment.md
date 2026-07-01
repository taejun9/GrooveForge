# plan-1257-completion-refresh-doc-alignment

## Status

completed

## Owner

repo_cartographer / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사용자 모두 사용할 수 있도록 앱 제작을 완료하고, 작업이 끝날 때마다 전체 기준 완성도를 알려준다.

## Goal

Align README and harness architecture completion-report guidance with the post-work `npm run release:progress-refresh-smoke` requirement so public and architecture docs match release readiness guidance.

## Non-Goals

- Do not record, infer, invent, or commit release/support/feed/channel/credential values.
- Do not modify `.env.distribution.local`.
- Do not run network probes, publish update feeds, upload releases, sign artifacts, submit to Apple, approve manual QA, or submit to an app store.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA completion, or app-store submission.

## Context Map

- `docs/release/readiness.md` now says completion reports after each completed work must run `npm run release:progress-refresh-smoke` before reporting the user-facing completion percentage.
- README and `docs/architecture/harness.md` describe `release:progress-refresh-smoke`, but nearby completion-report paragraphs still emphasize `release:progress-smoke` as a user-facing progress update path.
- `release:progress-refresh-smoke` is the safer post-work receipt because it refreshes update-feed checkpoint, progress, current-blocker, completion packet, freshness, and operator brief evidence together.
- Current completion remains `99.999999%` with `0.000001%` pending private/operator-owned external distribution proof.

## Constraints

- QA and review are separate loops.
- Keep docs value-free and non-claiming.
- Update this plan when scope or approach changes.

## Implementation Plan

- [x] Add README guidance that after each completed work completion reports run `npm run release:progress-refresh-smoke`, while `release:progress-smoke` remains the narrower existing-evidence rewrite.
- [x] Add matching harness architecture guidance for the post-work completion refresh role.
- [x] Add QA expectations to preserve README and harness architecture alignment.
- [x] Run focused quality checks.
- [x] Complete review, move this plan to completed, and create the review mirror.

## QA Plan

- `npm run qa`
- `git diff --check`
- Direct text checks for README and harness architecture completion refresh guidance
- `npm run release:progress-refresh-smoke` after merge from main, using existing ignored release evidence

## Review Plan

QA completes before review starts. Review verifies README and harness architecture require the stronger completion-report refresh after completed work without weakening the full release gate or claiming external distribution completion.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Add plan-1257 for completion refresh doc alignment. | Release readiness already has the post-work refresh command, but README and harness architecture should expose the same rule where completion progress commands are summarized. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Plan created on `codex/plan-1257-completion-refresh-doc-alignment` to align README and harness architecture completion refresh guidance. |
| 2026-07-01 | repo_cartographer | Added README and harness architecture guidance requiring `npm run release:progress-refresh-smoke` after each completed work before reporting user-facing completion percentage. |
| 2026-07-01 | harness_builder | Added QA expectations to preserve the README and harness architecture completion refresh guidance. |
| 2026-07-01 | quality_runner | Passed `npm run qa`, `git diff --check`, and direct README/harness completion refresh guidance text checks. |
| 2026-07-01 | review_judge | Reviewed README, harness architecture, and QA expectation alignment; no blocking findings remain. |
