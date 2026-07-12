# plan-1421-instrument-chord-first review

## Summary

The Instrument panel now treats editable chord events as the primary shared beginner/professional surface. Harmony generation and sound design remain complete but move into audience-aware disclosures after the direct event editor.

## QA

- `npm run qa` passed.
- `npm run typecheck` passed.
- `npm run renderer:smoke` passed with Guided collapse and direct-event ordering assertions.
- `npm run workflow:smoke` passed for the guided 8-bar first beat and studio 26-bar producer pass.
- `npm run persona:smoke` passed for both audiences and all 14 style profiles.
- `npm run build` passed; the existing frontend chunk-size warning remains nonfatal.
- `npm run desktop:launch-smoke` passed at 1440×928 with 63 required test IDs, live Guided/Studio state evidence, hierarchy evidence, and a 2880×1856 visual proof.
- `npm run desktop:project-io-smoke` passed for native save/open and both audience starter roundtrips.
- `git diff --check` passed.

## Findings

- No blocking findings.
- Chord function, selected-event operations, and full event cards precede generative harmony controls in DOM order.
- The entire prior Chord Editor and Sound Designer test-ID surface remains present; no expert control was removed.
- Guided mode collapses Harmony Moves and Sound Design, while Studio expands both through the same handler used by mode switching and launch evidence.
- Sound and harmony focus/apply actions reveal their destination so a result is not left inside a hidden region.
- Controlled native `details`/`summary` elements preserve disclosure semantics and visible keyboard focus while avoiding programmatic-toggle event races.
- Project data, playback, synthesis, rendering, exports, styles, local-first behavior, and sampling scope are unchanged.

## Residual Risk

- The detailed chord cards still expose many numeric fields at once; a future compact/expanded per-event inspector may further improve small-window scanning without hiding essential edits.
- CSS and Quick Actions bundles remain above the current warning threshold; cold-start measurement should precede any splitting work.
- External signing, notarization, Gatekeeper, update-feed, and distribution QA remain outside this product-UX plan.

## Follow-Ups

- Audit Arrangement panel density and prioritize its direct block timeline over optional analysis/readout surfaces.
- Measure cold-start and interaction readiness before selecting a bundle-splitting boundary.
