# plan-1469-export-tail-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Prevent offline WAV exports from cutting notes and space-return energy at the exact arrangement boundary. Preserve a bounded render tail, fade the final frames to digital zero, and prove all generated beginner, professional, stem, and style-matrix samples finish safely without changing the musical arrangement length.

## Evidence and Motivation

The current renderer allocates exactly `bars * 16 * stepDuration` frames. Notes, drum envelopes, and the recursive Space return are clipped when they extend beyond that boundary. Direct PCM inspection of the 24 plan-1468 sample WAVs found 12 non-silent endings. The Jersey Club style mix ended with last-frame amplitude `0.020142` and final-100ms RMS `0.029418`; Garage ended at `0.006134` with final-100ms RMS `0.024644`; Phonk ended at `0.005890` with final-100ms RMS `0.024462`. This is strong evidence of audible truncation/click risk rather than a merely theoretical edge case.

## Non-Goals

- Changing arrangement bars, pattern/event data, BPM, realtime Web Audio playback, mixer routing, style definitions, file names, project schema, or external release posture.
- Infinite reverb rendering, silence trimming, normalization, LUFS/true-peak mastering certification, imported samples, recording, plugins, or remote services.
- Claiming that numeric PCM checks replace human listening review.

## Constraints

- QA completes before separate review.
- Keep arrangement bar counts and musical event timing unchanged; only offline WAV/analysis duration may include a bounded safety tail.
- The tail must be deterministic, long enough for the current maximum event release and Space return to decay, and end at digital zero through a short terminal fade.
- Sample QA must distinguish musical duration from delivered WAV duration, verify audio can continue past the arrangement boundary, and prove every generated WAV ends at zero without full-scale samples or analysis drift.
- Keep all generated evidence ignored under `build/desktop` and record no private audio, project data, credentials, URLs, or external release claims.

## Implementation Plan

- [x] Add a tempo-aware bounded export tail and terminal fade to offline rendering.
- [x] Extend canonical PCM parsing with arrangement-boundary and final-frame measurements.
- [x] Require all 24 generated WAVs to exceed musical duration by the expected tail and finish at digital zero.
- [x] Update durable product, harness, quality, and release documentation plus static command contracts.
- [x] Run targeted audio QA, repository QA, full verify, inspect regenerated samples, then complete separate review and worktree merge/push/cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-15 | Make export-tail safety the plan-1469 target. | Direct decoding proved half of the generated sample set terminates with active PCM at the exact arrangement boundary, creating audible truncation/click risk. |
| 2026-07-15 | Preserve a bounded tail and apply a final fade instead of trimming or changing arrangement data. | This keeps musical timing and project structure intact while allowing current envelopes and Space-return feedback to decay deterministically and guaranteeing a zero-valued final frame. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-15 | project_lead | Created plan-1469 from clean synchronized main `6efe205e` in `codex/plan-1469-export-tail-safety`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-15 | quality_runner | Pre-fix inspection decoded all 24 plan-1468 WAVs and found 12 non-silent endings; Jersey Club, Garage, and Phonk carried the strongest final-window energy. |
| 2026-07-15 | harness_builder | Added a six-step tempo-aware offline export tail with a 0.75-second floor and an 80ms terminal fade. Event scheduling and arrangement bars remain unchanged; only delivered WAV/analysis buffers include the safety tail. |
| 2026-07-15 | harness_builder | Extended sample PCM decoding with musical duration, delivered duration, tail length, post-boundary nonzero/peak data, and final-frame peak. The report now separates musical/tail/delivered timing and records a dedicated Export Tail Safety summary. |
| 2026-07-15 | quality_runner | Targeted sample QA passed: all 24 artifacts end at digital zero and all 16 full mixes preserve post-boundary event or Space-return PCM. Beginner output is 23.37 seconds and professional output is 51.07 seconds including their bounded tails. |
| 2026-07-15 | quality_runner | The first runtime smoke correctly failed its old exact-arrangement duration assertions. Updated the contract to musical duration plus `exportTailDurationSeconds`; repository QA and all 30/30 runtime project/export roundtrips then passed. |
| 2026-07-15 | quality_runner | Full `npm run verify` exited 0. It passed the 24-WAV tail/isolation matrix, source Electron, native project IO, packaged/ad-hoc/PKG-payload/installed GUI runs, packaged/payload/installed project IO, DMG/PKG creation, privacy/value-leak checks, and expected value-free external distribution blockers. |
| 2026-07-15 | review_judge | Post-QA review found no blocking, major, or moderate issue. The tail changes only offline buffer duration, all render entry points share the same policy, and the final 80ms across regenerated samples measured at most 0.000395 RMS, 0.001221 peak, and 0.000061 adjacent-sample delta before digital zero. |
| 2026-07-15 | quality_runner | Final sample regeneration passed with 24/24 zero-ended artifacts, 16/16 full mixes retaining post-boundary PCM, 14 unique style hashes, 11/11 render-isolation cases, and no full-scale samples. Beginner mix SHA-256 is `fecc21515edb5b582907943d8081a40ec648801154606c310423cd1b6e9fd420`; professional mix SHA-256 is `f1e71a1b672fd51d187decf55fd36fe0a2f2b6e9e8ddb59c6c00bf3b07f15b0e`. |
| 2026-07-15 | plan_keeper | Completion-summary refresh passed with latest completed plan `plan-1469`, current window `1461-1470: 9/10`, fresh source evidence, and no private value recording or external distribution claim. |
