# plan-012-chord-progression

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Keep GrooveForge centered on making beats across genres. Sampling is an optional add-on, not the main product concept.

## Goal

Add a first editable chord progression track so beginners can build harmonic movement without music theory fluency, and working beatmakers can shape a sample-free beat beyond drums, 808, and melody.

## Non-Goals

- No advanced piano roll for individual chord voices.
- No chord suggestion engine beyond scale-locked root options.
- No MIDI input or drag-and-drop chords.
- No full synth patch browser.
- No sampling, audio import, chopping, or sampler-track work.

## Context Map

- `src/domain/workstation.ts`: pattern data, project migration, starter pattern data, chord pitch helpers.
- `src/audio/scheduler.ts`: realtime Web Audio scheduling.
- `src/audio/render.ts`: offline WAV rendering.
- `src/ui/App.tsx`: pattern editor, instrument area, chord controls, event counts.
- `src/styles.css`: chord editor layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA framing.
- `harness/scripts/run_qa.py`: durable text expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve the product invariant: GrooveForge must create a complete beat without imported samples.

## Implementation Plan

- [x] Add chord event types, helpers, and project migration.
- [x] Add starter Pattern A/B/C chord progressions.
- [x] Implement chord playback/export through the existing chord mixer strip.
- [x] Add chord progression editor UI for root, quality, length, and velocity.
- [x] Include chord events in Pattern A/B/C event totals.
- [x] Update docs and QA expectations.
- [x] Run QA/build/browser verification.
- [x] Move plan to completed and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `npm run verify`
- `git diff --check`
- Browser check against local dev server:
  - changed chord root to `Ab`,
  - changed chord quality to `m7`,
  - changed chord length to `6`,
  - changed chord velocity to `70`,
  - verified Pattern A count includes chord events,
  - started playback and checked no console errors.

## Review Plan

QA completed before review. Review checked that chord data is pattern-scoped, older project files can migrate without chord events, realtime and export paths share the same chord pitch helper, and product copy continues to treat sampling as optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add chord events to Pattern A/B/C rather than global project state. | Chords should vary with pattern variations and arrangement assignments just like drums, bass, and melody. |
| 2026-06-15 | Use scale-locked chord roots with editable quality. | Beginners get safe root choices while experienced users can still shape harmonic color quickly. |
| 2026-06-15 | Render chords through the existing chord mixer strip. | Chord output should honor mixer volume, pan, mute, solo, and master state in both realtime playback and WAV export. |
| 2026-06-15 | Treat this as composition-core work, not sampling work. | The user clarified that GrooveForge is an all-genre beat workstation first; chord progression strengthens sample-free composition. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Created plan on `codex/plan-012-chord-progression`. |
| 2026-06-15 | repo_cartographer | Confirmed the current model had a chord mixer strip but no chord event data or editor. |
| 2026-06-15 | harness_builder | Added chord data, UI controls, realtime scheduling, WAV rendering, docs, and QA expectations. |
| 2026-06-15 | quality_runner | Ran QA, typecheck, verify, diff check, and Browser verification. |
| 2026-06-15 | review_judge | Completed review mirror with residual risk notes. |

## Completion Notes

GrooveForge now has editable pattern-scoped chord progressions. Starter Pattern A/B/C include chord events, the chord editor exposes root, quality, length, and velocity, and realtime playback plus WAV export both render chord tones through the chord mixer strip.

The docs and QA checks now make this part of the direct beat-composition core. Sampling remains documented only as an optional later extension, licensing/privacy concern, or historical plan context.
