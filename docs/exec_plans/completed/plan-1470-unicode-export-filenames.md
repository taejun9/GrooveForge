# plan-1470-unicode-export-filenames

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Prevent non-English project titles from collapsing to identical fallback export names or malformed dash-only WAV names. Introduce one Unicode-safe, filesystem-bounded project file stem for project JSON, mix/stem WAV, MIDI, Handoff Sheet, and Delivery Bundle ZIP output, then prove distinct Korean titles produce distinct real sample WAVs and complete delivery identities.

## Evidence and Motivation

Current filename helpers independently strip everything outside ASCII `a-z0-9`. Controlled reproduction on synchronized main showed `서울 비트`, `부산 비트`, `東京ビート`, and `🔥 새 비트` all produce `grooveforge-project.grooveforge.json`, `grooveforge-arrangement.mid`, `grooveforge-project-handoff.txt`, and `grooveforge-project-delivery-bundle.zip`. The WAV helper does not trim its replacement dash, so every one produces malformed `--demo.wav` plus `--drum-rack-stem.wav`, `--bass-808-stem.wav`, `--synth-stem.wav`, and `--chord-stem.wav`. Distinct projects can therefore overwrite each other's saved/exported deliverables.

## Non-Goals

- Transliteration, locale-specific romanization, renaming existing project titles, changing project data/schema, changing audio content, cloud sharing, remote storage, accounts, or external distribution.
- Supporting arbitrary control characters, path traversal, platform-reserved names, or unbounded filename length as literal output; unsafe characters must remain sanitized.
- Replacing human listening review or claiming external release completion.

## Constraints

- QA completes before separate review.
- Use one shared Unicode-letter/number-aware file stem across all project-owned artifacts so extensions/suffixes remain consistent.
- Normalize title text, replace separators/unsafe punctuation, trim repeated separators, bound UTF-8 byte length, avoid Windows reserved basenames, and retain an ASCII fallback for empty/symbol-only titles.
- Prove distinct Korean titles generate distinct safe project, mix, stem, MIDI, Handoff, and bundle names; write and decode their actual mix WAV files through sample audio QA.
- Preserve current English filename outputs and existing public suffixes/extensions.
- Keep generated WAV/JSON/Markdown evidence ignored under `build/desktop`; record no private audio, project data, credentials, URLs, or external distribution claims.

## Implementation Plan

- [x] Add a shared Unicode-safe bounded project file stem to the domain filename contract.
- [x] Replace duplicate ASCII-only slug helpers in WAV, MIDI, and Delivery Bundle paths.
- [x] Add runtime collision/sanitization/fallback/length assertions for all project-owned file types.
- [x] Add two distinct Korean-title real WAV artifacts and decoded PCM/file-identity checks to sample audio QA.
- [x] Update durable product, harness, quality, and release documentation plus static contracts.
- [x] Run targeted QA, full verify, post-QA review, plan-1470 completion checkpoint, and worktree merge/push/cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-15 | Make Unicode export filename safety the plan-1470 target. | Main-branch reproduction proved multiple Korean/Japanese titles collide across every deliverable and produce malformed dash-only WAV names. |
| 2026-07-15 | Centralize one Unicode-aware stem instead of patching each exporter separately. | Project JSON, WAV, MIDI, Handoff, and bundle modules currently duplicate incompatible ASCII-only rules; one contract prevents drift and cross-artifact identity mismatch. |
| 2026-07-15 | Preserve normalized Unicode letters, marks, and numbers while bounding the shared stem to 120 UTF-8 bytes. | This retains readable Korean/Japanese/accented titles, leaves suffix space within common filesystem limits, and avoids cutting through a multi-byte code point. |
| 2026-07-15 | Add `서울 비트` and `부산 비트` as real eight-bar full-mix QA cases. | Filename assertions alone would not prove that non-English paths are actually written and decoded through the production WAV renderer. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-15 | project_lead | Created plan-1470 from clean synchronized main `f260ecf2` in `codex/plan-1470-unicode-export-filenames`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-15 | quality_runner | Pre-fix reproduction confirmed four non-English titles share project/MIDI/Handoff/bundle fallbacks and malformed `--demo.wav`/dash-only stem WAV names. |
| 2026-07-15 | harness_builder | Added `projectFileStem` with NFKC normalization, Unicode letter/mark/number preservation, unsafe-separator collapsing, 120-byte UTF-8 truncation, Windows reserved-name protection, and a stable symbol-only fallback; project JSON, WAV, MIDI, Handoff, and bundle paths now share it. |
| 2026-07-15 | quality_runner | Runtime smoke passed 4 distinct non-English titles x 9 deliverables, established English compatibility, accent normalization, reserved/fallback cases, and a 120/120-byte bound. |
| 2026-07-15 | quality_runner | Sample audio QA passed with 26/26 WAVs ending at digital zero, 18/18 full mixes preserving post-boundary content, and 2/2 distinct Korean-title WAV files; `npm run harness:smoke`, `npm run typecheck`, and `npm run qa` also passed. |
| 2026-07-15 | quality_runner | Full `npm run verify` exited 0. Source/packaged/ad-hoc/PKG-payload/installed Electron paths, project IO, DMG/PKG construction, delivery packages, privacy checks, and expected value-free external distribution blockers all passed. |
| 2026-07-15 | review_judge | Post-QA review found no blocking, major, or moderate issue. Every project-owned filename entry point uses the shared bounded stem; established English output remains stable; real Korean WAV paths and hashes are distinct. |
| 2026-07-15 | quality_runner | Final sample regeneration passed with 26/26 zero-ended WAVs, 18/18 full-mix tails, and distinct `서울-비트-demo.wav` / `부산-비트-demo.wav` artifacts. |
| 2026-07-15 | plan_keeper | Completion-summary refresh exited 0 with latest completed plan `plan-1470`, `1461-1470: 10/10`, required checkpoint run/ready, fresh 6/6 checkpoint artifacts, and next scheduled boundary `plan-1480`. |
