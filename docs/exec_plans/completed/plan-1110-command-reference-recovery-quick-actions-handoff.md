# plan-1110-command-reference-recovery-quick-actions-handoff

## Goal

Let users recover from a failed Command Reference search by opening Quick Actions directly, so beginners can move from command-map lookup back to explicit beat-making actions and working producers can resume command execution without closing the reference panel manually.

## Scope

- Add an explicit Quick Actions handoff control to the Command Reference no-result recovery card.
- Route the handoff only through the existing Quick Actions open-palette path.
- Close Command Reference when Quick Actions opens, preserving existing overlay behavior.
- Preserve Command Reference search, section recovery, Show All, Search Spotlight, command-map content, Quick Actions search/scope reset behavior, command execution, project data, playback, export output, remote behavior, and sampling scope.
- Update README/product/quality/harness expectations.

## Out of Scope

- Running a command from Command Reference.
- Pre-filling Quick Actions search from Command Reference search.
- New commands, command ranking, project edits, audio, MIDI, schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.

## Plan

1. Inspect current Command Reference no-result recovery wiring.
2. Add the recovery-card Quick Actions handoff control.
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
| 2026-06-29 | Add recovery-to-palette handoff, not command execution or search prefill. | Command Reference should remain read-only while failed lookup can still lead users back to explicit Quick Actions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added a Quick Actions handoff button to Command Reference no-result recovery through the existing open-palette path. |
| 2026-06-29 | repo_cartographer | Updated README, product, quality, and QA expectations for recovery-to-palette behavior. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
