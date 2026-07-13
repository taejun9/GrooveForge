# plan-1443-button-theme-foundation review

## Outcome

Approved with no remaining blockers.

## Scope Reviewed

- Low-specificity dark button foundation and cascade behavior.
- Default, hover, focus-visible, and disabled state contracts.
- First-viewport Groove and chord clipboard controls.
- Deep-workflow arrangement, stem, mix snapshot, brief, and review controls.
- Existing transport, selected, active, warning, danger, icon, and segmented treatments.
- Project mutation, playback, MIDI, render/export, privacy, and sampling invariants.

## Findings

### Confirmed: one foundation removes the recurring native-light defect

Before the change, the live workstation exposed 47 buttons with `rgb(239, 239, 239)` native backgrounds and black text, including five in the active 1280×720 editing viewport. After the change, a browser scan of all 990 rendered buttons found zero native appearances or native-white surfaces. Groove presets and chord clipboard actions now visually belong to the same workstation as the surrounding editors.

### Confirmed: zero specificity preserves specialist hierarchy

The foundation uses `:where(button)`, including its hover, focus-visible, and disabled variants. Any component class therefore remains more specific. Live browser and production Electron retained the mint Play surface and selected Swing Feel surface while six formerly-native representative controls inherited the dark base.

### Confirmed: keyboard and disabled states remain explicit

Keyboard focus on a formerly-native control produced a solid 2px cyan outline with a 2px offset. The disabled chord Paste action retained `not-allowed` cursor and stronger component opacity. No label, action id, event handler, command route, or project field changed.

### Strengthened during verification: renderer evidence must be valid JavaScript

The first production Electron run found a TypeScript-only type predicate embedded in the JavaScript string sent to the renderer. Replacing it with `filter(Boolean)` removed the runtime syntax error; typecheck, build, and the complete Electron launch rerun then passed. The final evidence path now executes in the same runtime it verifies.

No additional findings remain.

## Evidence

- Live in-app browser 990-button computed-style scan and visual review
- `npm run qa`
- `npm run typecheck`
- `npm run renderer:smoke`
- `npm run harness:smoke`
- `npm run workflow:smoke`
- `npm run persona:smoke`
- `npm run build`
- `npm run quick-actions:bundle-smoke`
- `npm run desktop:launch-smoke`
- `npm run desktop:project-io-smoke`
- `git diff --check`

Production Electron verified six representative inherited controls, zero native surfaces, preserved disabled and specialist states, 104 required test ids, both starter landing routes, and the full workstation path. Runtime evidence retained 30/30 project roundtrips, all 14 styles, both audience workflows, and native save/open roundtrips.
