# plan-1250-readme-progress-refresh-readout

## Status

completed

## Owner

repo_cartographer / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사용자 모두 사용할 수 있도록 앱 제작을 완료하고, 작업이 끝날 때마다 전체 기준 완성도를 알려준다.

## Goal

Align the public README and harness architecture release-progress refresh descriptions with the current value-free progress refresh contract: update-feed checkpoint first, then progress, current blocker, completion packet, freshness, and operator completion brief.

## Non-Goals

- Do not record, infer, invent, or commit release/support/feed/channel/credential values.
- Do not modify `.env.distribution.local`.
- Do not run network probes, publish update feeds, upload releases, sign artifacts, submit to Apple, approve manual QA, or submit to an app store.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA completion, or app-store submission.

## Context Map

- `README.md` is the public entry point and described `release:progress-refresh-smoke` as the old four-command flow.
- `docs/architecture/harness.md` also described the old progress-refresh flow and strict proof success-smoke wording.
- `harness/scripts/run_release_progress_refresh_smoke.mjs`, `docs/quality/rules.md`, and `docs/release/readiness.md` now require six commands and the operator completion brief source artifact.
- This is plan-1250, so completion should produce the scheduled `1241-1250: 10/10` progress report posture.
- Current completion remains `99.999999%` with `0.000001%` pending external/private distribution proof.

## Constraints

- QA and review are separate loops.
- Keep README wording value-free and non-claiming.
- Update this plan when scope or approach changes.

## Implementation Plan

- [x] Update README's `release:progress-refresh-smoke` paragraph to the six-command order and operator brief coverage.
- [x] Add or update README wording for `release:operator-completion-brief-smoke` if needed so the public command map is complete.
- [x] Update README's private strict proof wording to include the post-refresh private-value leak audit step.
- [x] Align `docs/architecture/harness.md` and QA text expectations with the same command contract.
- [x] Run focused documentation and harness checks.
- [x] Complete review, move this plan to completed, create the review mirror, and regenerate progress evidence for `1241-1250: 10/10`.

## QA Plan

- `npm run qa`
- `git diff --check`
- `npm run release:progress-refresh-smoke`
- Direct JSON receipt inspection for completion, 10-plan progress, refresh command/source counts, operator brief posture, value redaction, and non-claim posture.

## Review Plan

QA completes before review starts. Review verifies that README matches the current command contract, does not reintroduce stale four-command guidance, and keeps private/external distribution claims out of public docs.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Fix README as plan-1250 instead of only relying on docs/release/readiness.md. | README is the public entry point and currently contradicts the latest operator progress refresh flow. |
| 2026-07-01 | Include the private-value leak audit wording fix in the same README plan. | The same public command map described the private strict proof chain without its post-refresh leak audit step. |
| 2026-07-01 | Align harness architecture and QA expectations after the README fix. | `npm run qa` checks both public README wording and the harness architecture contract, and both must describe the same release flow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Plan created on `codex/plan-1250-readme-progress-refresh-readout` after finding stale README release progress refresh wording. |
| 2026-07-01 | repo_cartographer | Updated README to add `release:operator-completion-brief-smoke`, expand `release:progress-refresh-smoke` to the six-command checkpoint/progress/current/completion/freshness/operator sequence, and include the private-value leak audit step in the strict proof chain. |
| 2026-07-01 | repo_cartographer | Updated `docs/architecture/harness.md` and `harness/scripts/run_qa.py` so the harness architecture and required text checks match the same six-command refresh and strict proof leak-audit wording. |
| 2026-07-01 | quality_runner | Passed `npm run qa` and `git diff --check` in the plan worktree. The first worktree `npm run release:progress-refresh-smoke` attempt failed because ignored `build/desktop` source evidence was absent in the isolated worktree; the same command passed from the main workspace with existing evidence, reporting refresh command count `6`, operator completion brief ready, source privacy boundary ready, release-channel metadata blocked `yes`, cleared `no`, 0/4 ready rows, 4/4 placeholders, current 10-plan progress `1241-1250: 9/10`, completion `99.999999%`, remaining `0.000001%`, no private values, and no external distribution claim. |
| 2026-07-01 | review_judge | Reviewed the docs and QA expectation diff; no blocking findings remain. |
| 2026-07-01 | quality_runner | After moving the plan to completed, confirmed active plans are empty, completed-plan file progress is `1241-1250: 10/10`, 10-plan report due is `true`, latest completed plan is `plan-1250`, and reran `npm run qa` plus `git diff --check` successfully. |
