# plan-1455-chord-tool-readability

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the selected-chord edit toolbar readable and directionally unambiguous wherever the Instruments panel is rendered. The first-time composer starter must expose all eight chord actions with meaningful visible labels and unique accessible names instead of shrinking each label to a few pixels and presenting duplicate `Step` and `Voice` controls. A genuinely wide chord editor should retain its efficient single-row scan, while a narrow workstation column should use a compact multi-row layout without changing any chord edit behavior.

## Evidence and Motivation

A live 1280×720 first-time-composer starter audit found the selected-chord tool group at 299px wide. Its eight equal columns compressed every button to 32.2px; after the icon, every text span retained only 5–6px while its label needed 22–31px, so `Aud`, `Step`, `Dup`, `Prev`, `Next`, and `Voice` were visually reduced to fragments. Because the buttons had no explicit accessible names, both directional step buttons were exposed as `Step` and both inversion buttons as `Voice`, leaving only six unique names for eight distinct actions. The title attributes contained the missing meaning, but hover-only direction is not an acceptable first-use or keyboard workflow.

## Non-Goals

- Changing chord audition, movement, duplication, beat-copy, inversion, selection, or undo behavior.
- Changing chord event data, harmony analysis, keyboard shortcuts, playback, render/export, persistence, project schema, or style generation.
- Redesigning the Instruments panel, chord cards, Harmony Moves, Sound Design, piano rolls, or workspace column proportions.
- Adding remote services, imported audio, sampling-first behavior, accounts, analytics, or private-value capture.

## Constraints

- QA completes before a separate review starts.
- Responsive behavior follows the chord editor's own inline size rather than only the viewport width.
- The narrow toolbar must show eight readable visible labels, eight unique explicit accessible names, four columns, two rows, and zero internal overflow.
- Directional actions must name left/right, previous/next beat, and voicing down/up without relying on icon order or title hover.
- The wide toolbar must retain the existing eight-action single-row scan.
- Disabled posture, titles, handlers, project mutations, undo history, selection, and audition behavior remain unchanged.

## Implementation Plan

- [x] Give every selected-chord action a complete visible label and unique accessible name.
- [x] Add a component-local narrow toolbar layout while preserving the wide single-row scan.
- [x] Add renderer and production Electron evidence for the eight-action readability contract.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make selected-chord tool readability the next completion target. | The beginner starter lands beside the Instruments panel, but eight core chord actions currently collapse to label fragments and four directional actions cannot be uniquely identified from their accessible names. |
| 2026-07-14 | Use a chord-editor container query with a four-by-two narrow toolbar. | The Instruments column is narrow inside a 1280px desktop viewport; the component's actual width determines whether eight icon-plus-text actions can remain readable. |
| 2026-07-14 | Place the narrow container rules after the generic chord button and label rules. | The first Browser proof exposed that an earlier query lost the cascade and kept ellipsis clipping; the later placement makes the local readability contract authoritative without increasing selector specificity. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-14 | repo_cartographer | Browser audit entered the real first-time-composer starter at 1280×720 and measured a 299px toolbar, eight 32.2px buttons, 5–6px visible label spans against 22–31px content, and only six unique accessible names for eight actions. |
| 2026-07-14 | harness_builder | Added complete visible labels, eight explicit directional accessible names, a named chord-editor inline-size container, a four-by-two narrow layout, renderer locks, and production Electron launch evidence without changing existing callbacks or disabled calculations. |
| 2026-07-14 | quality_runner | Browser re-audit at 1280×720 measured eight 70.3px buttons with 60px label widths, 8/8 untruncated labels, eight unique names, four columns, two rows, and zero toolbar overflow. The 1180×720 minimum window retained 8/8 readable labels and zero document overflow; a 3400×1200 viewport retained the wide eight-column single-row scan with 8/8 readable labels. |
| 2026-07-14 | quality_runner | Standalone production Electron launch smoke passed the 8/8 readable-label, eight-name, four-by-two, zero-overflow contract plus all existing starter, layout, keyboard, disclosure, project-state, and visual evidence. |
| 2026-07-14 | quality_runner | Full `npm run verify` passed source, packaged app, ad-hoc signature, PKG payload, simulated install, project I/O, delivery, persona, and release-evidence paths; only the existing external signing, notarization, and private distribution proof remains unavailable locally. |
| 2026-07-14 | review_judge | Separate post-QA review approved the change with no blocking, major, or moderate findings. |
