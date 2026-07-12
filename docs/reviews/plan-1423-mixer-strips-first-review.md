# plan-1423-mixer-strips-first review

## Summary

Mixer now treats channel balance as the shared beginner/professional workflow. Tone shaping, send effects, mix generators, stem audition, and snapshots remain complete in audience-aware disclosures after the direct console.

## QA

- `npm run qa` passed.
- `npm run typecheck` passed.
- `npm run renderer:smoke` passed with direct hierarchy and Guided collapse assertions.
- `npm run workflow:smoke` passed for the guided 8-bar first beat and studio 26-bar producer pass.
- `npm run persona:smoke` passed for both audiences and all 14 style profiles.
- `npm run build` passed; the existing frontend chunk-size warning remains nonfatal.
- `npm run desktop:launch-smoke` passed at 1440×928 with 72 required test IDs, live Guided/Studio state evidence, hierarchy evidence, and a 2880×1856 visual proof.
- `npm run desktop:project-io-smoke` passed for native save/open and both audience starter roundtrips.
- `git diff --check` passed.

## Findings

- No blocking findings.
- Channel strips, mute/solo, volume, pan, roles, and meters precede every helper disclosure in DOM order.
- The entire prior Mixer test-ID surface remains present; tone, dynamics, send, balance, audition, decision, and snapshot controls were moved rather than removed.
- Guided mode collapses per-channel Tone & Space, Mix Moves, and Audition & Compare, while Studio expands all three through one mode-aware handler.
- Apply, focus, audition, capture, recall, and clear actions reveal the relevant helper surface before results are presented.
- Controlled native `details`/`summary` elements retain keyboard semantics and visible focus without toggle-event races.
- The beginner-facing per-channel label says Tone & Space while its status line exposes Cut, Drive, and Space values; expert parameter names remain inside.
- Mixer data, DSP, playback, rendering, exports, styles, local-first behavior, and sampling scope are unchanged.

## Residual Risk

- Studio mode deliberately opens processing on all five strips, which favors professional scan speed over vertical compactness; individual user choices remain toggleable afterward.
- CSS and Quick Actions bundles remain above the warning threshold; cold-start measurement should precede splitting work.
- External signing, notarization, Gatekeeper, update-feed, and distribution QA remain outside this product-UX plan.

## Follow-Ups

- Audit Master density so final output controls lead before review queues, finish helpers, automation generators, and delivery analysis.
- Measure cold-start and interaction readiness before choosing a bundle-splitting boundary.
