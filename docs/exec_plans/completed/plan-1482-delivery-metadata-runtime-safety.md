# plan-1482-delivery-metadata-runtime-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Make direct runtime BPM and key repair consistent across rendered audio, MIDI metadata, Handoff Sheet output, delivery manifests, and durable project JSON. Prevent one local delivery bundle from describing a different tempo or key than the project and audio it contains, preserve canonical output, and prove repaired direct and imported projects create the same playable sample WAV and MIDI bytes.

## Evidence and Motivation

Controlled reproduction on synchronized main `5de2c15e` used a valid one-bar starter project with direct parser-bypass `bpm=0` and `key="H major"`. Durable serialization repaired the project to `60 BPM / A minor`, and direct/imported WAV bytes already matched at 970,244 bytes. However, the direct MIDI embedded `Key: H major` and differed from imported MIDI, while the direct Handoff Sheet reported `BPM: 0` and `Key: H major` and the delivery manifest stored the same raw values. A single delivery package can therefore contain normalized project JSON and audio but contradictory producer-facing metadata.

## Non-Goals

- Changing the supported 60–220 BPM range, key list, tempo grid, pitch generation, arrangement, or sound design.
- Rewriting authored pattern pitches when a project key is repaired.
- Adding tempo maps, key changes, harmonic analysis, cloud metadata, publishing metadata, or external distribution.
- Treating automated WAV/MIDI metadata checks as a replacement for human listening or producer handoff review.

## Constraints

- QA completes before separate review.
- One domain-owned normalized BPM/key identity must drive delivery metadata while existing audio timing keeps using the same BPM normalizer.
- Canonical supported BPM/key projects must preserve existing deterministic WAV and MIDI bytes.
- Direct finite out-of-range BPM and unsupported string keys must match durable repair without mutating caller-owned state.
- Structurally malformed durable projects remain rejected by existing boundaries.
- The repaired sample must decode as audible PCM, retain post-boundary content, end at digital zero, rerender byte-identically, and pair with byte-identical direct/imported MIDI.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add or apply domain-owned runtime BPM/key helpers at MIDI and local delivery metadata boundaries.
- [x] Add static, runtime, and sample-audio regression coverage for direct/import parity and canonical byte stability.
- [x] Run targeted QA, actual WAV QA, separate review, full release check, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make delivery BPM/key metadata consistency the plan-1482 target. | Direct WAV timing already follows repaired tempo, but MIDI, Handoff, and manifest metadata can contradict the serialized project and audio in the same local package. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1482 from clean synchronized main `5de2c15e`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction confirmed direct/imported WAV parity but contradictory direct MIDI key text, Handoff BPM/key, and manifest BPM/key for a source repaired from `0 BPM / H major` to `60 BPM / A minor`. |
| 2026-07-16 | harness_builder | Added domain-owned runtime BPM/key helpers and applied them to step timing, MIDI tempo/key metadata, Handoff Sheet identity, and delivery manifests without mutating caller-owned project state. |
| 2026-07-16 | quality_runner | Typecheck, static QA, runtime/harness, quality gate, build, renderer, workflow, persona, and sample-audio QA passed. Schema 15 produced 39/39 playable digital-zero WAVs, 31/31 full mixes with tail content, 11/11 isolated unrelated edits, and byte-identical direct/imported WAV and MIDI output for the repaired sample. |
| 2026-07-16 | review_judge | Separate post-QA review found no blocking, major, or moderate issue. A 2,000,001-value BPM helper sweep and all 1,449 supported BPM/key pairs proved bounded idempotent repair, canonical MIDI/Handoff/manifest stability, and safe `82 BPM / A minor` defaults for non-finite or unsupported direct identity. |
| 2026-07-16 | quality_runner | `npm run release:check` passed quality, renderer, workflow, persona, runtime, 39-WAV sample audio, delivery/reopen, native/packaged/PKG/installed project I/O, live app launch, packaging, ad-hoc signing, DMG, PKG, payload, simulated install, privacy, and release-readiness smoke checks. |
| 2026-07-16 | project_lead | Completed local scope. Human listening and private Developer ID signing, notarization, Gatekeeper acceptance, release-channel metadata, and external distribution remain explicit manual/external boundaries rather than claims of this plan. |
