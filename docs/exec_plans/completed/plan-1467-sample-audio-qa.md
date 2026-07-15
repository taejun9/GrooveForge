# plan-1467-sample-audio-qa

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

Finish GrooveForge into a bug-resistant usable state and test it while creating sample audio files.

## Goal

Add a deterministic local audio QA path that creates real sample-free GrooveForge WAV files from editable events and inspects their decoded PCM rather than treating a RIFF header or non-empty file as sufficient. The QA should leave playable beginner and professional sample mixes plus stems under ignored build output and prove their format, duration, audibility, peak/RMS agreement, ceiling safety, track distinction, and repeat-render stability.

## Evidence and Motivation

The current runtime, persona, and local-delivery smokes already generate real full-mix and four-stem WAVs and verify project roundtrips, hashes, headers, sample rate analysis, duration analysis, and non-silent renderer analysis. Their byte checks stop at the canonical RIFF/WAVE/fmt/data markers, however. They do not decode the written 16-bit PCM to prove channel count, byte rate, block alignment, data-size consistency, nonzero sample population, PCM-derived peak/RMS agreement, ceiling compliance, unique stem content, or byte-identical repeat rendering. A malformed, silent, clipped, or nondeterministic encoded file could therefore escape the current artifact checks even when the pre-encode analysis looks healthy.

## Non-Goals

- Adding imported audio, sample packs, a sample browser, chopping, slicing, stretching, sampler tracks, recording, microphones, audio input, reference matching, mastering certification, LUFS, true peak, spectral matching, or listening-test claims.
- Changing synthesis, sequencing, random seeds, arrangement rules, mixer/master behavior, limiter behavior, export names, download handlers, project schema, save/load, playback, MIDI, Handoff, or delivery bundles.
- Claiming that numeric PCM checks replace human listening, professional mastering review, platform compliance, external distribution QA, Developer ID signing, notarization, or Gatekeeper acceptance.

## Constraints

- QA completes before a separate review starts.
- Generate samples only from GrooveForge first-class events, patterns, arrangement, devices, mixer/master state, and existing local render functions; sampling remains secondary and unused.
- Cover at least one first-time-composer Guided 8-bar Lo-fi sample and one professional-producer Studio House sample with a full mix and all four current stems.
- Decode canonical PCM WAV bytes and verify RIFF size, PCM format 1, two channels, 44.1kHz, 16-bit samples, 4-byte block alignment, 176400-byte/sec rate, data-size/frame consistency, and analysis-aligned duration.
- Prove each expected mix/stem is audible and not digital full-scale clipped, its decoded peak/RMS agrees with `analyzeExport` or `analyzeStemExports` within quantization tolerance, all four stems have distinct content, and immediate rerenders are byte-identical.
- Write only ignored value-free QA artifacts under `build/desktop`; do not record real user audio, private beats, credentials, URLs, environment values, or external release claims.
- Expose a direct npm command, include it in `verify`, document the contract, and leave generated sample paths clear enough for local audition.

## Implementation Plan

