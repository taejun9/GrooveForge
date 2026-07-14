# plan-1461-pattern-tab-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make Pattern A/B/C selection self-explanatory and keyboard-efficient without slowing the direct producer workflow. First-time composers should see that these are Patterns, which one they are editing, how many events each contains, and whether one is playing. Working composers should retain one-click and 1/2/3 switching while gaining conventional Arrow/Home/End navigation with a single tab stop.

## Evidence and Motivation

A live 1280×720 audit measured a 435.26px three-column row with three 141.09px by 34px controls and zero horizontal overflow. Despite that available width, the visible controls expose only `A`, `B`, and `C` plus event counts. Their computed accessible names are `A 21 events`, `B 25 events`, and `C 14 events`; the container and buttons have no tablist/tab roles, no `aria-selected`, no explicit accessible names, and every button has `tabIndex=0`. Clicking B correctly changes the readout to `Editing Pattern B`, but pressing ArrowRight while B is focused leaves both focus and selection on B.

## Non-Goals

- Changing Pattern event data, Pattern A/B/C count or order, pattern selection side effects, selected note/drum/chord clearing, playback scheduling, arrangement references, save/load, undo/redo, MIDI, render, or export.
- Changing Pattern Playback Readout, Audible Pattern Follow, Pattern Lab, Quick Actions Pattern Switch, numeric 1/2/3 shortcuts, or playing-Pattern derivation.
- Adding Patterns beyond A/B/C, renaming project schema fields, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Constraints

- QA completes before a separate review starts.
- Preserve the existing Pattern A/B/C order, ids, click handler, selection clearing, playing state, titles, numeric shortcuts, event counts, and selected/playing visual distinction.
- Show complete visible `Pattern A/B/C` labels plus concise editing/playing and event-count context.
- Expose a tablist with exactly one selected tab, complete unique state-aware accessible names, and exactly one keyboard tab stop.
- ArrowLeft/ArrowRight must wrap and select/focus the adjacent Pattern; Home/End must select/focus the first/last Pattern. Numeric shortcuts remain unchanged.
- Keep a contained three-column single row with readable text, at least 48px control height, and zero internal overflow at the audited 435px width.
- Renderer and production Electron evidence cover semantics, names, selection, roving focus, visible state copy, dimensions, columns, rows, and containment; Browser proves actual keyboard switching.

## Implementation Plan

- [x] Add complete visible Pattern labels, edit/play state copy, and state-aware accessible names.
- [x] Add tablist/tab selection semantics and roving Arrow/Home/End keyboard behavior.
- [x] Add a contained 48px three-column treatment that preserves the professional scan.
- [x] Add renderer and production Electron regression evidence and update durable contracts.
- [x] Run Browser, Electron, full QA, and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make Pattern tab clarity and keyboard selection the plan-1461 target. | Pattern selection is a primary composition control, but the current row presents cryptic one-letter names and no selected-tab semantics despite ample width. |
| 2026-07-14 | Use automatic activation for Arrow/Home/End navigation. | All Pattern content is local and immediate, so moving focus and edit selection together is fast, predictable, and consistent with direct producer use. |
| 2026-07-14 | Preserve independent editing and playing cues in both visible and accessible state copy. | A composer may edit one Pattern while another is audible during Song or Block playback; merging those states would hide an existing professional distinction. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main` at `61062e22`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-14 | repo_cartographer | Browser audit measured a 435.26px row, three 141.09px by 34px controls, and zero overflow. The controls had one-letter visible names, no explicit accessible labels, no tab roles or selected semantics, and three keyboard tab stops. |
| 2026-07-14 | quality_runner | Click selection correctly moved the edit target from Pattern A to B, but ArrowRight on focused B was a no-op; focus and the playback readout both remained on Pattern B. |
| 2026-07-14 | harness_builder | Added complete Pattern A/B/C labels, independent Editing/Playing copy, event counts, state-aware names, tablist/tab semantics, one roving tab stop, automatic Arrow/Home/End activation, and a contained 48px three-column surface without changing Pattern data or selection callbacks. |
| 2026-07-14 | quality_runner | Typecheck caught that `patternEventCount` already returns a localized count string; the implementation was corrected to reuse it directly. Renderer smoke and typecheck then passed, and the live evidence collector accepts both singular `event` and plural `events`. |
| 2026-07-14 | quality_runner | Final 1280×720 Browser evidence measured the same 435.26px row as three 141.09px by 48px tabs in one row with zero internal or label/detail overflow, three unique state-aware names, exactly one selected tab and tab stop, working Home/End, C-to-A ArrowRight wrap, A-to-C ArrowLeft wrap, and zero final console errors. |
| 2026-07-14 | quality_runner | Production build, standalone Electron launch smoke, `npm run qa`, and full `npm run verify` passed. Electron confirmed 3/3 complete labels and unique names, one selected roving tab stop, and a contained three-column layout; the full launch smoke passed again inside the integration chain. |
| 2026-07-14 | review_judge | Separate post-QA review approved the change with no blocking, major, or moderate findings. It confirmed Pattern order, ids, click and 1/2/3 paths, selection clearing, selected-versus-playing distinction, Pattern data, playback, arrangement, save/load, and export behavior remain intact. |
| 2026-07-14 | plan_keeper | Implementation, Browser evidence, Electron evidence, full QA, review, and completion evidence finished; moved the plan to `docs/exec_plans/completed/` and created its review mirror. |
