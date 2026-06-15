# plan-028-chord-progression-tools

## Goal

Make chord progression work faster and safer for both working beatmakers and beginners by adding key-aware progression presets plus add/delete controls for chord events.

## Context

GrooveForge has pattern-scoped chord events and editable root, quality, length, and velocity. The current editor cannot create a new chord, remove a bad chord, or quickly apply a musical progression. Beginners need a usable chord pad/progression path; working producers need faster harmonic sketching without leaving the workstation.

## Scope

- Add key-aware chord progression presets that replace the selected Pattern A/B/C chord events.
- Add a safe Add chord action that inserts a scale-aware event in the selected pattern.
- Add a safe Delete action per chord event and keep at least one chord event.
- Keep chord data pattern-scoped and undoable.
- Update product docs, quality rules, and static QA expectations.

## Non-Goals

- No AI audio generation, remote calls, MIDI input, plugin hosting, sampling, audio import, chopping, sampler tracks, or audio warping.
- No full piano-roll chord voicing editor in this slice.
- No global progression library beyond a focused first set of built-in presets.

## Files

- `src/domain/workstation.ts`
- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/reviews/plan-028-chord-progression-tools-review.md`

## Acceptance

- Applying a progression preset replaces only the selected Pattern A/B/C chord events.
- Presets are generated from the current key and produce scale-appropriate roots and qualities.
- Add chord inserts an editable chord event sorted by step.
- Delete chord removes only that event and refuses to remove the final remaining chord.
- Changes are undoable and audible through existing realtime/export chord rendering.
- `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` pass.
- Browser validation confirms preset apply, add, delete, final-chord guard, undo, and no console errors.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Add chord progression tools before deeper voicing. | Quick harmonic sketching moves the app closer to a practical beat workstation without changing the audio engine. |
| 2026-06-15 | Keep tools pattern-scoped. | Chords should vary with Pattern A/B/C and arrangement assignments just like drums, 808, and melody. |

## Progress

- [x] Created plan/worktree.
- [x] Implement chord progression tools.
- [x] Update docs and harness.
- [x] Run QA and browser validation.
- [x] Create review mirror.
- [x] Ready for merge lifecycle.

## Outcome

The chord editor now supports key-aware progression presets, Add chord, per-chord Delete, and Step editing. Presets and add/delete operate only on the selected Pattern A/B/C slot, route through normal undo history, keep roots/qualities scale-aware, and prevent the UI from deleting the final remaining chord event. Step edits clamp chord length inside the 16-step bar.
