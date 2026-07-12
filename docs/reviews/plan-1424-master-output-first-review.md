# plan-1424-master-output-first review

## Summary

Master now treats final output preset and limiter ceiling as the shared beginner/professional workflow. Creative polish and validation remain complete in separate audience-aware disclosures after the direct controls.

## QA

- `npm run qa` passed.
- `npm run typecheck` passed.
- `npm run renderer:smoke` passed with direct hierarchy, precise input, and Guided collapse assertions.
- `npm run workflow:smoke` passed for the guided 8-bar first beat and studio 26-bar producer pass.
- `npm run persona:smoke` passed for both audiences and all 14 style profiles.
- `npm run build` passed; the existing frontend chunk-size warning remains nonfatal.
- `npm run desktop:launch-smoke` passed at 1440×928 with 76 required test IDs, live -6/0/0.1 ceiling bounds, Guided/Studio state evidence, hierarchy evidence, and a 2880×1856 visual proof.
- `npm run desktop:project-io-smoke` passed for native save/open and both audience starter roundtrips.
- `git diff --check` passed.

## Findings

- No blocking findings after correction.
- Output role, ceiling range, precise number input, and presets precede both helper disclosures in DOM order.
- The numeric field uses a draft while focused, so clearing or typing a negative value does not prematurely force 0 dB; blur/Enter commits a bounded 0.1 dB value.
- The entire prior Master test-ID surface remains present; finish, automation, checklist, queue, export, coach, and fix controls were moved rather than removed.
- Guided mode collapses Polish & Automation and Review & Export, while Studio expands both through the shared mode-aware handler.
- Apply, focus, and fix actions reveal the relevant helper surface before results are presented.
- Controlled native `details`/`summary` elements retain keyboard semantics and visible focus without toggle-event races.
- Master data, DSP, playback, rendering, exports, styles, local-first behavior, and sampling scope are unchanged.

## Residual Risk

- The Master review surface remains intentionally comprehensive in Studio; its internal Review Queue and Mix Coach may merit separate scanning optimization later.
- CSS and Quick Actions bundles remain above the warning threshold; cold-start measurement should precede splitting work.
- External signing, notarization, Gatekeeper, update-feed, and distribution QA remain outside this product-UX plan.

## Follow-Ups

- Audit Delivery/export density so direct WAV/stem/MIDI/handoff actions lead before proof and handoff analysis.
- Measure cold-start and interaction readiness before choosing a bundle-splitting boundary.
