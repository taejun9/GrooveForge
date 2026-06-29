# plan-1108-quick-actions-command-reference-handoff

## Goal

Let users move directly from Quick Actions back to Command Reference when they need to inspect command meanings, shortcuts, sections, or beat terms before running the next explicit beat-making action.

## Scope

- Add an explicit Quick Actions header handoff button that opens Command Reference.
- Route the handoff only through the existing Command Reference open path.
- Close Quick Actions when Command Reference opens, preserving existing overlay behavior.
- Preserve Quick Actions search, scope filters, pins, recents, result feedback, command ordering, Command Reference filtering/search/section recovery, project data, playback, export output, remote behavior, and sampling scope.
- Update README/product/quality/harness expectations.

## Out of Scope

- Running a command from the handoff.
- Pre-filling Command Reference search from Quick Actions.
- New commands, command ranking, project edits, audio, MIDI, schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.

## Plan

1. Inspect current Quick Actions and Command Reference open wiring.
2. Add the Quick Actions to Command Reference handoff control.
3. Update docs and QA expectations.
4. Run focused QA and relevant smokes.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Pass: `npm run qa`
- Pass: `npm run renderer:smoke`
- Pass: `npm run workflow:smoke`
- Pass: `npm run typecheck`
- Pass: `git diff --check`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add an open-reference handoff, not contextual command execution. | Quick Actions should remain the execution palette while Command Reference remains the read-only explanation map. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added a Quick Actions header handoff button that opens Command Reference through the existing open-reference path without running commands. |
| 2026-06-29 | repo_cartographer | Updated README, product, quality, and QA expectations for the read-only Quick Actions to Command Reference handoff. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
