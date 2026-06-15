# plan-018-style-grooves

## Status

active

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족할 수 있고, 작곡을 처음 해보는 사람도 사용하기 쉬운 데스크탑 앱으로 완성시켜줘.

The user also clarified that GrooveForge should be a beat-making app for all genres, with sampling only as an optional supporting feature.

## Goal

Make style selection musically meaningful by applying editable style groove templates to Pattern A/B/C, sound preset, BPM, and swing. Beginners should get a usable genre starting point from the Style selector, while working beatmakers should get fast genre sketches they can immediately edit, undo, arrange, mix, and export.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, or audio warping.
- No remote AI, generated audio files, cloud calls, telemetry, or accounts.
- No full probabilistic generator or user-authored style editor in this plan.

## Context Map

- `src/domain/workstation.ts`: style profiles, pattern data, scale helpers, starter project, sound presets.
- `src/ui/App.tsx`: Style selector behavior and undoable project updates.
- `src/audio/scheduler.ts`: realtime playback reads selected pattern events.
- `src/audio/render.ts`: export follows arrangement pattern assignments.
- `README.md`: public MVP surface.
- `docs/product/product.md`: style profile and genre direction.
- `docs/quality/rules.md`: product QA gate for style/groove work.
- `harness/scripts/run_qa.py`: static checks for style groove support.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-018-style-grooves` and `.worktree/plan-018-style-grooves` for git repository work.
- Preserve the composition-first invariant: style grooves generate editable event data and built-in sound settings, not audio samples.

## Implementation Plan

- [x] Add style groove templates that generate Pattern A/B/C drums, bass, melody, and chords from the selected key.
- [x] Add style-to-sound preset mapping for immediate tone changes.
- [x] Update Style selection to apply BPM, swing, sound preset, and Pattern A/B/C data through the existing undoable edit path.
- [x] Keep arrangement and export semantics stable while changing pattern content.
- [x] Update docs and static QA expectations.
- [x] Verify with automated QA and browser interaction.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Browser check at the local Vite app: switch from Trap to House and Boom Bap, verify BPM/style/status/event counts/tone readouts change, undo returns to the prior groove, start/stop playback, and confirm no console errors.

## Review Plan

QA completes before review starts. Review checks that style grooves remain editable local musical events, use the current key, preserve undo/redo, do not make sampling central, and do not break realtime/export paths.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Make the existing Style selector apply groove templates, not only BPM and swing. | The product promise is all-genre beat creation; a style selector that leaves trap-like patterns in place is misleading for beginners and weak for working producers. |
| 2026-06-15 | Generate patterns from scale degrees for the current key. | This keeps style changes musically editable and key-aware without hard-coding every style to F minor. |
| 2026-06-15 | Keep style work sample-free. | The user clarified that sampling is a secondary module, so genre support should come from musical events and built-in sound settings. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for style groove templates. |
| 2026-06-15 | harness_builder | Added key-aware style Pattern A/B/C blueprints and style-to-sound preset mapping. |
| 2026-06-15 | harness_builder | Updated Style selection to apply BPM, swing, sound preset, and pattern data through the undoable project update path. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA checks to frame style grooves as editable beat-composition templates. |
| 2026-06-15 | quality_runner | Passed `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-15 | quality_runner | Browser validation passed: House changed to 124 BPM/Air Space/27-31-18 events, undo returned to Trap 145 BPM/Clean Knock/31-37-25 events, redo restored House, Boom Bap changed to 92 BPM/Warm Tape/30-31-20 events, playback start/stop worked, and console error logs were empty. |

## Completion Notes

Style selection now reinforces GrooveForge as an all-genre beat workstation rather than a sampling-first app. The Style selector applies editable, key-aware Pattern A/B/C musical events plus BPM, swing, and built-in sound preset changes without importing audio or adding sampling workflow dependencies.
