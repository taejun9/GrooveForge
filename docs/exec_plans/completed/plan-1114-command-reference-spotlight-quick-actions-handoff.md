# plan-1114-command-reference-spotlight-quick-actions-handoff

## Goal

Let users open Quick Actions directly from the Command Reference Search Spotlight, so beginners can move from a read-only command explanation to explicit command execution and working producers can return to the command palette without using only the header handoff.

## Scope

- Add an explicit Quick Actions handoff control to the Command Reference Search Spotlight.
- Route the handoff only through the existing Quick Actions open path.
- Preserve Command Reference search/filter state semantics, Search Spotlight derivation, command-map rows, Beat Terms, header handoff, no-result recovery handoff, Quick Actions search/scope reset behavior, command execution, project data, playback, export output, remote behavior, and sampling scope.
- Keep the product posture focused on direct beat composition and command discoverability, not sample browsing, chopping, or sampler setup.
- Update README/product/quality/harness expectations.

## Out of Scope

- Running a command from Command Reference.
- Pre-filling Quick Actions search from the Command Reference Spotlight.
- New commands, command ranking, project edits, audio, MIDI, schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.

## Plan

1. Inspect current Command Reference Search Spotlight wiring.
2. Add the Spotlight Quick Actions handoff control.
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
| 2026-06-29 | Add Command Reference Spotlight-to-Quick Actions handoff, not command execution or search prefill. | Command Reference should stay read-only while the current spotlight explanation can lead users back to explicit Quick Actions execution. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added a Quick Actions handoff button to Command Reference Search Spotlight through the existing open-palette path. |
| 2026-06-29 | repo_cartographer | Updated README, product, quality, and QA expectations for the Spotlight-to-palette handoff. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
