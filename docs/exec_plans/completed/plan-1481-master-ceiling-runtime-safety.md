# plan-1481-master-ceiling-runtime-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Make every direct runtime consumer use the same bounded -6–0 dB master Ceiling contract as project import and durable serialization. Prevent parser-bypass state from silencing audio or producing false export-meter/headroom data, keep canonical projects byte-stable, and prove repaired direct and imported projects create the same playable sample WAV.

## Evidence and Motivation

Controlled reproduction on synchronized main `813391e5` rendered the same valid one-bar starter project through direct in-memory state and `parseProjectFile`. With `masterCeilingDb=-900`, direct rendering returned a limiter-active analysis at -900 dB but encoded a completely silent 709,948-byte WAV (`nonZero=0`, SHA-256 `3a9ff32e8976b4001ac423c7ec7e992b85c33bda672fbf0f2990ac53106cd63f`); imported repair clamped to -6 dB and produced 330,229 non-zero PCM samples (SHA-256 `5a5ffa1fe6d7a06c1656282511a6ea047db6c9bb0dd9c77b98af545fb8c85503`). With `masterCeilingDb=18`, direct and imported PCM happened to match, but direct analysis falsely reported an 18 dB ceiling and 22.877 dB headroom instead of the imported 0 dB ceiling and 4.877 dB headroom. Realtime playback and editor audition also convert the unbounded direct value to gain.

## Non-Goals

- Changing the editor's -6–0 dB range, master preset definitions, limiter design, mixer gain, automation, or project schema.
- Adding LUFS, true-peak, platform loudness targets, auto-mastering, reference tracks, or remote analysis.
- Treating automated PCM checks as a replacement for human listening or mastering judgment.

## Constraints

- QA completes before separate review.
- One domain-owned normalized Ceiling value must drive offline limiting and analysis, realtime playback, editor audition, and direct local delivery readouts where applicable.
- Canonical -6–0 dB projects must preserve existing deterministic WAV bytes and analysis.
- Direct finite out-of-range values must match imported repair without mutating caller-owned project state.
- Non-finite or structurally malformed durable projects remain rejected by existing boundaries.
- The repaired sample must decode as audible real PCM, respect its normalized ceiling, retain post-boundary content, end at digital zero, and rerender byte-identically.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add or apply a domain-owned runtime master Ceiling helper at all direct audio/readout boundaries.
- [x] Add static, runtime, and sample-audio regression coverage for low/high direct-import parity and canonical byte stability.
- [x] Run targeted QA, actual WAV QA, separate review, full release check, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make direct master Ceiling safety the plan-1481 target. | A parser-bypass finite value can silently mute the entire exported and realtime project or make the export meter report impossible Ceiling/headroom values, while imported state behaves differently. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1481 from clean synchronized main `813391e5`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction confirmed direct `-900 dB` output is digital silence while imported repair is audible at -6 dB, and direct `+18 dB` analysis reports false Ceiling/headroom even when PCM matches imported 0 dB repair. |
| 2026-07-16 | harness_builder | Added one domain-owned runtime Ceiling helper and applied it to offline limiting/analysis, realtime playback, editor audition, and Handoff Sheet output without mutating caller-owned state. |
| 2026-07-16 | quality_runner | Typecheck, static QA, runtime, quality gate, build, renderer, workflow, persona, and sample-audio QA passed. Schema 14 produced 38/38 playable digital-zero WAVs, 30/30 full mixes with tail content, and the repaired sample remained audible at -6 dB with imported hash parity. |
| 2026-07-16 | review_judge | Separate post-QA review found no blocking issue. A 2,000,001-value property sweep proved bounded idempotent helper behavior; canonical 0 dB and -6 dB WAV hashes remained `4dba45a6…` and `5a5ffa1f…`, while direct +18/-900 values matched those canonical outputs. |
| 2026-07-16 | quality_runner | `npm run release:check` passed quality, renderer, workflow, persona, runtime, 38-WAV sample audio, delivery/reopen, native/packaged/PKG/installed project I/O, live app launch, packaging, ad-hoc signing, DMG, PKG, payload, simulated install, privacy, and release-readiness smoke checks. |
| 2026-07-16 | project_lead | Completed local scope. Human listening and private Developer ID signing, notarization, Gatekeeper acceptance, release-channel metadata, and external distribution remain explicit manual/external boundaries rather than claims of this plan. |
