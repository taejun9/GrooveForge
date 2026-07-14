# plan-1462-loop-scope-clarity review

## Outcome

Approved. No blocking, major, or moderate findings remain after QA and the separate review.

## Scope Reviewed

- Live Song, Block, Turn, and Pattern target copy in the essential Transport selector.
- One named group, four unique state-aware accessible names, boolean pressed semantics, and exactly one pressed scope.
- Four-column 48px two-line layout, readable label/detail hierarchy, title retention, and containment.
- Correct ownership of Pattern event singular/plural copy without duplicated `events` suffixes.
- Preservation of scope order, ids, click handlers, disabled logic, selected styling, direct Tab access, playback scheduling, loop boundaries, project data, history, save/load, render, MIDI, and export behavior.
- Renderer, Browser, and production Electron regression evidence plus durable product, architecture, and quality contracts.

## Evidence

- Browser at 1180×720 measured a contained 555px four-column row with four 48px controls, four complete target lines, four unique accessible names, one pressed scope, zero internal/document overflow, and no duplicated event grammar.
- Browser at 1280×720 measured the compact 340px surface as four 80.5px by 48px controls in one row with zero overflow. A clean fresh Browser session reported no console errors.
- Browser interaction proved Turn focus and pressed state with `Intro → Verse` plus `Cued Turn / Intro -> Verse / 3 bars`, then Pattern focus and pressed state with `A · 21 events` plus `Cued Pattern / Pattern A / Step 1`; exactly one scope remained pressed after each transition.
- Production Electron confirmed 4/4 readable live targets, four unique names/titles, one named group, one pressed scope, corrected event grammar, four columns, one row, four contained 48px controls, and zero internal overflow on the live Beginner starter.
- `git diff --check`, `npm run typecheck`, `npm run renderer:smoke`, `npm run build`, standalone `npm run desktop:launch-smoke`, `npm run qa`, and full `npm run verify` passed. The full integration chain repeated the production Electron evidence successfully and exited 0.

## Review Notes

The initial live CSS audit exposed an equal-specificity cascade issue: a later generic segmented-button rule reduced the intended 48px controls to 36px. Scoping the rule as `.segmented.playback-mode-row button` made the minimum deterministic; Browser and both production Electron passes measured 48px afterward.

The first production Electron run found only 3/4 visible detail labels readable because `8 bars timeline` exceeded the narrow Song slot. The visible detail became `All 8 bars`, while the accessible name retains `Song loop, 8 bars timeline`; the repeated Electron run passed 4/4. This keeps concise producer scanning without discarding screen-reader context.

The four buttons still invoke the existing `setTransportLoopScope` path and keep their established ids, order, disabled calculations, titles, click behavior, and selected class. All new copy and accessibility state derive from existing UI-local/project values; no new project, playback, history, render, or export state was introduced.

The first QA run correctly caught replacement of three established exact documentation phrases. Those sentences were restored unchanged and Turn-specific rules were appended, preserving compatibility evidence while documenting the expanded four-scope presentation contract.

## Residual Risks

- Localization or substantially longer section/Pattern labels should be remeasured at the supported minimum desktop width.
- A future change to loop-scope count or order must update the fixed four-control renderer and Electron contracts.
- External notarization, Developer ID signing, publishing, and private release credentials remain intentionally absent and value-free; local release readiness is unaffected.
