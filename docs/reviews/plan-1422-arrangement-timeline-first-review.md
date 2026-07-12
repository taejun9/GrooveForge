# plan-1422-arrangement-timeline-first review

## Summary

Arrangement now treats the audible block timeline and essential selected-block structure controls as the shared beginner/professional workflow. Song-form generation, analysis, and producer move suggestions remain complete in audience-aware disclosures after direct editing.

## QA

- `npm run qa` passed.
- `npm run typecheck` passed.
- `npm run renderer:smoke` passed with direct hierarchy and Guided collapse assertions.
- `npm run workflow:smoke` passed for the guided 8-bar first beat and studio 26-bar producer pass.
- `npm run persona:smoke` passed for both audiences and all 14 style profiles.
- `npm run build` passed; the existing frontend chunk-size warning remains nonfatal.
- `npm run desktop:launch-smoke` passed at 1440×928 with 68 required test IDs, live Guided/Studio state evidence, hierarchy evidence, and a 2880×1856 visual proof.
- `npm run desktop:project-io-smoke` passed for native save/open and both audience starter roundtrips.
- `git diff --check` passed.

## Findings

- No blocking findings.
- Playback context, timeline, selected block, and essential structural controls precede both optional disclosures in DOM order.
- The entire prior Arrangement test-ID surface remains present; generators, analysis maps, previews, and producer moves were moved rather than removed.
- Guided mode collapses Block Moves and Arrangement Tools, while Studio expands both through the same mode-aware handler used by live evidence.
- Apply, cue, focus, map, chain, and priority actions reveal the relevant destination before surfacing results.
- Controlled native `details`/`summary` elements retain disclosure semantics and visible keyboard focus without toggle-event races.
- Block Moves spans the full selected-editor grid, preventing the disclosure from collapsing into a narrow field column.
- Arrangement data, playback, rendering, exports, styles, local-first behavior, and sampling scope are unchanged.

## Residual Risk

- The selected-block editor still contains several simultaneous numeric and structural fields; per-field compact labels could further improve very narrow windows.
- CSS and Quick Actions bundles remain above the warning threshold; cold-start measurement should precede splitting work.
- External signing, notarization, Gatekeeper, update-feed, and distribution QA remain outside this product-UX plan.

## Follow-Ups

- Audit Mixer density so direct channel strips lead before balance generators, Space FX, stem audition analysis, and snapshot tools.
- Measure cold-start and interaction readiness before choosing a bundle-splitting boundary.
