# plan-1420-note-editor-first Review

## Summary

The 808/Melody panel now prioritizes direct note-grid editing. Keyboard capture, MIDI setup, and idea generators remain available in Capture & Ideas, which opens automatically whenever an input path is armed.

## QA

- `npm run qa` passed.
- `npm run typecheck` passed.
- `npm run renderer:smoke` passed with default-collapsed and note-grid ordering assertions.
- `npm run workflow:smoke` passed for the guided 8-bar first beat and studio 26-bar producer pass.
- `npm run persona:smoke` passed for both audiences and all 14 style profiles.
- `npm run build` passed; the existing frontend chunk-size warning remains nonfatal.
- `npm run desktop:launch-smoke` passed at 1440×928 with 59 required test IDs and live evidence: Capture & Ideas collapsed, auto-reveal yes, note grids after capture yes.
- `npm run desktop:project-io-smoke` passed for native save/open and both audience starter roundtrips.
- `git diff --check` passed.

## Findings

- No blocking findings.
- Keyboard and MIDI arming share reveal-aware handlers across visible controls and Quick Actions.
- Native `details`/`summary` semantics retain keyboard disclosure behavior.
- Launch-smoke interaction evidence uses the real React handler and restores capture state after proof.
- All prior keyboard, MIDI, bassline, glide, contour, motif, accent, and melody controls remain available.
- Project data, playback, rendering, exports, style coverage, and local-first behavior are unchanged.

## Residual Risk

- The Instrument panel still combines sound design and chord editing in one dense surface; it is the next likely composition-density target.
- Frontend CSS and quick-action chunks continue to exceed the current warning threshold; performance should be measured before splitting.
- External Developer ID signing, notarization, Gatekeeper, update feed, and distribution QA remain outside this product-UX plan.
- The plan-1411-through-plan-1420 source checkpoint is complete, while its generated release-progress mirror remains unavailable in this isolated worktree because the ignored external-release source artifacts were intentionally not regenerated.

## Follow-Ups

- Audit the Instrument/Chord surface using the same direct-edit-first standard.
- Measure cold-start and interaction readiness before choosing a bundle-splitting strategy.
