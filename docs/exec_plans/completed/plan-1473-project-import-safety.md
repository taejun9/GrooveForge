# plan-1473-project-import-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Make the project-file boundary safe against unsupported future wrappers, oversized inputs, and out-of-range timing/audio values. Keep valid older and bare project data compatible, canonicalize accepted projects into the same bounds exposed by the UI, and prove a repaired malformed project still produces deterministic playable audio.

## Evidence and Motivation

Controlled reproduction on synchronized main `46e1ad1e` accepted a wrapped `fileVersion: 99` project with BPM `-120`, swing `4`, master ceiling `+18 dB`, and a mixer channel at `+900 dB`. The parsed project retained every unsafe value and produced a negative step duration of `-0.125` seconds. Accepting an unknown future wrapper can silently discard future-only data on save, while unsafe numeric state can break scheduler/render assumptions even though the visible controls constrain BPM to 60–220, swing to 0–0.24, mixer volume to -36–+3 dB, pan to -100–+100, and master ceiling to -6–0 dB.

## Non-Goals

- Changing musical content, project schema version, supported style profiles, export format, filenames, sampling scope, remote behavior, or external distribution readiness.
- Guessing how future project versions should migrate; unknown wrapped versions must fail clearly rather than open and resave destructively.
- Replacing human listening or manual recovery judgment with automated PCM checks.

## Constraints

- QA completes before separate review.
- Keep bounds domain-owned so parser, serializer, UI, playback, and export cannot drift.
- Preserve current version-1 wrapped files, bare current project data, legacy single-pattern files, and existing valid roundtrip hashes/content.
- Reject oversized source text before `JSON.parse` and reject unsupported/malformed GrooveForge wrappers without mutating the current UI project.
- Normalize accepted current/legacy values into UI-safe BPM, swing, mixer volume/pan, and master ceiling bounds at import and durable serialization boundaries.
- Create and decode a real WAV from the repaired malformed project; generated evidence stays ignored and value-free.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add a domain-owned project-file size, version, BPM, swing, mixer, and master safety contract.
- [x] Apply canonical normalization to current/legacy import and durable serialization.
- [x] Reuse domain constants/normalizers from UI helpers to remove duplicated bounds.
- [x] Add runtime, renderer/static, project IO, and sample-audio regression coverage.
- [x] Run targeted QA, actual WAV QA, separate review, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-15 | Make project import safety the plan-1473 target. | Current main demonstrably accepts unknown future wrappers and audio/timing values that violate its own visible control bounds and create negative playback time. |
| 2026-07-15 | Reject unknown wrapped versions but normalize unsafe values in recognized current/legacy data. | Version mismatch risks irreversible data loss, while bounded normalization lets users recover otherwise recognizable local projects instead of losing their beat. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-15 | project_lead | Created plan-1473 from clean synchronized main `46e1ad1e`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-15 | quality_runner | Pre-fix reproduction accepted `fileVersion: 99`, BPM `-120`, swing `4`, master ceiling `+18 dB`, mixer `+900 dB`, and produced a `-0.125` second step duration. |
| 2026-07-15 | harness_builder | Added fail-closed wrapper version/size checks, domain-owned BPM/key/swing/mixer/master normalization for parse and serialization, shared UI bounds, actionable load errors, and the missing F# minor selector required by the existing Jersey Drive blueprint. |
| 2026-07-15 | quality_runner | Repository QA, typecheck, production build, renderer smoke, workflow smoke, runtime smoke, and sample-audio QA schema 6 passed. Runtime rejected future/missing versions and oversized input 3/3; sample QA generated 28/28 playable digital-zero WAVs and 20/20 full mixes with tail content. The repaired import WAV SHA-256 is `d75c7a5ddb0fe239a5e6cd4a5c06e1054382a927e6bcdc8b918c5f0b788ee550`. |
| 2026-07-15 | quality_runner | Native desktop project save/open smoke passed with an exact 26,198-byte roundtrip. Browser and native paths now reject over-limit files before loading their full contents, and native save IPC enforces the same character ceiling. |
| 2026-07-15 | review_judge | Separate post-QA review found two safety gaps: serialization could create a file the parser refused, and file-size checks happened after full reads. Added serialization/save-boundary handling plus browser/native pre-read guards, then reran the affected smoke and sample suites. |
| 2026-07-15 | quality_runner | Post-review production build, repository QA, renderer smoke, runtime smoke, sample-audio QA, and diff checks passed. Runtime now covers import and serialization size limits 4/4; all 28 WAVs and 20 full mixes remain valid and deterministic. |
| 2026-07-15 | review_judge | Final review approved plan-1473 with no blocking, major, or moderate findings. Remaining distribution and listening limits are documented as external/manual boundaries rather than product-file regressions. |
