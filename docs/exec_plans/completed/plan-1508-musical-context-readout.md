# plan-1508-musical-context-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Confirm through research whether BPM, Key, and Time signature can be shown in the UI, and add the feature when feasible.

## Goal

Keep GrooveForge's editable BPM and Key controls clearly identifiable and add an honest, always-visible Time signature readout for the fixed 4/4 project grid.

## Non-Goals

- Adding editable or per-section time signatures.
- Changing project-file schema, scheduler timing, pattern length, MIDI metadata, render duration, metronome accents, or exported bytes.
- Adding remote services, accounts, analytics, payments, uploads, or sampling-first workflow.

## Context Map

- `src/domain/workstation.ts`: domain timing constants and the fixed 16-step bar.
- `src/ui/App.tsx`: top transport project setup controls.
- `src/styles.css`: transport setup layout and responsive containment.
- `harness/scripts/run_renderer_smoke.mjs`: first-render semantic and hierarchy evidence.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live Electron geometry and readable-control evidence.
- `docs/references/official-sources.md`: official DAW research trail.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Do not present unsupported alternate meters as editable project behavior.

## Implementation Plan

- [x] Record official control-bar/LCD references for tempo and time signature placement.
- [x] Give the existing BPM and Key controls stable semantic test identifiers.
- [x] Add a read-only `Time signature / 4/4 / Fixed grid` field beside BPM and Key.
- [x] Preserve top-bar containment at standard and minimum supported widths.
- [x] Extend renderer and live desktop smoke evidence.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` for live visibility, geometry, and readable-copy evidence.
- Run `git diff --check`.

## Review Plan

QA completes before review starts. Review checks truthful meter scope, BPM/Key regressions, accessible labels, keyboard reachability, responsive containment, persistence boundaries, and timing/export non-regression.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | Add Time signature as a read-only 4/4 readout rather than a project field. | The current domain defines each bar as 16 sixteenth-note steps and has no meter field; editable meter would require a separate scheduler, grid, metronome, MIDI, render, and migration project. |
| 2026-07-23 | Place the readout beside editable BPM and Key controls. | Official Ableton and Logic documentation place tempo and time signature in persistent Control Bar/LCD project context, and this keeps musical identity together. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Plan created in the dedicated feature worktree after repository and official-source research. |
| 2026-07-23 | quality_runner | Typecheck, renderer smoke, repository QA, production build, live Electron launch smoke, minimum-width containment, and diff checks passed after preserving the existing Korean README starter-session contract. |
| 2026-07-23 | review_judge | Separate post-QA review found no blockers; the readout is truthful, accessible, responsive, and isolated from persistence and audio behavior. |

## Completion Notes

The existing BPM number input and Key selector now have stable semantic identifiers and accessible names. A neighboring read-only Time signature field shows `4/4` with `Fixed grid` guidance from the domain-owned meter constant, so users can scan the three core musical context values without implying that alternate meters are already supported.

Official Ableton Live and Apple Logic Pro references were recorded for Control Bar/LCD placement and meter meaning. Architecture and bilingual public documentation now state the fixed-grid boundary.

`npm run typecheck`, `npm run renderer:smoke`, `npm run qa`, `npm run build`, approved live `npm run desktop:launch-smoke`, and `git diff --check` passed. Live Electron evidence confirmed 107 required test ids, the new text, a 1440x928 standard viewport, a 1180px minimum viewport with zero horizontal overflow, and all direct transport/project actions still visible. No project schema, scheduler, metronome, MIDI, render, or export-byte behavior changed.
