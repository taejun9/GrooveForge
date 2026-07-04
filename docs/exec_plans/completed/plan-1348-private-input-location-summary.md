# plan-1348-private-input-location-summary

## Goal

Make the remaining release-channel placeholder blocker more directly actionable by carrying value-free `.env.release-channel.local` private-input file location summaries into the current blocker and completion summary readouts.

## Scope

- Summarize private-input file placeholder/missing/invalid-shape locations from `release:channel-placeholder-input-receipt` without recording values.
- Mirror those summaries into `release:current-blocker-smoke`, `release:progress-refresh-smoke`, `release:completion-summary-smoke`, and `release:completion-summary-refresh-smoke` JSON/Markdown/console output.
- Update QA and docs so after-work completion reports identify whether the operator should edit `.env.release-channel.local` line rows before preflight.

## Non-Goals

- Do not edit `.env.distribution.local`, `.env.release-channel.local`, release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identities, or real user audio.
- Do not run remote distribution probes, release uploads, update-feed publishing, Apple notarization, Developer ID signing, or the final external hard gate.
- Do not change the external distribution completion percentage or claim external distribution readiness.

## Validation

- [x] `npm run release:channel-placeholder-input-receipt`
- [x] `npm run desktop:crash-report-regression-smoke`
- [x] `npm run release:current-blocker-smoke`
- [x] `npm run release:progress-refresh-smoke`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:completion-summary-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`

## Decision Log

- 2026-07-04: Created after plan-1347 made placeholder-input receipt generation reliable. Main completion summary now reports the private input file mode/counts, but the top-level readout still does not expose the value-free private input file line rows that tell the operator exactly where the four placeholder inputs are.
- 2026-07-04: Reviewed the newly attached GrooveForge launch report. It is the same stale-worktree Squirrel `Namespace DYLD, Code 1, Library missing` class already covered by `desktop:crash-report-regression-smoke` and the Electron runtime framework dependency guard; this plan will rerun that smoke while keeping new code focused on blocker readout clarity.
- 2026-07-04: Added value-free private input file missing/placeholder/invalid location counts and summaries to current-blocker, progress-refresh, completion-summary, and completion-summary-refresh receipts. Worktree validation used the missing-private-input-file posture and confirmed four `.env.release-channel.local` missing location summaries without recording values.
- 2026-07-04: Full `npm run verify` passed before the focused validation checklist. The attached Squirrel DYLD stale-worktree crash report stayed classified, and package/project-IO/ad-hoc/DMG/PKG/install paths again proved Electron runtime framework dependencies as present, code-signed, signature-compatible, and dyld-loadable.
