# plan-1476-event-density-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Keep pattern notes, chord events, and master automation inside finite, editor-representable collection limits at import, serialization, UI editing, realtime scheduling, MIDI export, and offline render boundaries. Repair duplicate and oversized local event collections deterministically and prove the repaired musical data produces a playable sample WAV.

## Evidence and Motivation

Controlled reproduction on synchronized main `f2505b34` accepted 5,000 identical bass notes in Pattern A inside a 960,185-character project file. A four-block 64-bar arrangement expanded that single pattern into a 2,576,516-byte MIDI file. The same parser accepted 5,000 master-volume automation events inside a 914,853-character file; offline rendering evaluates automation for every output sample, so this creates billions of unnecessary event checks. Repeated `createNextChordEvent` calls produced 24 chords on only five unique steps and repeated step 15 after the grid was full, contradicting the one-chord-per-step editor behavior.

## Non-Goals

- Changing the 16-step pattern grid, 64-bar arrangement limit, project file version, musical style profiles, or export formats.
- Adding arbitrary polyphonic lanes, a new automation editor, imported audio, sampler-first workflows, plugins, remote AI, cloud sync, accounts, analytics, or payments.
- Treating automated PCM checks as a replacement for human listening.

## Constraints

- QA completes before separate review.
- Keep collection limits and deterministic repair domain-owned.
- Preserve the first occurrence of a duplicate note or chord location and retain source order for distinct accepted automation events.
- Preserve every editor-representable valid project at the musical-data level and do not mutate caller-owned source objects.
- Cover current, bare, legacy, snapshot, serialization, direct render/MIDI, and realtime scheduling paths.
- Prevent the UI from adding another chord after all 16 pattern steps are occupied.
- Render and decode a real WAV from repaired event-dense project data; generated evidence remains ignored and value-free.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add domain-owned pattern note, chord, and automation collection contracts with deterministic deduplication and truncation.
- [x] Apply the contracts to project parsing, serialization, snapshots, built-in/direct runtime render, MIDI, scheduler, and UI chord creation.
- [x] Add runtime, static, and sample-audio regression coverage for event-dense and duplicate project data.
- [x] Run targeted QA, actual WAV QA, separate review, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make note, chord, and automation collection density the plan-1476 target. | Current main accepts editor-impossible event multiplicity that can expand work per arrangement repetition and per audio sample while remaining below the project-file size ceiling. |
| 2026-07-16 | Bound each note track to the 16-step by eight-lane editor capacity, chords to one per step, and automation to a finite project-wide set. | These limits match the current direct-composition surfaces while leaving explicit headroom for distinct master automation moves. |
| 2026-07-16 | Preserve the earliest accepted event at a duplicate editor location. | First-occurrence repair is deterministic, keeps the authored ordering visible on import, and avoids inventing musical replacements. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1476 from clean synchronized main `f2505b34`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction accepted 5,000 bass notes and emitted a 2,576,516-byte 64-bar MIDI, accepted 5,000 automation events, and generated 24 chords on five unique steps with repeated step 15 events. |
| 2026-07-16 | harness_builder | Added first-occurrence note/chord repair, 128-note track capacity, 16-step chord capacity, 16-event automation capacity, parser/serializer/snapshot normalization, direct render/MIDI/scheduler defenses, full-grid chord creation stop behavior, and one-pass-per-frame render automation gain. |
| 2026-07-16 | quality_runner | Repository QA, quality gate, typecheck, production build, renderer smoke, workflow smoke, 30-project runtime smoke, native desktop project IO, and sample-audio QA schema 9 passed. Runtime repaired 512/512/512/64 events to 1/1/1/16 across 6/6 paths, produced a 1,903-byte direct MIDI and 4,323,996-byte direct WAV, and stopped at 16 unique chord steps. Sample QA generated 31/31 playable WAVs and 23/23 full mixes with tail content. |
| 2026-07-16 | review_judge | Separate post-QA review found repeated normalization of the same parser-bypass Pattern per arrangement bar or realtime step. Render/MIDI now normalize three Patterns once per operation, realtime playback caches immutable Pattern and automation references, and offline automation gain is computed once per stereo frame. Post-review QA, typecheck, runtime smoke, sample-audio QA, diff checks, and production build passed. |
| 2026-07-16 | review_judge | Final review approved plan-1476 with no blocking, major, or moderate findings. Human listening and external distribution remain explicit manual/private boundaries. |
| 2026-07-16 | quality_runner | Full local `release:check` and completion-summary refresh passed after review. The refreshed release evidence reports 21/21 source artifacts, 100.0% local release readiness, latest completed plan 1476, overall completion 99.999999%, and current 1471-1480 progress 6/10; external signing, notarization, channel metadata, and human listening remain private/manual proof boundaries. |
