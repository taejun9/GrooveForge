# plan-1458-note-tool-clarity review

## Outcome

Approved with no blocking, major, or moderate findings after one scope-tightening review fix.

## Scope Reviewed

- Complete visible labels and stable action-specific accessible names for all ten selected-note controls.
- Component-local five-column by two-row narrow layout and preservation of the one-row wide scan.
- Preservation of existing icons, titles, disabled calculations, callbacks, action order, selection, note data, clipboard, audition, undo, playback, render, and export behavior.
- Renderer locks, production Electron measurements, durable product/architecture/quality contracts, and launch-smoke watchdog stabilization.

## Evidence

- The live 1280×720 baseline compressed ten controls into one 399px row of 35px buttons, clipped all ten labels, exposed zero explicit accessible names, and yielded only seven unique names because Step, Pitch, and Octave direction pairs collapsed together.
- The corrected browser route measured a 399.48px toolbar with all ten complete labels readable and contained, ten unique accessible names, five columns, two rows, 48px minimum control height, and zero toolbar overflow.
- A real Step right action moved the selected 808 from G1.4 to G1.5; Step left restored G1.4 through the existing undoable note-edit path, and the browser reported no console errors.
- Renderer smoke locks the exact ten visible labels, ten accessible names, selected-note group semantics, container boundary, five-column layout, 48px height, wrapping, and clipping removal.
- Production Electron selects an existing Professional producer starter note and proves 10/10 readable, uniquely named, and contained controls in a five-by-two narrow layout alongside existing starter, keyboard, layout, project-state, and visual evidence.
- Full `npm run verify` passed source, runtime, local delivery, production Electron, packaged app, ad-hoc signature, DMG, PKG payload, simulated install, project I/O, persona, privacy, and release-evidence paths after the launch-only watchdog was adjusted for the suite's accumulated duration.

## Review Notes

- Accessible names remain stable when the previous- or next-beat action is disabled; dynamic availability details remain in the unchanged titles.
- Existing step, pitch, octave, duplication, beat-copy, and audition callbacks are untouched, and the action order is identical to the baseline.
- The inline-size container scopes responsiveness to the note inspector rather than inferring component space from the viewport.
- Review found that `projectIoSmokeTimeoutMs` inherited the raised launch timeout through a shared constant. It was restored to 640 seconds so only the long production launch UI evidence receives the new 15-minute outer window; TypeScript, renderer smoke, and diff checks passed after the correction.

## Residual Risks

- The production contract deliberately expects exactly ten selected-note actions and a five-by-two narrow layout. Adding actions or changing the order requires an explicit product and harness update.
- Localization or substantially longer labels requires a fresh narrow-width wrapping audit.
- The 780px container threshold is validated for the current 399px Compose inspector and the established wide scan; future workspace column redesigns should remeasure both sides of the threshold.
- External release signing, notarization, Gatekeeper acceptance, and private distribution evidence still require the existing out-of-repository credentials and release environment; this change does not expand that boundary.
