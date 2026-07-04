# plan-1383-source-refresh-dmg-retention Review

## Verdict

Pass. The fix keeps `npm run release:source-evidence-refresh-smoke` from deleting the release manifest DMG that follow-up update metadata artifact checks need.

## Scope Reviewed

- Removed the generated release DMG from the source evidence refresh cleanup list after installed project IO.
- Kept cleanup for heavy payload/install intermediate directories and packaged app/PKG copies.
- Added `releaseManifestDmgRetained` and `releaseManifestDmgPath` to the refresh receipt and validation.
- Updated source prerequisite reporting so stale existing completion summaries cannot override the current completed-plan 10-plan progress.
- Updated README, release readiness docs, harness architecture, quality rules, and QA text expectations so the retained DMG contract is explicit.

## QA Reviewed

- `node --check harness/scripts/run_release_source_evidence_refresh_smoke.mjs` passed.
- `npm run qa` passed.
- `npm run release:source-evidence-refresh-smoke` passed with `21/21` source artifacts, zero missing rows, and `Release manifest DMG retained: yes`.
- `npm run release:completion-summary-refresh-smoke` passed in the same worktree, proving the update metadata artifact path no longer fails after source evidence refresh.
- `npm run release:source-evidence-prereq-smoke` passed after moving the plan to completed and reported latest completed plan `plan-1383` with `1381-1390: 3/10`.
- `git diff --check` passed.

## Residual Risk

The retained DMG increases ignored build disk usage, but payload copies, install directories, packaged app, and PKG copies are still cleaned. External distribution remains blocked until operator-owned release-channel metadata and downstream signing/notarization/update-feed/manual-QA proofs are supplied.

## Follow-Up

After merge, rerun source evidence refresh and completion summary refresh on `main` so the final report reads the main worktree's private placeholder evidence and latest completed-plan count.
