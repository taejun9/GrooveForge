# plan-1284-release-channel-setup-wizard

## Goal

Add a local-only, value-free release-channel setup wizard so the operator can apply the four private release-channel metadata values into the ignored distribution env without manual file editing, then run the existing proof chain.

## Scope

- Add a non-networked release-channel setup command that validates the current private metadata shape, writes only to the ignored local distribution env, and avoids echoing URL/channel/private values.
- Add deterministic smoke coverage using synthetic temp fixtures so CI can prove the wizard path without reading or modifying the real ignored env.
- Update release handoff/docs/QA expectations so the current blocker can recommend either direct process-env apply or the safer setup wizard, followed by the strict proof chain.
- Preserve release boundaries: no committed private values, no network probes, no signing, no Apple notary submission, no upload, and no external distribution completion claim.

## Validation

- `git diff --check`
- `node --check` for changed JavaScript harness files.
- `npm run qa`
- Focused release-channel setup wizard smoke.
- `npm run release:channel-edit-packet-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `npm run release:proof-bundle-smoke`
- `npm run release:progress-smoke`
- `npm run release:current-blocker`
- `npm run verify`

## Decision Log

- 2026-07-02: Started after `plan-1283` fixed stale handoff language and package launch guards. The remaining current blocker is still operator-owned private release-channel metadata, so the next useful step is to reduce the chance of unsafe manual edits while keeping the repository value-free.
- 2026-07-02: Added `release:channel-setup-wizard` and a deterministic success smoke, wired the success smoke into `verify`, and updated release docs/QA/edit/completion packets to surface the guided local-only setup path.
- 2026-07-02: Fixed the attached runtime report chain where proof bundle/progress/current-blocker treated the missing ignored env setup state as if strict private metadata proof should already match; the reports now mirror `release:prepare-env` until placeholder replacement is the current action.
- 2026-07-02: Fixed update-feed checkpoint mirrors in progress/current-blocker so missing-local-env real branches can report zero placeholder locations while synthetic success remains strict and value-free.
- 2026-07-02: Fixed operator/completion summary report wrappers so a missing ignored env file is reported as setup-needed with zero placeholder locations, while placeholder replacement still requires strict private proof.

## Completion

- Completed 2026-07-02.
- Added a local-only setup wizard for release-channel metadata that creates the ignored env when needed, applies private values without echoing them, and runs the strict live check after successful setup.
- Added value-free success smoke coverage using synthetic fixtures, with no real local env read/modify and no private URL/channel values recorded.
- Updated release handoff docs, quality rules, package scripts, edit packets, completion report packets, proof bundle, progress report, current blocker, and static QA contracts.
- Updated operator/completion summary refresh smokes so after-work reports no longer fail when the ignored env file has not been created yet.
- Validation passed through focused smokes, `npm run qa`, `git diff --check`, and full `npm run verify`.
