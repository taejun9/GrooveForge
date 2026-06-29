# plan-1109-quick-actions-recovery-reference-handoff

## Goal

Let users recover from a failed Quick Actions search by opening Command Reference directly, so beginners can inspect command meanings or Beat Terms and working producers can jump to the command map without closing and hunting through menus.

## Scope

- Add an explicit Command Reference handoff control to the Quick Actions no-match recovery card.
- Route the handoff only through the existing Command Reference open path.
- Close Quick Actions when Command Reference opens, preserving existing overlay behavior.
- Preserve Quick Actions query/scope recovery, search hints, pins, recents, command ordering, command execution, Command Reference filters/search, project data, playback, export output, remote behavior, and sampling scope.
- Update README/product/quality/harness expectations.

## Out of Scope

- Running a command from the recovery card.
- Pre-filling Command Reference search from the failed Quick Actions query.
- New commands, command ranking, project edits, audio, MIDI, schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.

## Plan

1. Inspect current Quick Actions no-match recovery wiring.
2. Add the recovery-card Command Reference handoff control.
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
| 2026-06-29 | Add recovery-to-reference handoff, not contextual command execution or search prefill. | Failed command search should help users understand the command map while keeping Command Reference read-only and Quick Actions execution explicit. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added a Command Reference handoff button to the Quick Actions no-match recovery card through the existing open-reference path. |
| 2026-06-29 | repo_cartographer | Updated README, product, quality, and QA expectations for recovery-to-reference behavior. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
