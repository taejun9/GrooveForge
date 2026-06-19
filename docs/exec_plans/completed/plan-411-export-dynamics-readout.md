# plan-411-export-dynamics-readout

## Status

Completed

## Goal

Add a local Export Dynamics readout to the finishing surface so producers can scan whether the rendered beat still has punch and beginners can understand peak-versus-RMS spacing before exporting, without making LUFS, true-peak, platform-compliance, mastering, or sampling claims.

## Scope

- Derive a crest/dynamics value from existing deterministic export analysis peak and RMS values.
- Surface the value in the Export Meter and related export/handoff text where it helps users inspect final output posture.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No LUFS, true-peak, platform loudness, publishing, licensing, professional mastering, remote analysis, audio import, sampling, plugin hosting, accounts, analytics, or cloud sync.
- No changes to audio rendering, limiter behavior, mixer/master controls, export file contents, project schema, save/load migration, playback scheduling, or Master Automation behavior.

## Files

- `src/ui/workstationMixPanels.tsx`
- `src/ui/workstationPatternTools.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/completed/plan-411-export-dynamics-readout.md`
- `docs/reviews/plan-411-export-dynamics-readout-review.md`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## QA Log

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run qa` passed.
- `npm run verify` passed.
- Browser/dev-server smoke not run: `npm run dev -- --host 127.0.0.1` failed with `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by the current environment policy.

## Review

Post-QA review found no changes to audio rendering, limiter behavior, mixer/master controls, export file contents, project schema, save/load migration, playback scheduling, Master Automation behavior, sampling, plugin hosting, remote analysis, remote AI, analytics, accounts, or cloud sync. Export Dynamics is derived only from existing local `peakDb` and `rmsDb`, displayed in Export Meter, and included in Handoff Sheet text. No findings.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add export dynamics as a peak-minus-RMS readout, not LUFS. | Crest-style spacing is useful for punch/flatness judgment and can be derived from existing local analysis without claiming platform compliance. |
| 2026-06-19 | Keep dynamics in UI and Handoff Sheet only. | Producers can scan output posture and collaborators can read the value without changing render bytes or project data. |

## Progress

- [x] Created `codex/plan-411-export-dynamics-readout` worktree.
- [x] Inspect Export Meter and export report helpers.
- [x] Add read-only dynamics/crest readout.
- [x] Update docs/static QA.
- [x] Run validation and review.
- [x] Move plan to completed and create review mirror.
