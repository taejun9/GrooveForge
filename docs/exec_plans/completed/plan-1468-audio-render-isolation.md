# plan-1468-audio-render-isolation

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Fix the confirmed offline-render isolation defect where an unrelated project or mixer edit changes another track's deterministic noise waveform, then extend decoded-PCM QA across every supported style and critical mixer isolation states. A producer must be able to compare channel changes and regenerate stems without an untouched drum track silently receiving different noise samples.

## Evidence and Motivation

`createRenderNoiseSeed` currently hashes the whole project BPM, selected Pattern, all Pattern data, sound design, complete mixer, arrangement, and master ceiling. A controlled reproduction changed only the Synth channel volume by -1 dB in the built-in beginner project; the unchanged Drums stem kept the same byte length but changed SHA-256 from `8cb151eeb11713e125f280b6e0d0b9e9084f7c62ae625a87cf021bb42f8154f2` to `da7aff218e9ce1e2985cfdd94d502bdd6bfc0dafaa49871f592705e6977f2b73`. The Synth edit therefore changed the drum noise waveform even though it cannot legitimately affect drum synthesis, timing, processing, or routing.

The existing sample-audio QA deeply decodes two representative audience projects. Runtime smoke covers every style but checks only WAV markers and renderer analysis. No current gate proves that unrelated channel edits leave target stems byte-identical or that all 14 style mixes decode into canonical, audible, ceiling-safe PCM.

## Non-Goals

- Imported audio, sampling, reference-track analysis, recording, microphones, plugin hosting, spectral matching, LUFS, true peak, mastering certification, remote services, accounts, analytics, or cloud sync.
- Making unrelated musical edits produce identical output. Changes to a target track's events, velocity, timing, sound parameters, mixer channel, arrangement mute map, master output, automation, tempo, or render length may legitimately change that target stem.
- Replacing realtime Web Audio synthesis with the offline renderer or claiming sample-identical realtime/offline waveforms.
- Changing file names, project schema, download behavior, arrangement rules, style definitions, mixer UI, master presets, or external release posture.

## Constraints

- QA completes before separate review.
- Keep noise deterministic without hashing unrelated project state into the generated sample sequence.
- Prove target-stem isolation for non-target volume, pan, mute, solo, EQ, Drive/Glue, and Space-send edits; prove selected-Pattern-only edits do not change arrangement renders when the arrangement route is unchanged.
- Preserve legitimate sensitivity: target-channel edits and relevant drum/noise musical edits must still change the expected output.
- Decode full-mix WAV output for all supported style profiles and verify canonical stereo 44.1kHz/16-bit PCM, duration, audibility, channel population, peak/RMS agreement, ceiling safety, no digital full-scale samples, and deterministic rerenders.
- Keep generated WAV/JSON/Markdown evidence ignored under `build/desktop`; record no real user audio, private projects, credentials, URLs, environment values, or external distribution claims.

## Implementation Plan

- [x] Replace whole-project noise seeding with a stable event-local scheme that is independent of unrelated mixer, note, selection, and master state.
- [x] Add regression checks for non-target stem isolation and legitimate target/noise sensitivity.
- [x] Extend sample audio QA with decoded full-mix coverage for all 14 supported styles while retaining playable beginner/professional mix and stem artifacts.
- [x] Update durable quality/product/harness documentation and required command contracts.
- [x] Run targeted audio QA, repository QA, full verify, inspect regenerated samples, then complete a separate review and required worktree merge/push/cleanup flow.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-15 | Make offline render isolation the plan-1468 target. | A controlled main-branch reproduction proved an unrelated Synth level edit changes the untouched Drums stem bytes because the noise seed hashes the entire project. |
| 2026-07-15 | Extend the existing sample-audio QA rather than add a parallel command. | The command already owns canonical PCM parsing, audience sample artifacts, deterministic rerender checks, and full-verify integration; the missing isolation/style matrix belongs in the same audio acceptance boundary. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-15 | project_lead | plan-1468 created from clean synchronized main `7a5e017c` in `codex/plan-1468-audio-render-isolation`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-15 | quality_runner | Baseline reproduction confirmed equal 3,938,280-byte Drums stems with different SHA-256 values after only a non-target Synth `volumeDb` edit; this contradicts channel isolation and provides the pre-fix regression fixture. |
| 2026-07-15 | harness_builder | Replaced the whole-project noise hash with an event-local seed derived only from a stable GrooveForge salt, noise-event index, start frame, duration frames, and brightness. Unrelated mixer, selected-Pattern, and non-drum note state no longer changes the source waveform, while relevant noise timing/shape/order still determines the seed. |
| 2026-07-15 | harness_builder | Expanded `sample-audio:qa` to write and decode one 8-bar full mix for all 14 styles in addition to both audience mixes and eight stems. Added 11 Drums-stem isolation cases, target mixer and hat-noise sensitivity checks, Drums solo/stem equality, and all-style content uniqueness. |
| 2026-07-15 | quality_runner | Targeted sample-audio QA passed with 24 playable WAVs, 14/14 style PCM cases, 11/11 unrelated edits isolated, target/noise sensitivity, and solo/stem equality. Style peaks span -5.97 to -2.73 dB and RMS spans -24.89 to -19.23 dB; every artifact is canonical audible ceiling-safe deterministic PCM. |
| 2026-07-15 | quality_runner | Typecheck, renderer smoke, 30/30 runtime project/export roundtrips, and diff checks passed. The first repository QA rerun correctly failed because its old static contract still required the removed whole-project `stableStringify`/`hashString`; that stale requirement was replaced with the event-local seed contract, after which repository QA passed. |
| 2026-07-15 | quality_runner | Full `npm run verify` exited 0. It passed the 24-WAV decoded-PCM/isolation matrix, live source Electron, native project IO, packaged/ad-hoc/PKG-payload/installed launches, packaged/payload/installed project IO, DMG/PKG construction, privacy/value-leak checks, and value-free external release blockers. |
| 2026-07-15 | review_judge | Post-QA review approved the implementation with no blocking, major, or moderate findings. Event-local seeding removes unrelated state coupling while retaining target mixer and relevant noise-sound sensitivity; all-style uniqueness, same-state solo/stem equality, and ignored value-free artifact boundaries are covered. |
| 2026-07-15 | quality_runner | Final sample regeneration after full verify passed with 24 playable WAVs. The beginner mix is 22.33 seconds, -4.40 dB peak/-21.68 dB RMS, SHA-256 `34e922d050fbf98f296ecb88068299eb108640f1a37a2568b74112d56999718c`; the professional mix is 50.32 seconds, -3.28 dB peak/-20.02 dB RMS, SHA-256 `ed91678d10e9fea95904f066cba7971c7ab960c2d8e5414239dab7af8955c8d2`. |
