# plan-1477-mixer-topology-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Keep every imported, serialized, edited, scheduled, and rendered project on a finite, usable mixer topology. Repair missing and duplicate local mixer channels deterministically so direct beat composition retains one controllable Drums, 808/Bass, Synth, Chord, and Master path, then prove the repaired project produces a playable sample WAV instead of silent output.

## Evidence and Motivation

Controlled reproduction on synchronized main `93b4ef30` serialized and parsed an empty mixer inside a valid 22,882-character project. The parsed project retained zero mixer channels and offline export analysis returned `Silent` with `-Infinity` peak and RMS. A second valid 321,376-character project preserved 1,000 mixer rows containing only five unique channel ids. Missing channels remove the corresponding controls and audio path, while duplicate channels are displayed repeatedly even though playback and render use only the first matching id.

## Non-Goals

- Changing the mixer channel model, adding arbitrary tracks, plugins, imported audio, sampler-first workflows, or a new FX-return editor.
- Overwriting the first valid authored channel for a known id, changing intentional mute/solo/level settings, or changing normal five-channel project sound.
- Adding cloud sync, remote AI, accounts, analytics, payments, or external distribution credentials.
- Treating automated PCM checks as a replacement for human listening.

## Constraints

- QA completes before separate review.
- Keep required mixer ids, fallback channels, ordering, deduplication, and capacity domain-owned.
- Preserve the first accepted required channel per id, preserve its valid authored settings, add only missing required channels, and discard inert FX-return rows until an explicit return editor and audio path exist.
- Preserve every canonical five-channel project at the musical-data level and do not mutate caller-owned source objects.
- Cover current, bare, legacy, snapshot, serialization, direct offline render, editor audition, and realtime scheduling paths.
- Render and decode a real WAV from a repaired empty-mixer project; generated evidence remains ignored and value-free.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add a domain-owned canonical mixer topology and deterministic missing/duplicate-channel repair.
- [x] Apply the topology to project parsing, serialization, snapshots, offline render, editor audition, and realtime scheduling.
- [x] Add runtime, static, and sample-audio regression coverage for empty, partial, duplicate, and direct parser-bypass mixer data.
- [x] Run targeted QA, actual WAV QA, separate review, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make mixer topology safety the plan-1477 target. | Current main accepts a zero-channel mixer that removes controls and produces a fully silent export despite valid musical events. |
| 2026-07-16 | Require one Drums, 808/Bass, Synth, Chord, and Master channel. | These are the established direct-composition audio paths and the only mixer rows backed by current editor and audio behavior. |
| 2026-07-16 | Preserve the first channel for each accepted id and synthesize only missing required channels from canonical defaults. | First-occurrence repair is deterministic, retains authored mix decisions, bounds work, and prevents duplicate UI rows. |
| 2026-07-16 | Drop inert imported FX-return rows from the current topology. | Separate review proved that an FX-return-only Solo could silence every audible source even though the current renderer uses an internal Space bus rather than an editable FX-return channel. Retaining a control with no matching audio path made the UI and sound engine disagree. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1477 from clean synchronized main `93b4ef30`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction accepted an empty mixer and rendered it as `Silent` at `-Infinity` peak/RMS; a second project preserved 1,000 mixer rows with only five unique ids. |
| 2026-07-16 | harness_builder | Added five required mixer ids, first-occurrence deduplication, inert FX-return removal, canonical ordering, default-only missing-channel repair, canonical identity reuse, and shared offline render/editor audition/realtime playback defenses. |
| 2026-07-16 | quality_runner | Repository QA, quality gate, typecheck, production build, renderer smoke, workflow smoke, 30-project runtime smoke, native desktop project IO, and sample-audio QA schema 10 passed. Runtime repaired 0→5 channels and 1,000→5 duplicates across 7/7 paths; sample QA generated 32/32 playable WAVs and 24/24 full mixes with tail content. `믹서-복구-비트-demo.wav` is 21.383 seconds, 3,772,004 bytes, peaks at -4.4827 dBFS, has -23.6837 dBFS decoded RMS, contains 1,873,199 non-zero samples, ends at digital zero, and matches direct parser-bypass render SHA-256 `c28beca90a7c633668f16098fdadfeda1505b1ba2a8378318efb49f17224969d`. |
| 2026-07-16 | review_judge | Separate post-QA review reproduced a silent full mix when an otherwise valid inert FX-return row alone was soloed and found repeated wrapper allocation for a stable malformed mixer during realtime playback. The domain now drops inert FX-return rows, render and scheduling count only audible source ids for Solo, the realtime repaired-project wrapper is cached by project reference, and the starter derives from the same fallback map. Post-review QA, typecheck, production build, runtime smoke, sample-audio QA, and diff checks passed. |
| 2026-07-16 | review_judge | Final review approved plan-1477 with no blocking, major, or moderate findings. Human listening and external distribution remain explicit manual/private boundaries. |
| 2026-07-16 | quality_runner | Full `npm run release:check` and the completion-summary refresh passed after review. Source proof is 21/21, local release readiness is 100.0%, the current cadence is plan 1471–1480 at 7/10, and user-facing completion remains 99.999999%; Developer ID signing, notarization, Gatekeeper acceptance, update-feed publication, manual channel QA, and private distribution inputs remain external/private proof boundaries. |
