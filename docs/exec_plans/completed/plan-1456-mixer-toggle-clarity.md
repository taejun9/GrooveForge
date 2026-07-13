# plan-1456-mixer-toggle-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make every mixer mute and solo control immediately understandable, uniquely identifiable, and state-readable without sacrificing the compact five-strip professional scan. First-time composers must not need to know that `M` and `S` mean mute and solo, while working composers must retain one direct toggle per channel and the existing fast strip layout. Narrow mixer strips should place complete `Mute` and `Solo` controls beneath the track name; genuinely wide strips should keep the name and controls on one line.

## Evidence and Motivation

A live 1280×720 audit found ten mixer toggles across Drums, 808, Synth, Chord, and Master. Every control was a 30px button whose complete visible and accessible name was only `M` or `S`; none had an explicit accessible name, `aria-pressed`, or a title. The ten distinct channel actions therefore collapsed to only two accessible names, active state was only a color/class change, and the disabled Master solo control gave no explanation. The 1280px mix panel uses five 167px strips with 145px of top-row content width, while the supported 1180px layout gives each strip 216px and a 3400px viewport gives each strip 477px. The control layout must therefore respond to each strip's actual inline size rather than the viewport alone.

## Non-Goals

- Changing mute, solo, active-channel, undo, playback, rendering, export, or mixer update behavior.
- Changing mixer channel order, channel names, strip meters, volume, pan, processing, role readouts, or mix guidance.
- Adding mixer groups, sends, buses, automation, remote audio, imported samples, accounts, analytics, or network services.
- Redesigning the overall workspace grid or changing Master solo availability.

## Constraints

- QA completes before a separate review starts.
- All ten controls expose complete visible `Mute`/`Solo` labels, ten unique channel-specific accessible names, and explicit toggle state.
- The disabled Master solo retains a channel-specific name and explains its unavailable posture without becoming interactive.
- Narrow-strip responsiveness follows the strip's inline size, keeps both toggles contained and readable, and introduces no mixer or document horizontal overflow.
- Wide strips retain the one-row track-name-plus-toggle scan.
- Existing handlers, class state, disabled posture, project mutations, undo history, playback, save/load, render/export, privacy, and sampling boundaries remain unchanged.

## Implementation Plan

- [x] Add complete mixer toggle labels, unique accessible names, pressed semantics, and state-aware titles.
- [x] Add component-local narrow strip presentation while preserving the wide one-row scan.
- [x] Add renderer and production Electron evidence for the ten-control clarity and containment contract.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make mixer mute/solo clarity the next completion target. | The mixer is a core professional workflow, but its ten current controls expose only two names and color-only state while first-time users must already know studio shorthand. |
| 2026-07-14 | Use a mixer-strip inline-size container with complete labels. | The same five-strip grid produces 167px strips at 1280px, 216px strips at 1180px, and 477px strips at 3400px; the individual strip width determines whether the name and controls fit on one row. |
| 2026-07-14 | Give each visible toggle label a measurable block box. | Browser proof showed the words were visually present but inline spans reported zero client width, so the production contract could not distinguish readable text from an unmeasurable label box. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-14 | repo_cartographer | Browser audit measured ten 30px `M`/`S` controls, only two unique accessible names, zero explicit labels, zero pressed-state attributes, zero titles, and no document overflow at 1280×720. Mixer strip widths measured 167px at 1280, 216px at the supported 1180 minimum, and 477px at 3400. |
| 2026-07-14 | harness_builder | Added complete `Mute`/`Solo` labels, ten stable channel-specific names, project-state-derived pressed semantics, state-aware titles, a disabled Master solo explanation, named mixer-strip inline-size containers, renderer locks, and production Electron launch evidence without changing existing callbacks or disabled logic. |
| 2026-07-14 | quality_runner | Browser re-audit at 1280×720 measured ten 70.2px contained buttons with 54px readable label boxes, ten unique names, ten pressed states, ten titles, five narrow stacked strip headers, and zero strip/document overflow. Mute Drums changed `aria-pressed` and title from false/Mute to true/Unmute, then restored to false/Mute. |
| 2026-07-14 | quality_runner | At the supported 1180×720 minimum, five 216px strips retained one-row headers with ten 48px readable buttons and zero overflow. At 3400×1200, five 477px strips retained the same wide one-row scan with ten readable buttons and zero overflow. |
| 2026-07-14 | quality_runner | Standalone production Electron launch smoke passed the 10/10 readable, uniquely named, pressed-state, titled, contained, five-narrow-strip contract plus all existing starter, layout, keyboard, disclosure, project-state, and visual evidence. |
| 2026-07-14 | quality_runner | Full `npm run verify` passed source, packaged app, ad-hoc signature, DMG, PKG payload, simulated install, project I/O, delivery, persona, and release-evidence paths; only the existing external signing, notarization, and private distribution proof remains unavailable locally. |
| 2026-07-14 | review_judge | Separate post-QA review approved the change with no blocking, major, or moderate findings. |
