# plan-1113-quick-actions-spotlight-reference-handoff

## Goal

Let users open Command Reference directly from the Quick Actions Search Spotlight, so beginners can inspect the command that Enter would run before executing it and working producers can verify command-map context without leaving the search flow.

## Scope

- Add an explicit Command Reference handoff control to the Quick Actions Search Spotlight.
- Route the handoff only through the existing Command Reference open path.
- Preserve Spotlight derivation, Enter execution target, Quick Actions search/scope state, command ordering, pinned/recent state, command execution, project data, playback, export output, remote behavior, and sampling scope.
- Keep the product posture focused on direct beat composition and command discoverability, not sample browsing, chopping, or sampler setup.
- Update README/product/quality/harness expectations.

## Out of Scope

- Running a command from Command Reference.
- Pre-filling Command Reference search from the Spotlight target.
- New commands, command ranking, project edits, audio, MIDI, schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.

## Plan

1. Inspect current Quick Actions Spotlight wiring.
2. Add the Spotlight Command Reference handoff control.
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
| 2026-06-29 | Add Spotlight-to-reference handoff, not command execution or search prefill. | Quick Actions Spotlight should keep Enter execution explicit while exposing read-only command-map context for the current top search target. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added a Reference handoff button to Quick Actions Search Spotlight through the existing Command Reference open path. |
| 2026-06-29 | repo_cartographer | Updated README, product, quality, and QA expectations for the Spotlight reference handoff. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
