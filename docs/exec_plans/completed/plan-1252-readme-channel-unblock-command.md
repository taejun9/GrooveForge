# plan-1252-readme-channel-unblock-command

## Status

completed

## Owner

repo_cartographer / quality_runner

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사용자 모두 사용할 수 있도록 앱 제작을 완료하고, 작업이 끝날 때마다 전체 기준 완성도를 알려준다.

## Goal

Align the public README release command map with the current release proof scripts by adding the value-free release-channel unblock smoke command that proves the current placeholder blocker can clear without recording private values.

## Non-Goals

- Do not record, infer, invent, or commit release/support/feed/channel/credential values.
- Do not modify `.env.distribution.local`.
- Do not run network probes, publish update feeds, upload releases, sign artifacts, submit to Apple, approve manual QA, or submit to an app store.
- Do not claim external distribution, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA completion, or app-store submission.

## Context Map

- `README.md` is the public entry point and currently omits `npm run release:channel-unblock-smoke` from its command map.
- `docs/release/readiness.md`, `docs/architecture/harness.md`, and `docs/quality/rules.md` already mention all current release scripts.
- The missing README command is directly relevant to the remaining release-channel placeholder blocker because it proves the blocker can clear with shape-ready local values while keeping values redacted.
- Current completion remains `99.999999%` with `0.000001%` pending external/private distribution proof.

## Constraints

- QA and review are separate loops.
- Keep README wording value-free and non-claiming.
- Update this plan when scope or approach changes.

## Implementation Plan

- [x] Add `npm run release:channel-unblock-smoke` to the README release command map in the release-channel setup area.
- [x] Strengthen QA expectations so README coverage catches the public entry point omission.
- [x] Run focused quality checks.
- [x] Complete review, move this plan to completed, create the review mirror, and refresh progress evidence for `1251-1260: 2/10`.

## QA Plan

- `npm run qa`
- `git diff --check`
- Direct README release-script coverage check against `package.json`
- `npm run release:progress-refresh-smoke` after merge from main, using existing ignored release evidence

## Review Plan

QA completes before review starts. Review verifies that README command coverage matches current release scripts, keeps the unblock smoke as value-free rehearsal evidence, and does not claim external distribution completion.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Patch README release-channel unblock command coverage as plan-1252. | README was the only checked public doc still missing one current release script, and that script is relevant to the final private metadata blocker. |
| 2026-07-01 | Align release readiness wording with the new README expectation. | QA now checks the exact value-free unblock wording in both public docs, so the durable release matrix should match the public command map. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Plan created on `codex/plan-1252-readme-channel-unblock-command` after comparing current release scripts against README and finding `release:channel-unblock-smoke` missing. |
| 2026-07-01 | repo_cartographer | Added `npm run release:channel-unblock-smoke` to the README release command map and described its synthetic, value-free blocker-clearance rehearsal. |
| 2026-07-01 | repo_cartographer | Aligned `docs/release/readiness.md` wording for the same unblock smoke and updated QA text expectations to lock the public entry point coverage. |
| 2026-07-01 | quality_runner | Passed direct release-script coverage check across README, release readiness, harness architecture, and quality rules, plus `npm run qa` and `git diff --check`. |
| 2026-07-01 | review_judge | Reviewed README, release readiness, and QA expectation changes; no blocking findings remain. |
