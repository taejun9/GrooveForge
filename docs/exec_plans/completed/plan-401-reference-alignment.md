# plan-401-reference-alignment

## Status

Completed

## Goal

Add a local Reference Alignment readout so beginners can understand whether the current beat has enough session brief context, reference direction, arrangement, mix, and delivery posture, while working producers can scan reference fit quickly before export or handoff.

## Scope

- Add a UI-local Reference Alignment summary derived from existing Session Brief, Delivery Target, arrangement, Beat Readiness, export analysis, and stem analysis.
- Show the readout near Session Brief/Handoff context without changing saved project schema.
- Add Quick Actions Reference Alignment focus and direct card commands that route only to existing Session Brief, Arrange, Master, or Deliver panels.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No reference audio import, sample import, waveform analysis, remote AI, copyrighted reference fetching, audio matching, accounts, analytics, cloud sync, or professional mastering claims.
- No project schema change, save/load migration, export behavior change, playback change, render change, or automatic beat mutation.
- No sampling workflow promotion.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationAnalysis.ts`
- `src/ui/workstationGuidancePanels.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## QA Log

- `git diff --check` passed on 2026-06-19.
- `python3 harness/scripts/run_qa.py` passed on 2026-06-19.
- `python3 harness/scripts/run_quality_gate.py` passed on 2026-06-19.
- `npm run typecheck` passed on 2026-06-19.
- `npm run build` passed on 2026-06-19 with the main app chunk at 499.95 kB and no Vite chunk warning.
- `npm run qa` passed on 2026-06-19.
- `npm run verify` passed on 2026-06-19.

## Review

Post-QA review passed with no blocking findings. The implementation stays UI-local, does not change saved project schema, does not add audio/reference import or sampling behavior, and routes focus actions only to existing brief fields, Arrange, Master, or Deliver panels.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Keep Reference Alignment read-only and local. | The feature should improve judgment for beginners and producers without importing reference audio, analyzing copyrighted material, or changing project data. |

## Progress

- [x] Created `codex/plan-401-reference-alignment` worktree.
- [x] Inspect current Session Brief, Handoff, and Quick Actions surfaces.
- [x] Implement Reference Alignment summary, UI, and Quick Actions.
- [x] Update docs/static QA.
- [x] Run QA/build/verify and review.
- [x] Move plan to completed and create review mirror.
