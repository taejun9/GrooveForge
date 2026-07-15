# plan-1471-project-title-integrity

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / privacy_guard

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Keep project titles safe, readable, and bounded across direct editing, project-file import/roundtrip, local draft recovery, Handoff Sheet, Delivery Bundle manifests, and audio/export filenames. Prevent control characters, multiline metadata injection, whitespace-only titles, and unbounded title payloads while retaining readable Korean, Japanese, accented, and emoji titles.

## Evidence and Motivation

Controlled reproduction on synchronized main `f3aa50a9` loaded the title `  서울\n야간\t비트\u0000  ` without normalization. The resulting Handoff Sheet split the `Title:` field across two lines and retained the NUL character, while reserialization preserved the malformed title. A whitespace-only title also loaded unchanged, and a 10,000-character title passed project parsing. The direct Title input has no `maxLength`, sanitization, or final normalization. Filenames are safe after plan-1470, but project metadata, visible UI state, local drafts, Handoff text, and Delivery Manifest title fields remain inconsistent and can become misleading or unwieldy.

## Non-Goals

- Transliteration, automatic language changes, title uniqueness across unrelated projects, cloud naming, account identity, or external distribution.
- Changing musical events, BPM, arrangement, mixer/master behavior, audio content, project file version, filename suffixes, or the plan-1470 shared stem contract.
- Claiming that automated metadata/PCM checks replace human review or listening.

## Constraints

- QA completes before separate review.
- Use one domain-owned title contract for imported/saved state and UI finalization.
- Preserve ordinary Unicode text and emoji; normalize compatibility forms, collapse unsafe control/line whitespace to visible spaces, trim edges, apply a documented bound, and use `Untitled Beat` for empty/whitespace-only input.
- Direct typing must remain natural: input-time safety cannot make it impossible to type a space between words; final normalization occurs on blur and at durable/import boundaries.
- Prove malformed imported titles cannot inject Handoff/Manifest lines and that normalized Korean title state creates and decodes a real WAV with the expected filename.
- Generated evidence stays ignored under `build/desktop`; record no private project data, credentials, URLs, or external distribution claims.

## Implementation Plan

- [x] Add bounded project-title input/final normalization helpers and apply them to project import/serialization.
- [x] Add Title input length, input-time safety, and blur-time finalization without breaking ordinary multi-word typing.
- [x] Add runtime project roundtrip, Handoff, manifest, fallback, Unicode, emoji, and length regression coverage.
- [x] Add one malformed-import-to-normalized-title real WAV case to sample audio QA.
- [x] Update product, harness, quality, release documentation, and static contracts.
- [x] Run targeted QA, full verify, separate review, completion refresh, main merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-15 | Make project-title integrity the plan-1471 target. | Main accepts control characters, multiline metadata injection, blank titles, and 10,000-character titles even though filenames are now safe. |
| 2026-07-15 | Separate input-time sanitization from final title normalization. | Users must be able to type ordinary multi-word titles naturally while imported/durable metadata still receives one strict canonical form. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-15 | project_lead | Created plan-1471 from clean synchronized main `f3aa50a9` in `codex/plan-1471-project-title-integrity`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-15 | quality_runner | Pre-fix reproduction confirmed multiline/NUL Handoff injection, malformed-title reserialization, whitespace-only title acceptance, a 10,000-character accepted title, and no direct input length bound. |
| 2026-07-15 | harness_builder | Added one domain-owned 80-code-point title contract, natural input-time sanitization plus blur finalization, and durable normalization for import, project JSON, snapshots, local drafts, Handoff, Delivery Manifest, and shared filenames. |
| 2026-07-15 | quality_runner | Targeted QA passed: build, typecheck, repository QA, renderer smoke, runtime smoke, and sample-audio QA schema 5 with 27/27 WAV artifacts. The malformed imported title rendered as `서울-야간-비트-demo.wav` (SHA-256 `9ce2e495f1752a0559a8c228410a85a6aafd35d6ea9c31e9695865347fc4c6df`), 24.5122 seconds, peak -4.3051 dB, RMS -24.3501 dB, deterministic, digital-zero ending. |
| 2026-07-15 | quality_runner | Full `npm run verify` exited 0. Source/packaged/ad-hoc/PKG-payload/installed Electron paths, project IO, DMG/PKG construction, delivery packages, privacy checks, and expected value-free external distribution blockers all passed. |
| 2026-07-15 | review_judge | Post-QA review found no remaining blocking, major, or moderate issue. It added defense-in-depth title normalization to direct Delivery Manifest Markdown creation; repository QA, typecheck, build, renderer smoke, runtime smoke, and Delivery Bundle ZIP smoke passed again. |
| 2026-07-15 | plan_keeper | Completion-summary refresh passed with latest completed plan `plan-1471`, current window `1471-1480: 1/10`, 6 fresh / 0 stale / 0 missing summary artifacts, source prerequisites 21/21, and the existing value-free external/private release blocker preserved. |
