# plan-1346-current-blocker-placeholder-receipt

## Goal

Make the release current-blocker and completion summary surface the value-free placeholder private-input receipt from plan-1345, so the real operator state shows that the ignored private input file is present but still has four placeholder values before any apply command is attempted.

## Scope

- Integrate the release-channel placeholder input receipt into the current-blocker evidence without recording private release URLs, channel values, credentials, tokens, or local env values.
- Ensure current-blocker and completion summary readouts distinguish process env missing inputs from private input file placeholder inputs.
- Add or update smoke coverage and documentation so the operator can see the correct next command path from the current blocker.
- Verify the newly attached Squirrel DYLD crash report against the existing crash-report/package dependency guards; add code only if the current guard no longer covers that stale worktree bundle class.

## Non-Goals

- Do not edit `.env.distribution.local`, `.env.release-channel.local`, release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identities, or real user audio.
- Do not run remote distribution probes, release uploads, update-feed publishing, Apple notarization, Developer ID signing, or the final external hard gate.
- Do not claim auto-update, signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.

## Validation

- [x] `npm run release:channel-placeholder-input-receipt`
- [x] `npm run desktop:crash-report-regression-smoke`
- [x] `npm run desktop:package-smoke`
- [x] `npm run release:current-blocker-smoke`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:completion-summary-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`
- [x] `npm run verify`

## Decision Log

- 2026-07-04: Created after plan-1345 added the value-free placeholder input receipt. Root main now shows the real blocker as four placeholder release-channel metadata values, but current-blocker still emphasizes process env missing rows more than the private input file placeholder receipt.
- 2026-07-04: Reviewed the newly attached macOS crash report. It is the same Squirrel `Namespace DYLD, Code 1, Library missing` stale worktree bundle class already modeled by the current crash-report regression smoke and package dependency guard, so this plan will verify that coverage while keeping implementation focused on the release current-blocker receipt.
- 2026-07-04: Integrated the real `release:channel-placeholder-input-receipt` artifact into current-blocker, progress-refresh completion summary source, completion-summary smoke, and completion-summary-refresh smoke with value-free mode/count/next-command fields.
- 2026-07-04: Updated `verify` so the real placeholder input receipt runs immediately after its smoke and before distribution private-input checks, giving later current-blocker/summary reports a concrete receipt to read.
- 2026-07-04: Full verification passed. Crash regression classified the Squirrel stale-worktree DYLD report class, and package/project-IO/ad-hoc/DMG/PKG/install smokes continued to prove Squirrel framework dependencies as present, code-signed, signature-compatible, and dyld-loadable.