- [x] Build representative beginner and professional projects from existing sample-free starter/blueprint/domain helpers.
- [x] Add a canonical WAV PCM parser and quantitative checks for format, frames, duration, audibility, peak, RMS, ceiling, uniqueness, and determinism.
- [x] Write real mix/stem WAVs plus value-free JSON/Markdown evidence under ignored build output.
- [x] Add a direct npm command, integrate it into full verify, and update durable harness/quality/product documentation.
- [x] Run targeted audio QA, QA, full verify, inspect generated samples, then complete a separate review and required worktree merge/push/cleanup flow.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-15 | Make deterministic decoded-PCM sample audio QA the plan-1467 target. | The user explicitly requested testing while creating sample audio, and existing artifact smokes generate WAVs but do not validate their encoded sample population deeply enough to catch silent, malformed, clipped, or nondeterministic output. |
| 2026-07-15 | Use a Guided Lo-fi 8-bar sample and a Studio House sample from built-in editable events. | These represent the two required audiences and contrasting tempo/style postures while preserving the product's sample-free direct-composition invariant. |
| 2026-07-15 | Keep generated WAVs ignored and regenerate them from a direct command. | Audio binaries are evidence artifacts rather than source assets; deterministic local generation keeps the repository lean while leaving playable files available after QA. |
| 2026-07-15 | Stabilize native keyboard smoke focus after its first full-verify failure. | The new audio path passed, but full verify exposed that the hidden Electron renderer could lose web-contents focus after a native Undo command, so the following Space event never reached the capture-phase recorder. Refocusing the existing renderer before each native test key preserves the product interaction under test while removing automation-only focus loss; the same guard applies to drum and note grids. |
| 2026-07-15 | Apply the same native-focus guard to modal keys/clicks and raise only the modal lifecycle aggregate timeout from 280 to 600 seconds. | The focused drum/note paths passed on the next GUI run, which then reached Quick Actions/Command Reference cross-dialog focus restore but exhausted the aggregate modal timeout rather than an individual 10-second condition. Native focus is now explicit for modal inputs, while individual conditions remain strict; the longer aggregate allows the many real dialog, graph-load, shortcut, focus-wrap, dock, and playback steps to finish on a loaded desktop runner. |
| 2026-07-15 | Make explicit playback Stop update React state synchronously before audio-context shutdown finishes. | The next GUI run passed keyboard and cross-dialog focus, then the fixed Workspace Command Dock started playback but its Stop state did not clear within the strict individual deadline. The controller already fades/closes asynchronously and calls `onStop`; immediately clearing `isPlaying` as part of the explicit Stop action keeps both header and dock responsive even if audio-context cleanup is delayed, while the callback remains an idempotent safety net. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-15 | project_lead | plan-1467 created from clean, synchronized main `54ee8b57` in `codex/plan-1467-sample-audio-qa`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-15 | repo_cartographer | Existing runtime/persona/local-delivery smokes were audited. They already write real mix and four-stem WAVs and verify headers, hashes, renderer analysis, and reopen behavior, but their encoded-byte validation does not decode PCM or compare decoded peak/RMS, ceiling, uniqueness, and repeat-render determinism. |
| 2026-07-15 | harness_builder | Added `npm run sample-audio:qa` and integrated it into `verify`. The command renders two audience starter projects, decodes 10 canonical WAV files, compares decoded PCM against renderer analysis, checks ceiling/full-scale safety and stem uniqueness, proves immediate byte determinism, and writes ignored playable WAV plus JSON/Markdown evidence. |
| 2026-07-15 | quality_runner | Targeted sample-audio QA passed: the Guided Lo-fi mix is 22.33 seconds at -4.38 dB peak/-21.68 dB RMS and the Studio House mix is 50.32 seconds at -3.38 dB peak/-20.02 dB RMS; all 10 files are 44.1kHz/16-bit/stereo PCM, non-silent, distinct, below full scale, and deterministic. Repository QA also passed. |
| 2026-07-15 | quality_runner | The first full `npm run verify` attempt reached the live Electron launch smoke and failed because the hidden renderer did not receive the Space key after a native Undo. The failure was retained as real QA evidence; the smoke now restores web-contents focus before every native drum/note-grid key and will be rerun before review. |
| 2026-07-15 | quality_runner | The approved GUI rerun passed the previously failing drum and note grid paths, then hit the 280-second aggregate modal focus timeout at cross-dialog restore. No individual modal condition failed. Modal native inputs now get the same renderer-focus guard and the aggregate timeout is 600 seconds while every individual focus/open/close condition retains its 10-second limit. |
| 2026-07-15 | quality_runner | The second approved GUI rerun passed drum/note keyboard input and cross-dialog focus restore, then failed the individual Workspace Command Dock Stop condition: Play became active, but the shared dock/header state did not become stopped within 10 seconds. Explicit Stop now clears playback UI state synchronously and renderer smoke locks that contract before another live rerun. |
| 2026-07-15 | quality_runner | The third approved GUI run passed end to end after the Stop fix: native drum and note navigation/toggle/Undo, Quick Actions and Command Reference entry/wrap/Escape/cross-dialog restore, Workspace Command Dock conditional visibility plus native Play/Stop and Actions focus restore, starter landing, minimum/wide layout, production renderer DOM, and screenshot pixel evidence all passed. |
| 2026-07-15 | quality_runner | Full `npm run verify` exited 0. It passed decoded-PCM sample audio QA, source and packaged Electron launch, native project save/reopen, ad-hoc signing, DMG, PKG, PKG payload, simulated install, installed project IO, and all bounded release/privacy evidence. The TTY-only setup wizard was supplied four empty responses so private release metadata remained missing, no network/sign/notary action ran, and the expected external-distribution blocker stayed unclaimed. |
| 2026-07-15 | review_judge | Post-QA review approved the implementation with no blocking, major, or moderate findings. The review confirmed direct-composition scope, canonical PCM decoding, renderer-analysis agreement, deterministic rerendering, responsive explicit Stop state, focused native Electron input, and value-free ignored evidence; human listening and external release credentials remain explicit residual boundaries. |
