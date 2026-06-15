# plan-020-sidechain-ducking

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족할 수 있고, 작곡을 처음 해보는 사람도 사용하기 쉬운 데스크탑 앱으로 완성시켜줘.

## Goal

Add beginner-safe kick-to-808 sidechain ducking so low-end playback and export feel more produced without requiring users to understand compressor routing. The control must be editable, saved in the project, reflected in realtime playback and WAV/stem export, and available in sound presets/style changes.

## Non-Goals

- No full compressor device graph, multiband sidechain, automation lanes, plugin hosting, or external audio routing.
- No sampling, audio import, chopping, sampler tracks, or audio warping.
- No claim that this replaces professional mastering or mix engineering.

## Context Map

- `src/domain/workstation.ts`: `SoundDesign`, sound presets, project migration, style sound presets.
- `src/audio/scheduler.ts`: realtime bass scheduling and drum step lookup.
- `src/audio/render.ts`: offline WAV/stem bass rendering and arrangement-aware drum/bass interaction.
- `src/ui/App.tsx`: SoundDesigner controls, device readouts, undoable project updates.
- `src/styles.css`: sound-control layout if needed.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA surface.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-020-sidechain-ducking` and `.worktree/plan-020-sidechain-ducking` for git repository work.
- Keep sidechain ducking local and deterministic.
- Existing `.grooveforge.json` files without sidechain data must migrate safely.

## Implementation Plan

- [x] Add `sidechainDuck` to `SoundDesign`, presets, normalization, and save/load migration.
- [x] Add shared sidechain gain helpers that duck 808/bass when nearby kick events hit.
- [x] Apply sidechain ducking in realtime playback.
- [x] Apply sidechain ducking in full mix and stem export.
- [x] Add a Studio tone control and visible readout for sidechain ducking.
- [x] Update docs and static QA expectations.
- [x] Verify with automated QA and browser interaction.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Browser check at the local Vite app: switch to Studio, adjust sidechain ducking, verify readout and undo/redo, start/stop playback, confirm export meter remains non-silent, and confirm no console errors.
- Domain check: project save/load round-trips `sidechainDuck`, legacy projects without the field migrate safely, and malformed values are clamped or rejected according to existing sound normalization behavior.

## Review Plan

QA completes before review starts. Review checks that sidechain ducking affects both realtime and export bass gain, preserves stem/full-mix semantics, migrates older projects, remains beginner-safe, and does not turn the app toward sampling.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement kick-to-808 sidechain as a SoundDesign tone control. | It improves low-end polish while staying simple for beginners and directly useful for beatmakers. |
| 2026-06-15 | Use deterministic gain shaping from kick step positions instead of a full compressor. | A predictable MVP control is easier to validate and keeps realtime/export behavior aligned. |
| 2026-06-15 | Commit percent number inputs on blur/Enter instead of every keypress. | A typed value such as 82 should be one undoable edit, not separate 8 and 82 history entries. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for kick-to-808 sidechain ducking. |
| 2026-06-15 | harness_builder | Added `sidechainDuck` to sound design state, sound presets, project normalization, and import validation. |
| 2026-06-15 | harness_builder | Added deterministic `sidechainGainForStep` and applied it to realtime bass playback plus full-mix and 808 stem rendering. |
| 2026-06-15 | harness_builder | Added Studio `Kick duck` control, `Duck` readout, and 808 device readout with drive and duck values. |
| 2026-06-15 | harness_builder | Updated SoundControl percent input behavior so typed values commit once on blur/Enter and undo/redo returns to the previous committed value. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for kick-to-808 sidechain ducking. |
| 2026-06-15 | quality_runner | Domain validation passed: `sidechainDuck` round-tripped as 0.82, legacy sound data migrated to 0.5, malformed value 2 was rejected, and kick-adjacent gain ducked below unity. |
| 2026-06-15 | quality_runner | Browser validation passed: Guided showed Duck 42% with Studio input hidden; Studio showed input 42/slider 0.42; editing to 82 committed Duck 82%, input 82, slider 0.82, and 808 readout drive 34%/duck 82%; undo restored 42% and redo restored 82%. |
| 2026-06-15 | quality_runner | Browser playback/export validation passed: Play advanced to Bar 1.2 Step 6, Stop returned Ready/2 bar loop, export meter was Hot with peak -3.9 dB, RMS -21.5 dB, headroom 0.9 dB, limiter 0.00%, and no console errors. |
| 2026-06-15 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, and `git diff --check`. |

## Completion Notes

Kick-to-808 sidechain ducking is now editable local sound-design state. It migrates older project files, persists through save/load, affects realtime playback and offline full-mix/808 stem rendering, stays beginner-safe as a single `Kick duck` control, and keeps sampling out of the core workflow.
