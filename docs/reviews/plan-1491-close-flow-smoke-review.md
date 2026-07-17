# plan-1491-close-flow-smoke review

## Summary

GrooveForge now proves the production Save-before-close roundtrip in a real Electron process. A mounted renderer edits the live project title, becomes dirty, prevents the first close, routes the smoke-only Save choice through the validated renderer command and context-isolated preload bridge, writes the exact current project through the native file handler, and completes a second ordinary guarded close only after the saved bytes are durable.

## QA Evidence

- Static QA, quality gate, typecheck, production build, renderer, desktop-entry, runtime, workflow, persona, and `git diff --check` passed.
- The close-flow smoke passed with the exact ordered events `live-edit-ready`, `first-close-requested`, `first-close-prevented`, `smoke-save-choice`, `native-save-started`, `native-save-completed`, `renderer-close-request`, and `window-closed`; it verified one native write, the derived `close-flow-smoke-beat.grooveforge.json` name, exact edited-title bytes, and one second close request.
- Final-code launch coverage passed for source, packaged, ad-hoc-signed, extracted PKG payload, and simulated-installed apps. Packaged, PKG-payload, and installed project I/O also passed, together with DMG, PKG, and hardened-runtime readiness checks.
- The real source launch retained all 104 required test ids, modal focus, Command Reference handoff, keyboard, and 2880x1856 visual evidence.
- Sample-audio QA decoded 41/41 playable WAVs, verified 41/41 digital-zero endings, 33/33 full-mix tails, and 11/11 isolation checks. Beginner/professional SHA-256 values remained `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318` and `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`.
- The remaining Gatekeeper-to-external-completion evidence chain and final external completion resume packet exited 0 while correctly reporting that external distribution is still pending.

## Findings

No blocking, major, or moderate finding remains.

Three issues found during QA/review were fixed before this final review:

- A non-macOS automatic-quit race could end the smoke after window closure but before asynchronous saved-file evidence readback. Smoke-only app lifetime now remains active until the explicit evidence result exits.
- Existing hidden-window Command Reference readiness used animation-frame polling and short waits that could expire on a slow GUI host. Timer-based bounded polling and longer exact-condition waits preserve the assertions while removing host-speed flakiness.
- Four launch-bearing parent runners retained an obsolete 11-minute timeout although the child app allows 30 minutes. Their parent budgets now match the documented 30-minute-plus-20-second contract.

## Safety Review

- Normal desktop runs still use the system-native warning dialog; only the dedicated smoke mode substitutes the Save choice.
- The smoke does not bypass renderer `beforeunload`, Electron `will-prevent-unload`, the validated Save result, preload IPC, native file writing, or the second guarded close.
- Saved project bytes are parsed through the production project parser and must contain the exact live edit while preserving the sample-free 8-bar starter.
- Evidence is local and value-free. No private beats, real user audio, release URLs, credentials, tokens, or local environment values are recorded, and no network probe, upload, signing, or notarization is attempted.
- No project schema, render, sample, cloud, account, analytics, or user-facing close behavior changed.

## Residual Risk

The physical operating-system warning-button click is not automated; signed distribution manual QA should exercise the native Save, cancel, and close-without-save buttons on each supported operating system. This is the only close-flow boundary omitted by the new automation.

External distribution remains independently blocked by private release metadata, Developer ID signing, notarization, Gatekeeper acceptance, update-feed publication, and manual channel approval. This plan makes no external-distribution completion claim.
