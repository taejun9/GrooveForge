# plan-1462-loop-scope-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the essential Transport loop-scope selector explain what Song, Block, Turn, and Pattern will audition before playback while preserving the direct four-button producer scan. First-time composers should understand that Turn means an adjacent block handoff; working composers should see the current song, block, transition, and Pattern targets without opening guidance or losing one-click switching.

## Evidence and Motivation

Live Browser audit at 1280×720 found a 340px four-column control with four 80.5px by 34px buttons labeled only `Song`, `Block`, `Turn`, and `Pattern`. The container has no explicit group role; every button has no `aria-label` or `aria-pressed`, all four are page Tab stops, and the current scope is exposed only through the `selected` CSS class. `Turn` successfully cues `Intro -> Verse / 3 bars`, and Pattern successfully cues `Pattern A / Step 1`, but those meanings and targets appear only after selection in the separate position readout. At the supported 1180px minimum, the group has 555px available and zero overflow, so there is room for concise two-line context without changing the four-column scan. The same audit also exposed duplicated formatter suffixes in `Pattern A · 21 events events` and `A · 21 events events` context copy.

## Non-Goals

- Changing loop scope ids, order, click handlers, playback scheduling, loop boundaries, transition derivation, selected arrangement block, selected Pattern, transport position math, Play/Stop, metronome, save/load, undo/redo, render, MIDI, or export.
- Renaming the established Song, Block, Turn, or Pattern scope labels or removing existing titles.
- Adding autoplay, count-in, recording, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or new project fields.

## Constraints

- QA completes before a separate review starts.
- Preserve Song, Block, Turn, Pattern order, ids, disabled logic, click handlers, titles, selected styling, and current one-click switching.
- Show a concise live target below every scope label: song length, selected block/section, adjacent handoff, and selected Pattern/event count.
- Expose one explicit group, four unique state-aware accessible names, boolean `aria-pressed` on all four buttons, and exactly one pressed scope.
- Keep a contained four-column single row with complete label/detail text, at least 48px control height, and zero internal/document horizontal overflow at both 1280px and the supported 1180px minimum.
- Remove only the redundant literal `events` suffix where `patternEventCount` already supplies singular/plural wording.
- Renderer and production Electron evidence cover copy, names, titles, pressed state, group role, dimensions, columns, rows, and containment; Browser proves actual scope and accessibility-state changes.

## Implementation Plan

- [x] Add concise dynamic Song, Block, Turn, and Pattern target copy plus unique state-aware accessible names.
- [x] Add explicit group and boolean pressed semantics while retaining the current click/disabled/title behavior.
- [x] Add a contained 48px two-line four-column treatment and fix adjacent duplicated event-count suffixes.
- [x] Add renderer and production Electron regression evidence and update durable contracts.
- [x] Run Browser at 1280px and 1180px, production Electron, full QA, and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make Transport loop-scope clarity the plan-1462 target. | Loop scope is an essential audition decision, but the current four bare words hide their current targets and expose selected state only through color. |
| 2026-07-14 | Keep `Turn` as the established producer label and explain it with the live adjacent handoff below the label. | Existing commands and readouts use Turn consistently; adding context improves beginner comprehension without renaming a professional workflow concept. |
| 2026-07-14 | Use native buttons with boolean `aria-pressed` inside a named group. | The controls perform immediate mutually exclusive actions; pressed semantics reveal the current mode while retaining native button activation and all four direct Tab targets. |
| 2026-07-14 | Reuse `patternEventCount` output without appending another `events` literal. | The formatter already owns singular/plural wording, and duplicate suffixes visibly reduce product polish. |
| 2026-07-14 | Show `All 8 bars` visually while keeping `8 bars timeline` in the Song accessible name. | Production Electron found the longer visible phrase clipped at the narrow command-strip width; the shorter direct copy passed 4/4 readability without losing screen-reader context. |
| 2026-07-14 | Use `.segmented.playback-mode-row button` for the 48px rule. | The later generic `.segmented button` rule has equal specificity and initially reduced the live controls to 36px; the scoped selector makes the intended minimum deterministic. |
| 2026-07-14 | Preserve the pre-existing Transport contract sentences before adding Turn-specific requirements. | The QA harness treats those established phrases as durable compatibility evidence, while the additive sentences document the new presentation layer. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main` at `4cd49e1e`; the unrelated plan-085 worktree and its existing untracked active plan remain untouched. |
| 2026-07-14 | repo_cartographer | Browser audit measured four 80.5px by 34px bare controls in a 340px row at 1280×720, no explicit group role, no accessible names or pressed semantics, four Tab stops, and zero overflow. At 1180×720 the same row had 555px available with zero document overflow. |
| 2026-07-14 | quality_runner | Browser interaction proved existing behavior: Turn selected and cued `Intro -> Verse / 3 bars`; Pattern selected and cued `Pattern A / Step 1`. The audit also found two visible `events events` suffix duplications. |
| 2026-07-14 | harness_builder | Added live Song/Block/Turn/Pattern target lines, unique state-aware names, boolean pressed semantics, one named group, 48px two-line styling, corrected event grammar, renderer checks, twelve production Electron evidence fields, and durable product/architecture/quality contracts. |
| 2026-07-14 | quality_runner | Browser at 1180×720 measured a contained 555px four-column row with four 48px controls, one pressed scope, four unique names, zero group/document overflow, and no duplicate grammar. Turn focused and cued `Intro -> Verse / 3 bars`; Pattern focused and cued `Pattern A / Step 1`. At 1280×720 the 340px row retained four 80.5px by 48px controls with zero overflow; a clean fresh Browser session had no console errors. |
| 2026-07-14 | quality_runner | The first production Electron pass returned 3/4 readable targets because `8 bars timeline` exceeded its narrow visual slot. The visible Song target became `All 8 bars` while its accessible name retained `8 bars timeline`; the repeated production Electron run passed 4/4 targets/names, one pressed scope, corrected grammar, and contained four-column layout. |
| 2026-07-14 | quality_runner | `git diff --check`, `npm run typecheck`, `npm run renderer:smoke`, `npm run build`, standalone `npm run desktop:launch-smoke`, and `npm run qa` passed. QA first identified three removed durable contract phrases; additive documentation restored them before the passing rerun. |
| 2026-07-14 | quality_runner | Full `npm run verify` exited 0 after repeating renderer, workflow, persona, runtime, Electron, project I/O, app/DMG/PKG/install, local delivery, privacy, and release-readiness evidence. The repeated Electron result again reported 4/4 Transport loop targets. |
| 2026-07-14 | review_judge | Separate post-QA review found no blocking, major, or moderate issues. The change remains a UI-local projection over existing loop state and preserves playback, arrangement, Pattern, history, persistence, render, and export boundaries. |
