# plan-101-drum-kit-pads

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working composers/producers can respect and first-time composers can use easily.

## Goal

Add Drum Kit Pads so users can quickly shape the built-in drum synth kit posture for the current project with explicit local presets. Beginners should get useful drum tone choices quickly, while working producers can keep editing the resulting kick, snare, hat, drum channel EQ/drive/glue/send, and mix controls manually.

## Non-Goals

- No sample import, sample packs, one-shot mapping, sampler tracks, audio recording, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No new project schema unless it is required; prefer existing `SoundDesign` and mixer channel state.
- No mutation of Pattern A/B/C musical events, arrangement blocks, non-drum mixer channels, master state, Delivery Target, Beat Readiness, Beat Map, Next Move, Project Snapshots, exports, MIDI, or Handoff Sheet semantics.
- No professional mastering, platform, licensing, release-readiness, or genre-authenticity guarantee claims.

## Context Map

- `src/ui/App.tsx`: Sound Designer, Sound Focus Pads, mixer update paths, pad component conventions.
- `src/domain/workstation.ts`: existing `SoundDesign`, mixer channel state, preset labels, validation.
- `src/audio/scheduler.ts` and `src/audio/render.ts`: realtime/offline drum tone behavior already reads `SoundDesign` plus drum mixer channel controls.
- `src/styles.css`: compact pad panel styles.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product framing and QA guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and code tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-101-drum-kit-pads` and `.worktree/plan-101-drum-kit-pads` for git repository work.
- Drum Kit Pads must be explicit-click local presets.
- Drum Kit Pads must update only editable `SoundDesign` drum parameters and the `drum_rack` mixer channel through existing undoable project history.
- Results must remain manually editable through Sound Designer and Mixer controls.
- Realtime playback and WAV/stem export semantics must remain driven by local project state.

## Implementation Plan

- [x] Add Drum Kit Pad definitions, preview derivation, and a bounded project-transform helper.
- [x] Add an explicit `applyDrumKitPad` handler that updates only drum tone and drum channel mix state.
- [x] Render compact Drum Kit Pads inside Sound Designer near existing Sound Focus Pads.
- [x] Update docs and QA expectations for direct-composition, sample-free drum kit shaping.

## QA Plan

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run verify`
- [x] Browser smoke test: Drum Kit Pads render four options, applying one option changes drum sound/mixer readouts while manual controls remain available, console errors stay empty, and no horizontal overflow appears.
- [x] `npm run qa`
- [x] `git diff --check`

## Review Plan

QA completed before review. Review checked that Drum Kit Pads are explicit, local, undoable, bounded to drum tone/mixer state, manually editable afterward, and preserve realtime/export plus non-sampling product boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Drum Kit Pads after Drum Foundation Pads. | Rhythm foundations are now fast; the next practical gap is letting beginners and producers quickly hear different built-in drum kit postures without importing samples. |
| 2026-06-16 | Reuse existing `SoundDesign` and `drum_rack` mixer state instead of adding a kit schema. | Current realtime and offline render paths already consume these fields, so a scoped UI transform improves the product without migration risk. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for sample-free Drum Kit Pads. |
| 2026-06-16 | harness_builder | Added Drum Kit Pads, bounded sound/mixer transform helpers, UI, styles, docs, and QA expectations. |
| 2026-06-16 | quality_runner | Passed typecheck, QA harness, verify, QA, diff check, and browser smoke on `http://127.0.0.1:5208/`. |
| 2026-06-16 | review_judge | Reviewed scope against drum-only tone/mixer mutation and optional-sampling boundary; no blocking findings. |

## Completion Notes

Drum Kit Pads were added as a direct beat-production feature for built-in kick/clap/hat tone posture. The implementation exposes Clean, Knock, Dust, and Air local presets in Sound Designer, updates only editable drum `SoundDesign` parameters plus the `drum_rack` mixer channel through undoable project history, keeps manual Studio and Mixer controls editable, and preserves the sampling-as-optional-extension product boundary.
