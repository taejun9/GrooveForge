# plan-1466-transport-playback-clarity review

## Outcome

Approved after one focused correction. No blocking, major, or moderate findings remain.

## Scope Reviewed

- Complete two-line Play/Stop copy for Song, Block, Turn, and Pattern loop targets.
- State-aware accessible names and titles containing the next action, exact target or length, and current BPM.
- Preservation of the native primary button, test id, icons, Space shortcut, boolean pressed state, focus behavior, `togglePlayback`, realtime scheduler, loop selection, snapshots, position readout, project data, and exports.
- The shared Workspace Command Dock accessibility context without expanding its compact one-line presentation.
- Header and supported-minimum dimensions, readability, containment, focusability, and zero horizontal overflow.
- Deterministic native grid-key post-Undo evidence, Audience Starter timeout diagnostics, and parent/app launch-smoke timeout ordering.
- Renderer, Browser, production Electron, QA, packaging, install, project-I/O, privacy, and release-readiness regression evidence.

## Evidence

- The clean-main Browser baseline at 1280x720 measured a 79x38px direct button that exposed only generic `Play`, pressed false, and `Play song loop (Space)`, while the exact loop target and BPM lived in adjacent controls.
- The accepted Browser pass kept the compact Transport at 298px and document overflow at 0px. It measured a readable 112x38px Play control and proved exact Song, Block, Turn, and Pattern target/length/BPM names and titles. Native Play changed to focused `Stop / Song · 8 bars` with pressed true; native Stop restored focused `Play / Song · 8 bars`, pressed false, and `Cued Song`. Browser warning/error logs were empty.
- Production Electron measured the Beginner header control at 112x38px and the supported 1180px control at 132.75x38px with zero internal or document overflow. It confirmed complete state copy, name/title, focus, pressed state, Command Dock parity, modal focus, and visual evidence.
- Full `npm run verify` exited 0 and generated/reopened real mix and four-stem WAV packages, covered all 14 styles, native project IO, source/packaged/ad-hoc/PKG-payload/installed Electron launches, DMG/PKG assembly, privacy/value-leak protections, and bounded external-distribution blockers.
- The review correction restored the unrelated Tempo Nudge container's existing 104px width/min-width contract. Follow-up `git diff --check`, renderer smoke, typecheck, `npm run qa`, production build, and production Electron launch smoke all passed; Electron again reported the 112x38px Play control, readable 132.75x38px minimum-window control, contained Tempo Nudge pads, and zero minimum-window overflow.

## Review Notes

The implementation derives a presentation-only model from mounted playback state, loop scope, selected arrangement or transition target, selected Pattern, arrangement length, and project BPM. It does not create another transport state source or alter playback behavior. The dock and header reuse the same complete accessible context while retaining their distinct visual densities.

Full verification exposed two QA reliability issues that could hide healthy UI behavior under load. Native grid tests now use Right/Down/Enter/Space for the behavior under test and capture renderer state directly after each native Undo rather than sending an unrelated Escape key. The launch-smoke app budget is 30 minutes and the parent waits 20 seconds longer, which covers the sequential keyboard, starter, modal, command-reference, and visual step budgets while preserving structured failures.

The separate review found one unrelated style drift where Tempo Nudge kept a 104px width and flex basis but had acquired a 112px minimum. Restoring the original 104px value kept the Transport-specific 112px rule isolated and removed an internal CSS contradiction before approval.

## Residual Risks

- Localization or substantially longer section, Pattern, or action vocabulary should be remeasured at 1280px and the supported 1180px minimum.
- A future command-strip density change should retain the 112px readable header control, the existing compact Dock posture, and zero-overflow evidence.
- External Developer ID signing, notarization, publishing, private release metadata, and manual distribution approval remain intentionally absent and are not claimed by this plan.
