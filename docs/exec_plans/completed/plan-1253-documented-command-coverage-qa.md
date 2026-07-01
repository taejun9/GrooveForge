# plan-1253-documented-command-coverage-qa

## Status

completed

## Owner

harness_builder / repo_cartographer

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사용자 모두 사용할 수 있도록 앱 제작을 완료하고, 작업이 끝날 때마다 전체 기준 완성도를 알려준다.

## Goal

Add a generic QA guard that keeps public command documentation aligned with the current `package.json` release, desktop, and core proof scripts so the final operator-owned release path cannot drift silently.

## Non-Goals

- Do not record, infer, invent, or commit release/support/feed/channel/credential values.
- Do not modify `.env.distribution.local`.
- Do not run network probes, publish update feeds, upload releases, sign artifacts, submit to Apple, approve manual QA, or submit to an app store.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA completion, or app-store submission.

## Context Map

- Plans 1251 and 1252 fixed concrete command coverage gaps in `docs/quality/rules.md` and `README.md`.
- The current direct audit shows `README.md`, `docs/release/readiness.md`, `docs/architecture/harness.md`, and `docs/quality/rules.md` mention all current release, desktop, and core scripts.
- `npm run qa` still relies mostly on static expected strings, so a future package script could be added without a generic documentation coverage failure.
- Current completion remains `99.999999%` with `0.000001%` pending external/private distribution proof.

## Constraints

- QA and review are separate loops.
- Keep docs value-free and non-claiming.
- Update this plan when scope or approach changes.

## Implementation Plan

- [x] Add a package-script-driven QA check for release, desktop, and core command coverage in the public command docs.
- [x] Document the coverage guard in `docs/quality/rules.md`.
- [x] Run focused quality checks.
- [x] Complete review, move this plan to completed, create the review mirror, and refresh progress evidence for `1251-1260: 3/10`.

## QA Plan

- `npm run qa`
- `git diff --check`
- Direct command coverage check across README, release readiness, harness architecture, and quality rules
- `npm run release:progress-refresh-smoke` after merge from main, using existing ignored release evidence

## Review Plan

QA completes before review starts. Review verifies that the generic command coverage guard is driven by `package.json`, reports useful missing-command errors, and does not force private values or external completion claims.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Add a generic documented-command coverage QA guard as plan-1253. | Plans 1251 and 1252 showed that one-off string checks can miss public command-map drift. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Plan created on `codex/plan-1253-documented-command-coverage-qa` after confirming current docs cover all release/desktop/core scripts but QA does not yet enforce that coverage generically. |
| 2026-07-01 | harness_builder | Added a `package.json`-driven QA check that requires every release, desktop, and selected core npm script to be documented in README, release readiness, harness architecture, and quality rules. |
| 2026-07-01 | repo_cartographer | Documented the command coverage guard in `docs/quality/rules.md` without changing external distribution claims or private value handling. |
| 2026-07-01 | quality_runner | Passed `npm run qa` and `git diff --check` in the plan worktree. |
| 2026-07-01 | review_judge | Reviewed the generic command coverage guard and quality-rule note; no blocking findings remain. |
