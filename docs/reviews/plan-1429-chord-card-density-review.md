# plan-1429-chord-card-density review

## Summary

Chord events now remain compact and comparable until selected. The active chord expands across the editor width with every existing professional control, while peer cards retain concise step, chord, voicing, length, velocity, chance, and edit-state context.

## QA Evidence

- `npm run qa`: passed.
- `npm run typecheck`: passed.
- `npm run renderer:smoke`: passed with exactly one expanded chord card and compact peers in the first render.
- `npm run workflow:smoke`: passed for the guided 8-bar first beat and studio 26-bar fast pass.
- `npm run persona:smoke`: passed both audiences, all 14 styles, local exports, two delivery packages, and package reopen verification.
- `npm run build`: passed; the existing nonfatal frontend chunk-size warning remains.
- `npm run desktop:launch-smoke`: passed at 1440×928 with four chord cards, one visible selected editor, three compact peers, hidden peer editors, Enter/Space selection restoration, 104 required test IDs, and screenshot evidence.
- `npm run desktop:project-io-smoke`: passed native save/open and both audience starter roundtrips.
- `git diff --check`: passed.

## Findings

### Fixed: keyboard transition evidence initially depended on hidden-window focus behavior

The first review check called `focus()` from a hidden Electron window. Initial compact/expanded layout passed, but the hidden window did not reliably emit the React focus transition. Chord cards now explicitly accept Enter and Space, and the state-changing launch-smoke hook dispatches those real keyboard events inside synchronous React commits before proving selection and restoration. Initial DOM collection remains read-only.

No blocking findings remain.

## Preservation Checks

- Step, Root, Quality, three Voicing buttons, Length range/number, Velocity range/number, and Chance range/text inputs retain their handlers and test IDs on every card.
- Add, audition, move, duplicate, previous/next beat, inversion, copy, paste, and delete controls are unchanged.
- Compact editors use `display: none`, so their inputs are removed from visual layout and keyboard traversal while remaining mounted for stable state and test contracts.
- The focusable card retains pointer selection and focus selection and now adds explicit Enter/Space activation through the same `onSelect` path.
- Selected and playing visual states continue to compose; the selected card spans both columns without changing playback-follow logic.
- Narrow layouts use a single-column selected editor and keep compact summary metrics readable.
- Chord events, project schema, history, playback, synthesis, save/load, rendering, exports, style profiles, local-first behavior, and sampling scope are unchanged.

## Residual Risk

The active chord is intentionally taller than its compact peers and may move a neighboring card to the next grid row; this is the tradeoff for keeping precise controls in context. The existing large frontend chunk warning remains and should be addressed through a measured startup-performance plan.

## Verdict

Approved. No blocking findings remain.
