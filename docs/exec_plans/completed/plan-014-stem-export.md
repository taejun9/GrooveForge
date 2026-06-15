# plan-014-stem-export

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Move GrooveForge toward a desktop app that working composers can respect while remaining easy for beginners.

## Goal

Add stem export so users can export isolated drum, 808, synth, and chord WAV files from the current arrangement without needing sampling, plugin hosting, or external tools.

## Non-Goals

- No ZIP packaging or cloud delivery.
- No sample import, sampler tracks, chopping, or audio warping.
- No native file chooser for multi-stem folder export in this pass.
- No LUFS/true-peak metering or mastering analysis in this pass.

## Context Map

- `src/audio/render.ts`: offline mix rendering and WAV encoding.
- `src/ui/App.tsx`: transport command strip and export actions.
- `src/styles.css`: command button layout if needed.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA expectations.
- `harness/scripts/run_qa.py`: durable validation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve the composition-first invariant: stems come from musical events and built-in instruments, not imported samples.

## Implementation Plan

- [x] Add isolated stem render targets for drums, 808, synth, and chords.
- [x] Keep the existing full-mix WAV export behavior intact.
- [x] Make stem export use current arrangement length, sound design, channel volume/pan, and master ceiling.
- [x] Add a one-click Stems command with user-visible export status.
- [x] Update docs and QA expectations.
- [x] Run QA/build/browser verification.
- [x] Move plan to completed and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `npm run verify`
- `git diff --check`
- Browser check against local dev server:
  - clicked `Stems`,
  - verified status reported `Exported 4 stems`,
  - verified no console errors,
  - verified playback still started after the export path was exercised.

## Review Plan

QA completed before review. Review checked that stem export is an additive professional workflow, does not alter the composition-first product boundary, and does not break full-mix WAV export.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Export separate stem WAV downloads instead of adding ZIP packaging. | This gives immediate producer utility with the existing browser/Electron-safe download path and avoids adding a packaging dependency before the render path is proven. |
| 2026-06-15 | Stem renders isolate track families but keep channel volume/pan and master ceiling. | Producers need separated files that still match the current rough mix balance and arrangement length. |
| 2026-06-15 | Ignore preview mute/solo when isolating stems, while keeping full-mix WAV behavior unchanged. | Stem export should provide all core track families even if the user was soloing or muting during preview. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Created plan for first stem export workflow. |
| 2026-06-15 | harness_builder | Added isolated render targets, `exportStems`, UI command, docs, and QA expectations. |
| 2026-06-15 | quality_runner | Ran QA, typecheck, verify, diff check, and Browser validation. |
| 2026-06-15 | review_judge | Completed review mirror with residual risk notes. |

## Completion Notes

GrooveForge now exports four isolated stem WAV files from the current arrangement: drums, 808, synth, and chords. The full-mix WAV export remains intact.

Stem export uses the existing event-based composition model, arrangement length, sound design, channel volume/pan, and master ceiling. It does not introduce sampling, audio import, or external assets.
