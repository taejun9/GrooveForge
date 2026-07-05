# plan-1388-source-prereq-current-aliases

## Goal

Expose the same `currentFirstBlocker` and `currentNextCommand` top-level aliases in the release source evidence prerequisite smoke that the completion summary refresh now provides, so operators and restart tooling can read the current blocker fields consistently before heavier release evidence is refreshed.

## Scope

- Mirror the prerequisite packet's current blocker and current next command into `currentFirstBlocker` and `currentNextCommand`.
- Preserve existing fields for compatibility.
- Add self-checks, console/Markdown readout, QA expectations, and durable docs.
- Run focused release checks plus the required real Electron screen smoke.

## Non-Goals

- Do not edit `.env.release-channel.local` or `.env.distribution.local`.
- Do not invent or record release URLs, support URLs, channel values, credentials, tokens, Developer ID identities, local env values, or private audio.
- Do not upload releases, publish feeds, probe distribution channels, sign artifacts, submit to Apple notarization, or claim external distribution completion.

## Constraints

- Work on `codex/plan-1388-source-prereq-current-aliases` in `.worktree/plan-1388-source-prereq-current-aliases`.
- Keep all prerequisite evidence value-free.
- QA and review are separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Confirm the current completion/source evidence state on main.
- [x] Add source-evidence prerequisite current aliases and self-checks.
- [x] Update QA/docs guards.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_source_evidence_prereq_smoke.mjs`
- `npm run release:source-evidence-prereq-smoke`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Extend the current-field alias contract to the lightweight prerequisite smoke instead of changing private release metadata, because the remaining values are user-owned but the handoff evidence can still become more consistent. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | quality_runner | Confirmed `main` is clean, no active plan exists, and latest completion summary refresh reports plan-1387, `1381-1390: 7/10`, 99.999999% completion, `currentFirstBlocker`/`currentNextCommand` aliases, and zero stale/missing artifacts. |
| 2026-07-05 | harness_builder | Added source-evidence prerequisite `currentFirstBlocker`/`currentNextCommand` aliases, value-free fallback current blocker text for source-missing contexts, Markdown/console output, and alias self-checks. |
| 2026-07-05 | doc_gardener | Updated README, release readiness, harness architecture, quality rules, and QA text expectations for the source prerequisite alias contract. |
| 2026-07-05 | quality_runner | `node --check harness/scripts/run_release_source_evidence_prereq_smoke.mjs`, `npm run release:source-evidence-prereq-smoke`, `npm run qa`, `git diff --check`, and `npm run build` passed in the plan worktree. |
| 2026-07-05 | quality_runner | `npm run desktop:launch-smoke` passed against the live production Electron app screen, including beginner, producer, Quick Actions, Command Reference, and workstation route evidence. |
