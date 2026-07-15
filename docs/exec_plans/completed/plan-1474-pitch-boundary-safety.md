# plan-1474-pitch-boundary-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Keep every imported, serialized, scheduled, and rendered musical pitch inside the finite MIDI note range C-1–G9. Recover syntactically recognizable out-of-range pitches deterministically, reject malformed pitch text, and prove a formerly destructive project renders a deterministic playable WAV instead of NaN analysis and silent PCM.

## Evidence and Motivation

Controlled reproduction on synchronized main `8dc0d8e5` changed imported bass and melody pitches to `C999999`. The version-1 project parser accepted the values, `noteToFrequency("C999999")` returned positive infinity, export analysis produced non-finite peak/RMS values while reporting `Ready`, and the resulting 4,323,996-byte WAV contained zero non-zero PCM samples. A single recognizable but out-of-range note can therefore contaminate a full render and silently destroy the exported beat.

## Non-Goals

- Changing the project file version, key system, piano-roll layout, scale generation, musical arrangement, sample/import scope, or external distribution readiness.
- Expanding beyond the standard 0–127 MIDI note range or adding microtonal pitch support.
- Treating automated PCM checks as a substitute for human listening.

## Constraints

- QA completes before separate review.
- Keep pitch parsing, normalization, MIDI conversion, and frequency conversion domain-owned.
- Preserve every already-valid pitch spelling and octave byte-for-byte, including flats and sharps.
- Normalize recognizable pitches below C-1 to C-1 and above G9 to G9 at parse and serialization boundaries; reject malformed pitch strings.
- Make `noteToFrequency` finite even if an internal caller bypasses the project parser.
- Cover current, bare, legacy, and snapshot project paths without mutating caller-owned source objects.
- Render and decode a real WAV from a repaired extreme-pitch project; generated evidence remains ignored and value-free.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add a domain-owned MIDI/pitch boundary contract and finite conversion helpers.
- [x] Normalize bass/melody pitches at current, legacy, snapshot, and serialization boundaries.
- [x] Add runtime, static, and sample-audio regression coverage for extreme and malformed pitches.
- [x] Run targeted QA, actual WAV QA, separate review, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make finite pitch boundaries the plan-1474 target. | Current main demonstrably accepts an extreme octave that converts to infinity and turns a full WAV into silent PCM with non-finite analysis. |
| 2026-07-16 | Use the standard MIDI 0–127 range and preserve valid source spelling. | It is a familiar workstation boundary, stays below the 44.1 kHz Nyquist limit, and avoids rewriting valid flat/sharp project identity. |
| 2026-07-16 | Repair syntactically recognizable out-of-range pitches but reject malformed text. | Deterministic clamping can recover a local project without inventing a note from unrelated malformed content. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1474 from clean synchronized main `8dc0d8e5`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction accepted `C999999`, returned an infinite frequency, produced non-finite peak/RMS analysis with `Ready` status, and encoded a 4,323,996-byte WAV with zero non-zero PCM samples. |
| 2026-07-16 | harness_builder | Added domain-owned MIDI 0–127 pitch parsing/normalization, finite frequency conversion, current/bare/legacy/snapshot/serialization repair, shared MIDI-export conversion, and malformed-pitch rejection. |
| 2026-07-16 | quality_runner | Repository QA, typecheck, production build, renderer smoke, workflow smoke, runtime smoke, native desktop project IO, and sample-audio QA schema 7 passed. Runtime proved 5/5 normalization paths and 2/2 malformed rejections; sample QA generated 29/29 playable WAVs and 21/21 full mixes with tail content. |
| 2026-07-16 | review_judge | Separate post-QA review found that a numerically safe pitch with thousands of leading octave zeros could remain oversized and that MIDI export still duplicated pitch parsing. Canonicalized numeric octave text and routed MIDI conversion through the domain helpers. |
| 2026-07-16 | quality_runner | Post-review typecheck, repository QA, 30-project runtime smoke, production build, sample-audio QA, and diff checks passed. The repaired pitch WAV SHA-256 is `7f17e5b111db7ecd96037504165e75c225f7fda2fb6b956b6bf6e1884596fee3`. |
| 2026-07-16 | review_judge | Final review approved plan-1474 with no blocking, major, or moderate findings. Human listening and external distribution remain explicit manual/private boundaries. |
