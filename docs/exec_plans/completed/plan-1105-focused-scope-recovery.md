# plan-1105-focused-scope-recovery

## Goal

Make Quick Actions empty-result recovery prefer the best focused workstation scope before falling back to All, so beginners and working producers are guided to Guide, Create, Sound, Arrange, Mix, Finish, Deliver, Project, or Export instead of being pushed back to the broad command list when a search misses inside the current scope.

## Scope

- Update Quick Actions search recovery suggestion ranking to prefer non-All scopes with matching commands.
- Keep All as a fallback only when no focused scope matches.
- Preserve search matching, scope counts, command execution, Spotlight Enter behavior, pinned/recent commands, project data, playback, export output, remote behavior, and sampling scope.
- Update README/product/quality/harness expectations for focused scope recovery.

## Out of Scope

- New commands or command execution behavior.
- New audio, MIDI, project schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.
- Reworking Quick Actions search tokenization or scope count derivation.

## Plan

1. Inspect current Quick Actions search recovery derivation and docs coverage.
2. Add focused-scope ranking for recovery suggestions.
3. Update user-facing docs and QA expectations.
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
| 2026-06-29 | Prefer focused recovery scopes over All. | The expanded scope set is useful only if empty-result recovery points users toward the most relevant workstation area instead of the broad command list. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Updated Quick Actions no-match recovery to prefer matching focused scopes before All fallback and added docs/QA expectations. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks; all passed. |
