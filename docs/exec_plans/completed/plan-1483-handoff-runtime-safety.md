# plan-1483-handoff-runtime-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Make direct runtime arrangement and Session Brief values use the same bounded, single-line repair in Handoff Sheets as durable project serialization. Prevent embedded line breaks from spoofing producer-facing sections, prevent raw out-of-range bars/energy or oversized notes from contradicting rendered WAV/MIDI and saved JSON, preserve canonical handoff text, and prove repaired direct/imported projects create identical playable sample WAV, MIDI, and Handoff output.

## Evidence and Motivation

Controlled reproduction on synchronized main `cce2f884` used a valid direct starter project with one arrangement block set to `bars=0`, `energy=99`, Session Brief line breaks that inserted a fake `Export Meter` line, and a 600-character note. Direct and imported WAV/MIDI bytes matched, while durable serialization repaired the block to `1 bar / 100%`, collapsed brief whitespace, and bounded notes to 240 characters. Direct Handoff remained different: `0 bars / Energy 9900%`, embedded lines, 1,733 bytes versus the repaired 1,370-byte Handoff.

## Non-Goals

- Changing arrangement limits, section/pattern semantics, event timing, sound design, or export audio.
- Adding rich text, multiline Handoff fields, new metadata fields, cloud collaboration, or external publishing metadata.
- Treating automated text/PCM checks as a replacement for human listening or producer handoff review.

## Constraints

- QA completes before separate review.
- Handoff arrangement rows and Session Brief fields must use the same domain-owned normalization as durable serialization.
- Canonical projects must preserve existing Handoff, WAV, and MIDI bytes.
- Direct finite out-of-range bars/energy and oversized or multiline brief strings must match durable repair without mutating caller-owned state.
- Structurally malformed durable projects remain rejected by existing boundaries.
- The repaired sample must decode as audible PCM, retain post-boundary content, end at digital zero, rerender byte-identically, and pair with byte-identical direct/imported MIDI and Handoff text.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add or apply domain-owned runtime arrangement and Session Brief helpers at the Handoff boundary.
- [x] Add static, runtime, and sample-audio regression coverage for direct/import parity, injection resistance, bounds, and canonical stability.
- [x] Run targeted QA, actual WAV QA, separate review, full release check, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make Handoff arrangement/brief normalization the plan-1483 target. | Direct audio and MIDI already use repaired values, but the producer-facing Handoff can contradict them and allow multiline brief content to impersonate Handoff sections. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1483 from clean synchronized main `cce2f884`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction confirmed direct/imported WAV and MIDI parity but different Handoff text with an injected section-like line, `0 bars / 9900%`, and an unbounded 600-character note instead of durable `1 bar / 100%` and 240 characters. |
| 2026-07-16 | harness_builder | Added domain-owned runtime arrangement and Session Brief views and applied them before Handoff text generation, preserving caller-owned state and canonical text. |
| 2026-07-16 | quality_runner | Typecheck, static QA, runtime/harness, quality gate, build, renderer, workflow, persona, and sample-audio QA passed. Schema 16 produced 40/40 playable digital-zero WAVs, 32/32 full mixes with tail content, 11/11 isolated unrelated edits, and byte-identical direct/imported WAV, MIDI, and Handoff output for the repaired sample. |
| 2026-07-16 | review_judge | Separate post-QA review found no blocking, major, or moderate issue. A 2,000,001-value arrangement sweep, 10,001 brief-length cases, and 1,616 canonical Handoff combinations proved bounded idempotent repair, injection resistance, source immutability, and canonical text stability. |
| 2026-07-16 | quality_runner | Full `npm run release:check` passed, including local delivery/reopen, native/packaged/PKG payload/installed project I/O, live application launch, ad-hoc signing, DMG/PKG, simulated install, persona, privacy, and release-readiness checks. |
| 2026-07-16 | plan_keeper | Marked plan-1483 complete after QA and separate review; the completion mirror records sample hashes, residual human review boundaries, and external distribution exclusions. |
