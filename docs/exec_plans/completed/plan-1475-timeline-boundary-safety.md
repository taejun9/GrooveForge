# plan-1475-timeline-boundary-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Keep every imported, serialized, edited, scheduled, MIDI-exported, and rendered project inside a finite 64-bar arrangement and keep every bass, melody, and chord event inside its 16-step pattern. Repair boundary-crossing local projects deterministically and prove the repaired musical data produces a playable sample WAV.

## Evidence and Motivation

Controlled reproduction on synchronized main `eeb4b0b7` accepted 100 arrangement blocks of 16 bars and preserved all 1,600 bars through parse and serialization. At 82 BPM, the offline renderer would attempt about 4,682.93 seconds of audio and allocate about 3.08 GiB for its four primary Float32 channel/send arrays before encoding. The same parser accepted bass and chord events at step 15 with length 16 and a melody event at step 14 with length 16, even though the UI edit helpers already constrain those events to the remaining steps in a 16-step pattern.

## Non-Goals

- Changing the project file version, arrangement templates, normal projects of 64 bars or fewer, song structure, pattern resolution, or external distribution readiness.
- Expanding the MVP around sampling, cloud sync, remote AI, accounts, payments, or analytics.
- Treating automated PCM checks as a substitute for human listening.

## Constraints

- QA completes before separate review.
- Keep the total-project arrangement limit and pattern-event length normalization domain-owned.
- Preserve in-order arrangement blocks and trim only the final accepted block when imported content crosses 64 bars.
- Preserve every already-valid project byte-for-byte at the musical-data level and do not mutate caller-owned source objects.
- Cover current, bare, legacy, snapshot, serialization, direct render/MIDI, and realtime scheduling paths.
- Prevent the UI from creating a project state that visually exceeds the same 64-bar limit.
- Render and decode a real WAV from repaired boundary-crossing event data; generated evidence remains ignored and value-free.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add domain-owned total-arrangement and pattern-event boundary contracts.
- [x] Apply the contracts to project parsing, serialization, snapshots, runtime render/MIDI/scheduling, and UI arrangement edits.
- [x] Add runtime, static, and sample-audio regression coverage for oversized timelines and pattern-crossing events.
- [x] Run targeted QA, actual WAV QA, separate review, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make timeline and event-end boundaries the plan-1475 target. | Current main can preserve an arrangement large enough to trigger multi-gigabyte render allocation and accepts imported note/chord durations that contradict its own UI invariant. |
| 2026-07-16 | Use 64 total arrangement bars and 16 steps per pattern. | Sixty-four bars already matches GrooveForge's delivery-target ceiling, while 16 steps is the established pattern grid. |
| 2026-07-16 | Preserve blocks in order, trim the boundary block, and clamp event duration to remaining steps. | This is deterministic, retains the earliest authored structure, and repairs local projects without inventing replacement musical material. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1475 from clean synchronized main `eeb4b0b7`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction preserved 1,600 arrangement bars requiring about 3.08 GiB of primary render buffers and accepted bass/melody/chord events ending at steps 31, 30, and 31. |
| 2026-07-16 | harness_builder | Added the 64-bar project arrangement contract, 16-step event-end normalization, ordered boundary-block trimming, current/bare/legacy/snapshot/serialization repair, runtime render/MIDI/scheduler defense, UI growth limits, and built-in pattern normalization. |
| 2026-07-16 | quality_runner | Repository QA, quality gate, typecheck, production build, renderer smoke, workflow smoke, 30-project runtime smoke, native desktop project IO, and sample-audio QA schema 8 passed. Runtime repaired 1,600 to 64 bars across 5/5 paths and event lengths to 1/2/1; sample QA generated 30/30 playable WAVs and 22/22 full mixes with tail content. |
| 2026-07-16 | review_judge | Separate post-QA review found that realtime playback could combine a bounded start bar with a bounded length and still cross bar 64, and that direct oversized arrays were fully reduced after the answer was already known. Added a shared remaining-range normalizer and early-exit total; post-review QA, runtime smoke, typecheck, diff checks, and production build passed. |
| 2026-07-16 | review_judge | Final review approved plan-1475 with no blocking, major, or moderate findings. Human listening and external distribution remain explicit manual/private boundaries. |
| 2026-07-16 | quality_runner | Refreshed the full local release evidence and completion summary after plan completion. Source evidence is 21/21, local release readiness is 100%, both audience paths are ready, and completion is 99.999999%; the remaining external distribution proof still requires private operator inputs. |
