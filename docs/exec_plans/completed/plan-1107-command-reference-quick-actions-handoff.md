# plan-1107-command-reference-quick-actions-handoff

## Goal

Let users move directly from Command Reference to Quick Actions after they find the relevant command-map area, so beginners can run the next explicit beat-making command without hunting for the palette and working producers can jump from reference lookup to command execution faster.

## Scope

- Add an explicit Command Reference header handoff button that opens Quick Actions.
- Route the handoff only through the existing Quick Actions open path.
- Close Command Reference when Quick Actions opens, preserving existing overlay behavior.
- Preserve Command Reference filtering/search/section recovery, Search Spotlight, command-map content, Quick Actions command ordering, project data, playback, export output, remote behavior, and sampling scope.
- Update README/product/quality/harness expectations.

## Out of Scope

- Running a command from Command Reference.
- Pre-filling Quick Actions search from Command Reference.
- New commands, command ranking, project edits, audio, MIDI, schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.

## Plan

1. Inspect current Command Reference and Quick Actions open wiring.
2. Add the Command Reference to Quick Actions handoff control.
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
| 2026-06-29 | Add an open-palette handoff, not command execution from reference rows. | Command Reference should remain read-only while reducing friction from lookup to explicit command execution. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added a Command Reference header handoff button that opens Quick Actions through the existing open-palette path without executing a command. |
| 2026-06-29 | repo_cartographer | Updated README, product, quality, and QA expectations for the read-only Command Reference to Quick Actions handoff. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
