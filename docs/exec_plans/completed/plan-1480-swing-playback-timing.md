# plan-1480-swing-playback-timing

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Make the existing Swing control audibly and deterministically change offbeat timing in realtime playback, offline WAV/stem rendering, and arrangement MIDI export. Keep the bar grid and even sixteenth notes fixed, delay odd sixteenth onsets by the bounded project swing amount, combine swing with authored drum microtiming, and prove the same project produces distinct playable straight and swung sample WAVs.

## Evidence and Motivation

Controlled reproduction on synchronized main `24570cea` rendered the same starter beat with `swing=0` and `swing=0.24`. The WAV files had the same SHA-256 `3a060d2af0f11c91b23dadcdcb01d88182836ea3c8aba14ac1bd18ca4f8c7355`, and the MIDI files had the same SHA-256 `91c33c295a8e79d437b64ddd2c76a0648b3b453b029b2b5989ad4bec8e78891b`. Source search also found no audio-engine use of `project.swing`; the visible saved control changed labels and project state without changing heard timing.

## Non-Goals

- Rewriting authored drum microtiming arrays, quantizing notes, changing event velocities/probabilities, or mutating project data.
- Adding triplet grids, groove extraction, imported audio analysis, recording, sampling, or tempo automation.
- Changing the project schema, Swing UI range, style-profile defaults, arrangement length, or sound synthesis design.
- Treating automated PCM timing checks as a replacement for human listening.

## Constraints

- QA completes before separate review.
- One domain-owned swing offset contract must drive realtime, WAV/stem, and MIDI timing.
- Swing `0` must preserve current byte output; bounded positive swing delays only odd sixteenth onsets and must not change total bars or frame count.
- Authored drum timing offsets remain additive and bounded by their existing contract.
- Direct in-memory/parser-bypass callers must use bounded BPM and swing values without crashing or disagreeing with imported repair.
- Realtime step feedback must follow the heard swung onset rather than the unswung grid timestamp.
- The straight and swung samples must decode as real PCM, have equal duration, differ deterministically, retain post-boundary content, end at digital zero, and expose measurable odd-step delay.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add domain-owned bounded step duration and odd-sixteenth swing offset helpers.
- [x] Apply the shared timing contract to offline render, MIDI export, realtime scheduling, and step feedback.
- [x] Add runtime, static, and paired sample-audio regression coverage for straight/swung timing and parser-bypass parity.
- [x] Run targeted QA, actual WAV QA, separate review, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make audible Swing timing the plan-1480 target. | A visible, saved production control produced byte-identical WAV and MIDI output at 0% and 24%, so users could not trust the groove they set. |
| 2026-07-16 | Interpret Swing as an odd-sixteenth onset delay measured in fractions of one sixteenth step. | This preserves even grid anchors and bar duration while giving realtime, PCM, and MIDI a small deterministic shared contract. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1480 from clean synchronized main `24570cea`; the unrelated plan-085 worktree remained untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction confirmed `swing=0` and `swing=0.24` produced byte-identical WAV and MIDI files, and source inspection found no playback-engine reference to `project.swing`. |
| 2026-07-16 | harness_builder | Added one bounded odd-sixteenth timing contract to realtime scheduling and feedback, WAV/stem rendering, and MIDI export; 0% Swing retains the straight grid and authored drum microtiming stays additive. |
| 2026-07-16 | quality_runner | Runtime, static, sample-audio, quality-gate, build, renderer, workflow, and persona checks passed. Sample-audio schema 13 passed 37/37 playable WAVs, 37/37 digital-zero endings, 29/29 full mixes with post-boundary content, and 11/11 isolation checks. The paired 120 BPM samples retained equal 2.75-second duration while the 24% sample moved the decoded odd onset exactly 1,323 frames / 30 ms. |
| 2026-07-16 | review_judge | Separate post-QA review found no blocking, major, or moderate finding. A deterministic property sweep covered 8,333,000 BPM/Swing/step cases with monotonic onsets, fixed even steps and bar boundaries, and no maximum-Swing event-order inversion. |
| 2026-07-16 | quality_runner | `npm run release:check` reached its final external-completion resume packet after passing quality, renderer, workflow, persona, runtime, 37-WAV sample audio, delivery/reopen, native/packaged/PKG/installed project I/O, app launch, packaging, ad-hoc signing, DMG, PKG, payload, simulated install, privacy, and release-readiness smoke checks. |
| 2026-07-16 | project_lead | Completed local scope. Human listening and private Developer ID signing, notarization, Gatekeeper acceptance, release-channel metadata, and external distribution remain explicit manual/external boundaries rather than claims of this plan. |
