# plan-1184-release-channel-focus-next-actions

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Continue finishing GrooveForge for working producers and first-time composers, report completion after each completed work item, and report every 10 completed plans.

## Goal

Mirror the release doctor release-channel focus receipt into the external next-actions report so the operator-facing action list and current-blocker receipt agree on the same four metadata keys, current-ready count, placeholder count, proof command, rerun command, and value-free posture.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, synthetic, or private values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.

## Context Map

- `harness/scripts/run_release_next_actions.mjs` writes the prioritized external next-actions report.
- `harness/scripts/run_release_doctor.mjs` emits the release-channel focus receipt.
- `harness/scripts/run_release_current_blocker_smoke.mjs` already mirrors that focus receipt.
- `harness/scripts/run_qa.py` guards script/doc contract strings.
- `docs/release/readiness.md`, `docs/architecture/harness.md`, and `docs/quality/rules.md` describe the release operator loop.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Mirror release doctor focus receipt fields into external next-actions JSON, Markdown, and console output.
- [x] Validate the mirrored rows match release doctor exactly, cover the four release-channel metadata keys, and record no values.
- [x] Validate current-ready and placeholder counts against the current next-actions blocker state.
- [x] Update QA expectations and durable release/harness docs.

## QA Plan

- `node --check harness/scripts/run_release_next_actions.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:doctor`
- `npm run release:external-preflight`
- `npm run release:next-actions-smoke`
- direct JSON mirror check for release doctor, external next-actions, and current-blocker release-channel focus rows
- `npm run release:proof-bundle-smoke`
- `npm run desktop:external-distribution-gate-smoke`
- `npm run release:progress-smoke`
- `npm run release:current-blocker-smoke`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Mirror release doctor focus receipt into next-actions evidence. | The next-actions report is the first operator-facing action list before proof-bundle/current-blocker receipts, so it should carry the same four-key focus proof as release doctor and current-blocker. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main confirmed `99.999999%` completion, `1181-1190: 3/10` 10-plan progress, and release-channel focus receipt present in release doctor/current-blocker but not in external next-actions. |
| 2026-06-30 | harness_builder | Added value-free release-channel focus receipt mirroring to external next-actions JSON, Markdown, console output, and self-validation. |
| 2026-06-30 | quality_runner | Pre-completion QA passed: syntax check, repo QA, diff check, release doctor, external preflight, next-actions smoke, proof-bundle smoke, external distribution gate smoke, progress smoke, current-blocker smoke, and direct JSON mirror comparison. |

## Completion Notes

- External next-actions now mirrors release doctor release-channel focus receipt rows exactly.
- The mirrored receipt remains value-free and records no release URL, support URL, feed URL, channel value, credential, token, identity, or private value.
- The current external blocker remains `.env.distribution.local:10-13`, where the four release-channel metadata placeholders still need real private values before release completion can be claimed.
