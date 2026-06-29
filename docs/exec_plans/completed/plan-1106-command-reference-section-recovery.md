# plan-1106-command-reference-section-recovery

## Goal

Make Command Reference empty-search results recover to the best matching focused section before falling back to All, so beginners and working producers can find direct beat-making commands faster when the current section filter hides matching Guide, Create, Sound, Arrange, Mix, Finish, Deliver, Project, or Beat Terms entries.

## Scope

- Add UI-local Command Reference no-match recovery metadata for the current search/filter state.
- Prefer matching non-All sections over All when suggesting recovery.
- Add an explicit section-switch recovery button beside existing Clear Search and Show All controls.
- Preserve Command Reference filtering/search matching, Search Spotlight, Quick Actions execution, project data, playback, export output, remote behavior, and sampling scope.
- Update README/product/quality/harness expectations.

## Out of Scope

- New commands, shortcuts, or command execution behavior.
- New Quick Actions behavior.
- New audio, MIDI, project schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.
- Reworking Command Reference search tokenization or command-map content.

## Plan

1. Inspect current Command Reference search, filter, and empty-state behavior.
2. Add focused-section recovery derivation and UI control.
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
| 2026-06-29 | Add Command Reference section recovery instead of changing search matching. | The current command map already has focused sections; recovery should reveal matching sections without changing command content, ranking, or execution. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added Command Reference focused-section recovery, UI styling, docs, and QA expectations without changing command execution. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks; all passed. |
