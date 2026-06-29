# plan-1112-pinned-recent-reference-handoff

## Goal

Let users open Command Reference directly from inspected pinned and recent Quick Actions, so beginners can verify a saved or recently used command before running it and working producers can review command-map context while keeping fast command execution explicit.

## Scope

- Add explicit Command Reference handoff controls to the pinned-command inspector and recent-command inspector.
- Route both handoffs only through the existing Command Reference open path.
- Preserve pinned-command run/unpin/inspect behavior, recent-command rerun/inspect behavior, Quick Actions search/scope state, command execution, project data, playback, export output, remote behavior, and sampling scope.
- Keep the product posture focused on direct beat composition and command discoverability, not sample browsing, chopping, or sampler setup.
- Update README/product/quality/harness expectations.

## Out of Scope

- Running a command from Command Reference.
- Pre-filling Command Reference search from the pinned or recent inspectors.
- New commands, command ranking, project edits, audio, MIDI, schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.

## Plan

1. Inspect current pinned/recent inspector wiring.
2. Add pinned/recent inspector Command Reference handoff controls.
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
| 2026-06-29 | Add pinned/recent inspector-to-reference handoffs, not command execution or search prefill. | Quick Actions should keep command runs explicit while inspected saved/recent commands can expose read-only command-map context before users run them. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added Reference handoff buttons to inspected pinned and recent Quick Actions through the existing Command Reference open path. |
| 2026-06-29 | repo_cartographer | Updated README, product, quality, and QA expectations for pinned/recent inspector reference handoffs. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
