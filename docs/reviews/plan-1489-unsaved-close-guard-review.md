# plan-1489-unsaved-close-guard review

## Verdict

Approved. No blocking, major, or moderate findings remain after final-code QA, separate review, a full release check, and post-package sample regeneration.

## Reviewed Scope

- Renderer dirty state, recovery-only startup state, focused Limiter draft resolution, synchronous local recovery refresh, and browser `beforeunload` behavior.
- Electron `will-prevent-unload`, native dialog choices, default/cancel behavior, and the inverted allow-unload `preventDefault()` contract.
- Existing Save/Open, async Save completion, local draft lifecycle, smoke teardown, project schema, audio rendering, local-first privacy, and composition-first boundaries.

## Findings and Resolutions

Separate review confirmed:

1. A clean project does not cancel unload or write a draft.
2. Dirty, recovery-only, and combined states all cancel unload until the user makes an explicit close choice.
3. Dirty state writes the exact current immutable project ref synchronously before the decision; recovery-only state preserves its existing record instead of overwriting it with the starter project.
4. A focused Limiter value is resolved before dirty-state evaluation and recovery writing, so a last unblurred edit is not omitted.
5. Electron defaults and Escape both keep editing. Only `Close without a project file` calls `preventDefault()` on `will-prevent-unload`, which Electron defines as allowing the unload.
6. Existing launch and project-I/O smoke teardown stays noninteractive through `app.exit` or process termination.
7. No project schema, musical-event, render, remote-service, account, analytics, or sampling-first behavior changed.

## QA Evidence

- `npm run typecheck`: passed.
- `npm run qa`: passed.
- `npm run harness:smoke`: passed 4/4 close states, 3/3 protected states, and 2/2 synchronous dirty-draft refresh states alongside 30/30 project roundtrips.
- `npm run renderer:smoke`: passed renderer registration/cleanup, current-ref write, focused draft resolution, browser cancellation, native copy, default/cancel, and explicit allow-unload source checks.
- `npm run workflow:smoke`: passed beginner and producer composition, save/load, export analysis, MIDI, and Handoff workflows.
- `npm run persona:smoke`: passed first-time composer and professional producer readiness, 14/14 styles, delivery packages, reopen, and acceptance evidence.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run build`: passed.
- Approved real-macOS `npm run desktop:launch-smoke`: passed 104 required renderer ids, minimum window, input, focus, visual, and noninteractive teardown evidence.
- `npm run sample-audio:qa`: schema 17 passed 41/41 playable WAVs, 41/41 digital-zero endings, 33/33 full-mix tails, and 11/11 isolation checks.
- `npm run release:check`: exited 0 after live Electron, native/packaged/PKG payload/installed project I/O, DMG/PKG, signing-truth, privacy, and release-readiness checks.
- `git diff --check`: passed.

## Sample Evidence

- `beginner-guided-lofi/grooveforge-beginner-sample-beat-demo.wav`: 23.37 seconds, peak -4.44 dBFS, RMS -21.86 dBFS, SHA-256 `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318`.
- `professional-studio-house/grooveforge-professional-sample-beat-demo.wav`: 51.07 seconds, peak -3.32 dBFS, RMS -20.10 dBFS, SHA-256 `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`.

The close guard is renderer/Electron lifecycle code and adds no sample artifact. Final post-package regeneration reproduced the established audience hashes and complete 41-WAV matrix.

## Residual Boundaries

- Automated decision and source-order checks plus production launch smoke do not replace a human clicking both choices in the native unsaved-close dialog on every supported desktop platform.
- Closing without a project file is intentionally distinct from durable Save; renderer-local recovery remains a safety net and may be unavailable if browser storage itself fails.
- External distribution still requires private release-channel metadata, Developer ID signing, notarization/stapling, Gatekeeper acceptance, and manual approval; none is claimed by this plan.
