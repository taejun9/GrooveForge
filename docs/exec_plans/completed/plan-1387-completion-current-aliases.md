# plan-1387-completion-current-aliases

## Goal

Add explicit `currentFirstBlocker` and `currentNextCommand` aliases to the top-level release completion summary refresh evidence so automated and human operators can read the current blocker using the same field names as the external run and resume packets.

## Scope

- Mirror `firstBlocker` and `nextCommand` into `currentFirstBlocker` and `currentNextCommand` in `npm run release:completion-summary-refresh-smoke`.
- Keep existing `firstBlocker` and `nextCommand` fields for compatibility.
- Update QA guards and durable docs for the alias contract.
- Run focused release checks plus the required real Electron screen smoke.

## Non-Goals

- Do not edit `.env.release-channel.local` or `.env.distribution.local`.
- Do not invent or record release URLs, support URLs, channel values, credentials, tokens, Developer ID identities, local env values, or private audio.
- Do not upload releases, publish feeds, probe distribution channels, sign artifacts, submit to Apple notarization, or claim external distribution completion.

## Constraints

- Work on `codex/plan-1387-completion-current-aliases` in `.worktree/plan-1387-completion-current-aliases`.
- Keep all completion evidence value-free.
- QA and review are separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Confirm the alias gap in current main evidence.
- [x] Add completion-summary-refresh current blocker aliases and self-checks.
- [x] Update QA/docs guards.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `npm run release:source-evidence-prereq-smoke`
- `git diff --check`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Add aliases rather than renaming existing fields so current completion reports stay backward-compatible while matching external run/resume packet field names. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | quality_runner | Confirmed `main` is clean, no active plan exists, and latest completion summary refresh reports plan-1386, `1381-1390: 6/10`, 99.999999% completion, and setup wizard handoff rows, but `currentFirstBlocker` is absent while `firstBlocker` carries the current blocker. |
| 2026-07-05 | harness_builder | Mirrored `firstBlocker`/`nextCommand` into `currentFirstBlocker`/`currentNextCommand`, added alias self-checks, updated QA expectations, and documented the field contract. |
| 2026-07-05 | quality_runner | `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`, `npm run qa`, `git diff --check`, and `npm run build` passed in the plan worktree. |
| 2026-07-05 | quality_runner | `npm run desktop:launch-smoke` passed against the live production Electron app screen, including beginner, producer, Quick Actions, Command Reference, and workstation route evidence. |
| 2026-07-05 | quality_runner | `npm run release:source-evidence-prereq-smoke` passed in the isolated plan worktree; `npm run release:completion-summary-refresh-smoke` failed before the changed alias code because ignored source release evidence is absent there, so full completion refresh remains a post-merge main verification step. |
