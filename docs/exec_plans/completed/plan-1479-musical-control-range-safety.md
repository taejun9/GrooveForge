# plan-1479-musical-control-range-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Keep recognized finite musical control values reopenable even when imported or direct in-memory state exceeds the editor range. Repair sound-design parameters, drum dynamics, note/chord dynamics, mixer processing, arrangement energy/bars, and related bounded performance values through one domain contract, then render a deterministic playable WAV from the repaired project.

## Evidence and Motivation

Controlled reproduction on synchronized main `4cfd8f2e` changed one finite value at a time in an otherwise valid current project: `sound.kickPunch=4`, drum velocity `2`, bass velocity `2`, chord velocity `-1`, mixer Drive `2`, and arrangement energy `2`. Every case was rejected by both `parseProjectFile` (`Invalid GrooveForge project file.`) and `serializeProjectFile` (`Invalid GrooveForge project state.`), even though the domain already contains bounded normalizers for each control. This makes one recoverable control excursion prevent the entire beat from opening or being saved.

## Non-Goals

- Guessing malformed enums, pitches, track ids, pattern slots, chord roots/qualities, or structurally invalid arrays.
- Accepting non-finite values in JSON or changing project file version 1.
- Changing editor slider ranges, sound synthesis design, genre profiles, or arrangement capacity.
- Treating automated PCM checks as a replacement for human listening.

## Constraints

- QA completes before separate review.
- Structural validators must continue rejecting wrong types, missing required shapes, invalid enums, and non-finite values.
- Recognized finite values outside editor bounds must reach domain normalization instead of rejecting the full project.
- Current wrapped, bare, legacy, snapshot, durable serialization, offline render, MIDI, and realtime/parser-bypass paths must share the same bounded values where applicable.
- Normalization must preserve already-canonical caller values and must not mutate caller-owned source objects.
- The repaired sample must exercise audible out-of-range inputs, decode as real PCM, retain post-boundary content, end at digital zero, and rerender byte-identically.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Define and apply tolerant-finite input shapes with strict structural validation and bounded normalization.
- [x] Close direct render, MIDI, audition, and realtime gaps for sound and event controls.
- [x] Add runtime, static, and sample-audio regression coverage across wrapped, bare, legacy, snapshot, serialization, and bypass paths.
- [x] Run targeted QA, actual WAV QA, separate review, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make musical control range safety the plan-1479 target. | Recoverable finite control excursions currently make an otherwise valid beat impossible to open or save despite existing domain normalizers. |
| 2026-07-16 | Separate structural recognition from editor-range repair for finite musical controls. | Wrong types, invalid enums, malformed pitches, non-finite values, and incorrect array shapes must still reject, while recognized finite controls should reach the existing domain normalizers. |
| 2026-07-16 | Normalize sound controls at offline render, realtime playback, and editor audition boundaries. | Parser normalization alone does not protect direct in-memory or parser-bypass callers, and canonical values retain object identity to avoid unnecessary realtime wrapper churn. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1479 from clean synchronized main `4cfd8f2e`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction confirmed six separate finite out-of-range sound, drum, note/chord, mixer, and arrangement controls each reject both current wrapped import and durable serialization. |
| 2026-07-16 | harness_builder | Changed musical-control input guards to accept only structurally recognized finite values and route them through bounded sound, drum, note/chord, mixer, and arrangement normalizers. Direct offline render, realtime playback, and editor audition now normalize sound and note dynamics defensively without mutating caller-owned state. |
| 2026-07-16 | quality_runner | Runtime safety passed wrapped, bare, serialized, snapshot, legacy, direct-normalizer, WAV, and MIDI paths (`8/8`) while wrong type, wrong array length, and invalid chord quality remained rejected (`3/3`). A deterministic 1,000-case extreme-value property smoke passed reopen/save/reopen idempotence, bounds, source immutability, and canonical sound identity. |
| 2026-07-16 | quality_runner | Sample-audio schema 12 passed 35/35 playable WAVs, 35/35 digital-zero endings, and 27/27 full mixes with post-boundary content. The repaired control-range beat produced a deterministic 29.0426-second WAV with SHA-256 `03ff1a1d1a107d6f64bd61b602779a50ee1498566358b14aea1631e499e4045a`. |
| 2026-07-16 | review_judge | Separate post-QA review found no blocking, major, or moderate product findings. The domain, scheduler, render, storage, and harness contracts were reread and the 1,000-case property smoke plus post-review QA/typecheck/build/runtime/sample reruns passed. |
| 2026-07-16 | quality_runner | `npm run release:check` reached its final external-completion resume packet after passing quality, renderer, workflow, persona, runtime, sample audio, delivery/reopen, native/packaged/PKG/installed project I/O, app launch, packaging, ad-hoc signing, DMG, PKG, payload, simulated install, privacy, and release-readiness smoke checks. |
| 2026-07-16 | project_lead | Completed local scope. Human listening and private Developer ID signing, notarization, Gatekeeper acceptance, release-channel metadata, and external distribution remain explicit manual/external boundaries rather than claims of this plan. |
