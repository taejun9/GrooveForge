# plan-1383-source-refresh-dmg-retention

## Goal

Fix the source evidence refresh cleanup so `npm run release:source-evidence-refresh-smoke` leaves the release manifest DMG available for the follow-up completion summary refresh and update metadata artifact checks.

## Scope

- Keep the generated release DMG after install/project-IO smoke cleanup.
- Keep generated intermediate directory cleanup for package payload and install mount/output paths.
- Keep source prerequisite 10-plan progress aligned with current completed plan files when an existing completion summary is stale.
- Update release source evidence refresh docs and QA guards if needed.
- Rerun focused QA and the after-work completion summary refresh.

## Non-Goals

- Do not write or infer real release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identities, or private audio.
- Do not edit ignored private env files.
- Do not upload releases, publish update feeds, probe distribution channels, submit to Apple notarization, or claim external distribution completion.

## Constraints

- Work on `codex/plan-1383-source-refresh-dmg-retention` in `.worktree/plan-1383-source-refresh-dmg-retention`.
- Keep release evidence value-free.
- QA and review are separate loops.
- Actual app behavior remains covered by the plan-1382 `npm run desktop:launch-smoke` run and the source refresh package/install app execution path.

## Implementation Plan

- [x] Reproduce/identify the failing completion-summary path.
- [x] Remove only the problematic DMG cleanup from source evidence refresh.
- [x] Update docs/QA text to clarify DMG retention.
- [x] Run focused QA and completion summary refresh.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_release_source_evidence_refresh_smoke.mjs`
- `npm run qa`
- `npm run release:source-evidence-refresh-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Add a follow-up plan because main completion summary refresh failed after plan-1382: `desktop:update-metadata-artifacts-smoke` needs the release manifest DMG, but the new refresh chain had deleted that DMG during install cleanup. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | quality_runner | Main `npm run release:completion-summary-refresh-smoke` failed after source evidence refresh with `release manifest DMG path should exist before update metadata artifact smoke`, proving the cleanup was too aggressive. |
| 2026-07-05 | harness_builder | Removed the release manifest DMG from source evidence refresh cleanup, kept install and payload intermediate cleanup, and added `releaseManifestDmgRetained` validation plus README/release/harness/quality documentation. |
| 2026-07-05 | quality_runner | Passed `node --check harness/scripts/run_release_source_evidence_refresh_smoke.mjs`, `npm run qa`, `npm run release:source-evidence-refresh-smoke`, `npm run release:completion-summary-refresh-smoke`, and `git diff --check` in the plan-1383 worktree. The source refresh reported `Release manifest DMG retained: yes`, `21/21` source artifacts, and zero missing artifacts. |
| 2026-07-05 | harness_builder | Fixed source prerequisite 10-plan fallback so stale existing completion summaries cannot report an older 10-plan count after the completed plan files advance. |
