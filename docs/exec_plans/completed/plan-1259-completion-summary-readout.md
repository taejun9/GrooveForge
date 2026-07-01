# plan-1259-completion-summary-readout

## Status

completed

## Owner

harness_builder / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사용자 모두 사용할 수 있도록 앱 제작을 완료하고, 작업이 끝날 때마다 전체 기준 완성도를 알려준다.

## Goal

Add a compact readout command for the `release:progress-refresh-smoke` completion summary so post-work reports can verify and print the current completion percentage, latest plan, 10-plan progress, freshness, current blocker, and operator proof command from one value-free artifact.

## Non-Goals

- Do not replace `npm run release:progress-refresh-smoke` as the required post-work refresh.
- Do not remove or rename existing release progress refresh JSON fields.
- Do not record, infer, invent, or commit release/support/feed/channel/credential values.
- Do not modify `.env.distribution.local`.
- Do not run network probes, publish update feeds, upload releases, sign artifacts, submit to Apple, approve manual QA, or submit to an app store.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA completion, or app-store submission.

## Context Map

- `release:progress-refresh-smoke` now writes a compact `completionSummary` and stable top-level aliases.
- Operators still need a small command that reads the existing refresh artifact and prints the report-ready values without rerunning the refresh chain.
- The command should fail with guidance if the refresh artifact is missing or stale/malformed, so reports do not accidentally use weak evidence.
- Current completion remains `99.999999%` with `0.000001%` pending private/operator-owned external distribution proof.

## Constraints

- QA and review are separate loops.
- Keep the readout value-free and non-claiming.
- Update this plan when scope or approach changes.

## Implementation Plan

- [x] Add `npm run release:completion-summary-smoke` backed by a readout script that validates the existing refresh summary.
- [x] Write ignored Markdown/JSON readout artifacts with the compact report-ready fields.
- [x] Document the command in README, release readiness, and harness architecture.
- [x] Add QA expectations for the command, script, docs, and package script.
- [x] Run focused quality checks.
- [x] Complete review, move this plan to completed, and create the review mirror.

## QA Plan

- `npm run qa`
- `git diff --check`
- `node --check harness/scripts/run_release_completion_summary_smoke.mjs`
- `npm run release:completion-summary-smoke` after merge from main, using existing ignored release evidence

## Review Plan

QA completes before review starts. Review verifies the readout mirrors `completionSummary`, remains value-free, preserves `release:progress-refresh-smoke` as the required refresh, and does not claim external distribution completion.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Add plan-1259 for completion summary readout. | Completion reports need a simple value-free command that reads the refreshed summary artifact without rerunning the full refresh chain. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Plan created on `codex/plan-1259-completion-summary-readout` to add a compact completion summary readout command. |
| 2026-07-01 | harness_builder | Added `npm run release:completion-summary-smoke`, a value-free readout script that validates the existing progress refresh `completionSummary` and writes ignored Markdown/JSON readout artifacts. |
| 2026-07-01 | repo_cartographer | Documented the completion summary readout in README, release readiness, harness architecture, and quality rules. |
| 2026-07-01 | quality_runner | Passed `npm run qa`, `git diff --check`, and `node --check harness/scripts/run_release_completion_summary_smoke.mjs`. Full readout execution will run from main after merge where ignored release evidence exists. |
| 2026-07-01 | review_judge | Reviewed the completion summary readout command, docs, package script, and QA coverage; no blocking findings remain. |
