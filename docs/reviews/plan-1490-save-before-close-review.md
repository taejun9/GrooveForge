# plan-1490-save-before-close review

## Summary

GrooveForge now offers `Save and close`, `Close without a project file`, and `Keep editing` when desktop close is blocked by unsaved work. The first unload remains blocked during asynchronous Save, and only an exact-current successful Save requests a second ordinary close through the same guard. Recovery-only startup stays open and resurfaces Restore/Clear instead of saving the unrelated visible starter.

## QA Evidence

- Typecheck, static QA, quality gate, runtime, renderer, desktop-entry, workflow, persona, build, and `git diff --check` passed.
- Runtime covers 4/4 dirty/recovery close states, 4/4 Save-before-close gates, 3/3 native actions, and 5/5 Save close outcomes.
- Real macOS Electron launch smoke passed with the existing 104 required test ids and full interaction/layout evidence.
- Sample-audio QA decoded 41/41 playable WAVs, verified 41/41 digital-zero endings, 33/33 full-mix tails, and 11/11 isolation checks. Beginner/professional SHA-256 values remained `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318` and `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`.
- Full `npm run release:check` exited 0 after live source, packaged, PKG-payload, and simulated-installed Electron/project-I/O coverage plus DMG/PKG, signing-truth, privacy, and release-evidence checks.

## Findings

No blocking, major, or moderate finding remains.

The pre-QA review found and fixed one data-loss edge: recovery-only startup must not Save the unrelated visible starter and clear the prior recovery record. The final four-state gate keeps that session open and makes Restore/Clear visible.

## Safety Review

- The preload close IPC calls ordinary `BrowserWindow.close()` and cannot force unload past the existing renderer/main guard.
- Unknown dialog choice ids resolve to `Keep editing`; only the explicit close-without-project-file action uses Electron's inverted `will-prevent-unload` override.
- Canceled, failed, stale, and changed-snapshot Save outcomes keep the window open.
- Synchronously mirrored dirty/recovery refs prevent a successful Save from being blocked by a stale React render on the second close.
- No project schema, render, sample, network, cloud, account, analytics, or private-data behavior changed.
- Electron documents that `quitAndInstall()` closes application windows before calling `app.quit()`, so updater-driven closure continues through this same protected window boundary: https://www.electronjs.org/docs/latest/api/auto-updater

## Residual Risk

The system-native warning's physical button click-through is not automated because launch smokes intentionally avoid destructive user-close dialogs. Choice resolution, command routing, Save outcomes, IPC source/built contracts, and the second guarded close are automated; final signed distribution manual QA should still exercise one native Save/cancel/close cycle on each supported operating system.

External distribution remains independently blocked by private release metadata, Developer ID signing, notarization, Gatekeeper, update-feed, and manual channel evidence; this plan makes no external distribution completion claim.
