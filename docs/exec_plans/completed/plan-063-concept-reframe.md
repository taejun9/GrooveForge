# plan-063-concept-reframe

## Status

Completed

## Owner

Team Forge

## User Request

Clarify that GrooveForge is an all-genre beat-making workstation. Sampling should be a secondary optional feature, not the main product concept.

## Goal

Tighten the project brief and durable docs so future product, architecture, UI, and roadmap work starts from direct beat composition: pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixing/mastering, and export. Sampling must remain documented only as an optional extension path.

## Scope

- Audit the user-provided concept correction and current repository docs.
- Update product-facing documentation where the beat-workstation concept can be made clearer.
- Update QA expectations so the corrected framing stays enforced.
- Preserve the existing app behavior; this is a documentation and harness framing slice.

## Non-Goals

- No sampling, sample import, chopping, sampler track, waveform, or audio warping implementation.
- No UI redesign or feature implementation.
- No new external dependencies, remote AI calls, analytics, accounts, or cloud sync.
- No changes to audio rendering, save/load, export, MIDI, or playback semantics.

## Files

- `README.md`
- `docs/product/product.md`
- `docs/architecture/product-architecture.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-063-concept-reframe.md`
- `docs/reviews/plan-063-concept-reframe-review.md`

## Implementation Steps

- [x] Compare the attached concept note with current product and architecture docs.
- [x] Add a durable concept lock that states GrooveForge is a beat-production mini DAW for all genres.
- [x] Make the direct-composition module order explicit: BPM/key, drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, export.
- [x] Keep optional sampling described as later sample import, chopping, loop stretch, and one-shot/sampler mapping only.
- [x] Update static QA checks to catch future sampling-first drift.
- [x] Run QA and review.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py` - passed.
- [x] `python3 harness/scripts/run_quality_gate.py` - passed.
- [x] `npm run typecheck` - passed.
- [x] `npm run build` - passed.
- [x] `npm run qa` - passed.
- [x] `npm run verify` - passed.
- [x] Diff review confirmed no runtime behavior changed.

## Review Plan

Review starts only after QA passes. Confirm that docs and harness now favor all-genre direct beat production, sampling remains optional, and no implementation or runtime behavior changed.

## Decision Log

| date | decision | rationale |
|---|---|---|
| 2026-06-16 | Treat this as a product framing correction, not a feature slice. | The user asked to fix the draft concept so future work does not mistake GrooveForge for a sampling-first app. |

## Implementation Notes

- Added a README concept lock that says GrooveForge is not a sampling app and names the all-genre beat-production mini DAW direction.
- Added a corrected product concept in `docs/product/product.md`.
- Made the direct composition flow explicit in README/product docs and moved sampling into a separate optional later path.
- Added an architecture rule that optional sampling attaches after the composition pipeline rather than becoming the base of project creation, playback, arrangement, save/load, or export.
- Added a quality gate rule and static QA expectations for this corrected framing.

## Review Summary

No findings. The changes are documentation and harness expectations only. Runtime app behavior, project data, audio rendering, save/load, export, and UI behavior were not changed.
