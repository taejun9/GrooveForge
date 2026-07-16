# plan-1484-snapshot-runtime-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Make snapshot creation, restoration, and producer-facing summaries use the same bounded project-core repair as durable project serialization. Prevent direct runtime boundary values from being stored and later restored as contradictory UI state while WAV, MIDI, Handoff, and saved JSON silently use repaired values. Prove repaired direct and imported snapshot paths create identical playable WAV, MIDI, and Handoff output without mutating caller-owned state.

## Evidence and Motivation

Controlled reproduction on synchronized main `72fd157d` saved a direct starter project with `0 BPM / H major`, swing `99`, master ceiling `+999 dB`, one `0 bars / 9900%` block, multiline Session Brief text, and a 600-character note. The new snapshot summary displayed `H major / 0 BPM / 1 bars`, and restore reintroduced every raw value. Durable serialization repaired the same restored project to `60 BPM / A minor`, swing `0.24`, ceiling `0 dB`, `1 bar / 100%`, single-line brief text, and 240 note characters. WAV and MIDI bytes already matched because downstream render boundaries repair these fields, exposing the contradiction specifically in snapshot state and UI identity.

## Non-Goals

- Changing snapshot capacity, ordering, timestamp format, comparison UX, or undo/redo behavior.
- Changing BPM, key, swing, mixer, arrangement, Session Brief, master ceiling, or other established normalization limits.
- Adding cloud snapshots, accounts, remote storage, or collaboration.
- Treating automated text/PCM checks as a replacement for human listening or snapshot workflow review.

## Constraints

- QA completes before separate review.
- Snapshot creation and restoration must use one domain-owned project-core normalization boundary shared with durable serialization.
- Snapshot summaries must report repaired BPM, key, and bounded total bars.
- Canonical snapshots must preserve existing identity, project values, and audio/MIDI/Handoff bytes.
- Snapshot ID collision repair and caller-owned source immutability must remain intact.
- Structurally malformed durable projects remain rejected by existing boundaries.
- The repaired sample must decode as audible PCM, retain post-boundary content, end at digital zero, rerender byte-identically, and pair with byte-identical direct/imported MIDI and Handoff text.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Expose/apply domain-owned project-core runtime repair for snapshot creation, restoration, and summary identity.
- [x] Add static, runtime, and sample-audio regression coverage for direct/import parity, bounds, identity repair, and source immutability.
- [x] Run targeted QA, actual WAV QA, separate review, full release check, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make snapshot project-core normalization the plan-1484 target. | Snapshot save/restore can reintroduce raw direct state that contradicts repaired audio, MIDI, Handoff, and durable JSON while showing producer-facing `0 BPM / H major` identity. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1484 from clean synchronized main `72fd157d`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction confirmed snapshot summary `H major / 0 BPM / 1 bars` and raw restore values versus durable `A minor / 60 BPM / 1 bar`; downstream WAV and MIDI already matched because their runtime boundaries repair the raw state. |
| 2026-07-16 | harness_builder | Snapshot creation and restoration now apply the durable project-core normalizer, while summaries read the repaired BPM, key, and bounded arrangement identity without mutating the caller. |
| 2026-07-16 | quality_runner | Typecheck, static QA, runtime smoke, quality gate, build, renderer, workflow, persona, and sample-audio QA passed. Schema 17 produced 41/41 playable digital-zero WAVs, 33/33 full mixes with tail content, 11/11 isolated unrelated edits, and byte-identical restored/imported WAV, MIDI, and Handoff output for the repaired sample. |
| 2026-07-16 | review_judge | Separate post-QA review found no blocking, major, or moderate issue. A 20,001-value scalar sweep and all 1,449 supported BPM/key combinations proved bounded snapshot capture, canonical core stability, repaired summaries, restore parity, and source immutability. |
| 2026-07-16 | quality_runner | Full `npm run release:check` passed, including local/packaged/PKG payload/installed project I/O, live Electron launch, simulated install, packaging, ad-hoc signing, hardened-runtime readiness, DMG/PKG, privacy, and release-readiness checks. External distribution remained safely blocked on private credentials and operator evidence. |
| 2026-07-16 | plan_keeper | Marked plan-1484 complete after QA-before-review, full release verification, deterministic sample evidence, and review approval. |
