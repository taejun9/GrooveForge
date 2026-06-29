# plan-1104-quick-action-scope-coverage

## Goal

Make Quick Actions scope filters cover the same major workstation areas that beginners and working producers see in Command Reference, so Guide, Create, Sound, Finish, and Deliver commands are directly filterable instead of being hidden under broad or missing scope buckets.

## Scope

- Add Quick Actions scope filter options for Guide, Create, Sound, Finish, and Deliver.
- Keep existing Transport, Compose, Arrange, Mix, Master, Project, and Export scopes working.
- Map existing Quick Action groups to the new scope filters without changing command execution, project data, playback, export output, remote behavior, or sampling scope.
- Update product/docs/QA expectations for the expanded scope filter coverage.

## Out of Scope

- New command execution behavior.
- New audio, MIDI, project schema, sampling, cloud, account, analytics, release signing, notarization, or external distribution behavior.
- Reworking Command Reference content beyond scope-filter coverage.

## Plan

1. Inspect current Quick Actions groups and scope matching.
2. Add missing scope filter definitions and matching behavior.
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
| 2026-06-29 | Expand Quick Actions scopes instead of adding another guide card. | Command Reference already exposes the workstation areas; matching scope filters improves discoverability for both first-time and fast producer workflows without changing project behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | repo_cartographer | Expanded Quick Actions scope definitions and docs/QA expectations to cover Guide, Create, Sound, Finish, and Deliver. |
| 2026-06-29 | quality_runner | Ran QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks; all passed. |
