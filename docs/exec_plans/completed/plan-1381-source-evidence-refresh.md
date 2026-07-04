# plan-1381-source-evidence-refresh

## Goal

Add a value-free source evidence prerequisite packet so the remaining external release proof can identify missing source artifacts and their refresh commands without running the heavy release gate, recording private values, or claiming external distribution.

## Scope

- Add `npm run release:source-evidence-prereq-smoke`.
- Report the external proof bundle's source artifact set, present/missing counts, command rows, and prerequisite notes.
- Keep the current release-channel private input blocker visible without recording private URL/channel values.
- Update package scripts, docs, and QA guards.
- Run focused QA plus actual Electron launch smoke before reporting completion.

## Non-Goals

- Do not write or infer real release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identities, or private audio.
- Do not edit `.env.release-channel.local` or `.env.distribution.local`.
- Do not run notarization, signing, uploads, update publishing, distribution-channel probes, or the hard external gate.
- Do not replace `npm run release:check`, `npm run verify`, or the operator-owned private metadata edit.

## Constraints

- Work on `codex/plan-1381-source-evidence-refresh` in `.worktree/plan-1381-source-evidence-refresh`.
- Keep release evidence value-free.
- QA and review are separate loops.
- Actual app behavior must be verified with `npm run desktop:launch-smoke`.

## Implementation Plan

- [x] Inspect existing external proof/source evidence artifacts.
- [x] Add source evidence prerequisite smoke and artifact validation.
- [x] Update scripts, docs, and QA guards.
- [x] Run QA plus actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_source_evidence_prereq_smoke.mjs`
- `npm run qa`
- `npm run release:source-evidence-prereq-smoke`
- `npm run build`
- `npm run desktop:launch-smoke`
- `git diff --check`
- `npm run release:completion-summary-refresh-smoke`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Add a source evidence prerequisite packet because completion refresh now exposes the release-channel private placeholder blocker clearly, but external proof still reports missing source artifacts; the operator needs a narrow value-free map before rerunning heavier release evidence. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | project_lead | Started plan-1381 from clean main after plan-1380. Current completion is `99.999999%`; current 10-plan progress is `1371-1380: 10/10`; current blocker is four release-channel metadata placeholders in `.env.release-channel.local`. |
| 2026-07-05 | harness_builder | Added `npm run release:source-evidence-prereq-smoke` to write a value-free map for the 21 external proof source artifacts, missing artifact refresh commands, prerequisite notes, current operator first command, strict proof command, and current private input placeholder locations without running heavy release operations. |
| 2026-07-05 | quality_runner | Passed `node --check harness/scripts/run_release_source_evidence_prereq_smoke.mjs`, `npm run qa`, `npm run release:source-evidence-prereq-smoke`, `npm run build`, approved-GUI `npm run desktop:launch-smoke`, and `git diff --check`. |
| 2026-07-05 | quality_runner | Reserved `npm run release:completion-summary-refresh-smoke` for the post-merge main worktree so it reads the maintained ignored release evidence and reports the final after-work completion percentage. |
