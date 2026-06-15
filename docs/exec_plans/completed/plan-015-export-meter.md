# plan-015-export-meter

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Move GrooveForge toward a desktop app that working composers can respect while remaining easy for beginners.

## Goal

Add a first export meter so users can see peak, RMS, headroom, and limiter activity before exporting the current arrangement.

## Non-Goals

- No standards-complete LUFS or true-peak implementation.
- No automatic mastering chain or claim that presets make a mix platform-approved.
- No plugin hosting, native DSP framework, or external metering dependency.
- No sample import, sampler tracks, chopping, or audio warping.

## Context Map

- `src/audio/render.ts`: offline rendering, limiter ceiling, WAV/stem export.
- `src/ui/App.tsx`: master panel and export status.
- `src/styles.css`: master meter layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA expectations.
- `harness/scripts/run_qa.py`: durable validation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep metering honest: label it as peak/RMS/headroom and limiter activity, not LUFS certification.

## Implementation Plan

- [x] Add offline export analysis stats from the existing renderer.
- [x] Track peak, RMS, headroom, duration, and limited sample count.
- [x] Add Master panel readouts and visual bars for export readiness.
- [x] Keep full-mix WAV and stem export behavior intact.
- [x] Update docs and QA expectations.
- [x] Run QA/build/browser verification.
- [x] Move plan to completed and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `npm run verify`
- `git diff --check`
- Browser check against local dev server:
  - verified peak/RMS/headroom/limiter readouts were visible,
  - changed master preset from `Headroom for Vocal` to `Clean Demo`,
  - verified ceiling and headroom meter values updated,
  - started playback and checked no console errors.

## Review Plan

QA completed before review. Review checked that the meter is useful but not overclaimed, and that export behavior remains intact.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement peak/RMS/headroom meter before LUFS. | This is practical, deterministic, and useful now without pretending to satisfy full loudness standards. |
| 2026-06-15 | Reuse the offline render path for analysis. | Export-readiness should measure the same arrangement and limiter path that WAV export uses. |
| 2026-06-15 | Change the master ceiling slider step to `0.1`. | Existing presets include `-0.8 dB`; the UI must represent preset ceilings accurately for meter trust. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Created plan for first export meter. |
| 2026-06-15 | harness_builder | Added export analysis stats, Master meter UI, docs, and QA expectations. |
| 2026-06-15 | quality_runner | Ran QA, typecheck, verify, diff check, and Browser validation. |
| 2026-06-15 | review_judge | Completed review mirror with residual risk notes. |

## Completion Notes

GrooveForge now shows an export meter in the Master panel. It reports peak, RMS, headroom, limiter activity, duration, and a simple status for the current arrangement.

The meter uses the same offline render path and limiter ceiling used for full-mix WAV export. It is intentionally labeled as peak/RMS/headroom metering, not LUFS or true-peak certification.
