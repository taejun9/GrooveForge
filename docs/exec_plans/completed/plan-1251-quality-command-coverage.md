# plan-1251-quality-command-coverage

## Status

completed

## Owner

repo_cartographer / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사용자 모두 사용할 수 있도록 앱 제작을 완료하고, 작업이 끝날 때마다 전체 기준 완성도를 알려준다.

## Goal

Align the quality command catalog and QA self-checks with the current release proof scripts so operators can find the exact value-free commands for final private release-channel evidence without relying on chat history.

## Non-Goals

- Do not record, infer, invent, or commit release/support/feed/channel/credential values.
- Do not modify `.env.distribution.local`.
- Do not run network probes, publish update feeds, upload releases, sign artifacts, submit to Apple, approve manual QA, or submit to an app store.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA completion, or app-store submission.

## Context Map

- `docs/quality/rules.md` is the authoritative QA handbook and includes a public "Current commands" block.
- `package.json` currently exposes release scripts that are described elsewhere but missing from that command block: `persona:smoke`, `release:channel-edit-packet-smoke`, `release:channel-unblock-smoke`, `release:completion-report-packet-smoke`, `release:current-blocker`, `release:current-blocker-smoke`, `release:external-check`, `release:operator-completion-brief-smoke`, `release:progress-smoke`, `release:proof-bundle`, and `release:proof-bundle-smoke`.
- The missing commands are directly relevant to the final operator-owned release-channel proof path and the completion reporting chain.
- Current completion remains `99.999999%` with `0.000001%` pending external/private distribution proof.

## Constraints

- QA and review are separate loops.
- Keep quality rules value-free and non-claiming.
- Update this plan when scope or approach changes.

## Implementation Plan

- [x] Add the missing current release/persona commands to `docs/quality/rules.md`.
- [x] Strengthen `harness/scripts/run_qa.py` so QA catches future drift in the quality command catalog.
- [x] Run focused quality checks.
- [x] Complete review, move this plan to completed, create the review mirror, and refresh progress evidence for `1251-1260: 1/10`.

## QA Plan

- `npm run qa`
- `git diff --check`
- Direct command-catalog diff check against `package.json`
- `npm run release:progress-refresh-smoke` after merge from main, using existing ignored release evidence

## Review Plan

QA completes before review starts. Review verifies that the quality command catalog covers the current release proof scripts, keeps private values out of docs, and does not turn optional smoke helpers into completion claims.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Patch quality command coverage as plan-1251. | The public quality rules omitted current release proof scripts needed for the operator completion path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Plan created on `codex/plan-1251-quality-command-coverage` after comparing `package.json` scripts with `docs/quality/rules.md` current command catalog. |
| 2026-07-01 | repo_cartographer | Added missing current command block entries for persona readiness, release current-blocker/progress smoke, release-channel unblock/edit packet, completion packet, operator completion brief, proof bundle, and external check commands. |
| 2026-07-01 | harness_builder | Added a QA check that parses the `docs/quality/rules.md` Current commands shell block directly and fails when required operator/proof commands are missing from that block. |
| 2026-07-01 | quality_runner | Passed direct command-catalog diff check against `package.json`, `npm run qa`, and `git diff --check` in the plan worktree. |
| 2026-07-01 | review_judge | Reviewed the quality command catalog and QA diff; no blocking findings remain. |
