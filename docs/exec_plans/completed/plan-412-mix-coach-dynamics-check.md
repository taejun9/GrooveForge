# plan-412-mix-coach-dynamics-check

## Status

Completed

## Goal

Add an Export Dynamics check to Mix Coach so producers can catch overly flat or overly spiky rendered beats, and beginners can understand punch/flatness as part of the same finish pass as headroom, limiter, stem balance, and low-end checks.

## Scope

- Add a read-only Mix Coach check derived from existing export analysis peak-minus-RMS dynamics.
- Keep focus/Quick Actions behavior on the existing Mix Coach check loop.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No LUFS, true-peak, platform-compliance, publishing, licensing, professional mastering, remote analysis, audio import, sampling, plugin hosting, accounts, analytics, or cloud sync.
- No automatic mix fixing, new Mix Fix action, changed Mix Fix thresholds, changed render/export analysis bytes, changed audio rendering, changed limiter behavior, changed project schema, or changed save/load/playback behavior.

## Files

- `src/ui/App.tsx`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/completed/plan-412-mix-coach-dynamics-check.md`
- `docs/reviews/plan-412-mix-coach-dynamics-check-review.md`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## QA Log

- 2026-06-19: `git diff --check` passed.
- 2026-06-19: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-19: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-19: `npm run typecheck` passed.
- 2026-06-19: `npm run build` passed with the existing Vite chunk-size warning.
- 2026-06-19: `npm run qa` passed.
- 2026-06-19: `npm run verify` passed, including runtime smoke, typecheck, and build.
- 2026-06-19: `npm run dev -- --host 127.0.0.1` was blocked by sandbox `listen EPERM`; escalated retry was rejected by the environment policy, so browser/dev-server smoke was not run.

## Review

No findings. The change is read-only, derives from existing export analysis, keeps focus routing within the existing Mix Coach path, and does not alter render bytes, project schema, sampling scope, or Mix Fix behavior.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add dynamics as a Mix Coach diagnostic, not a Mix Fix. | Flat/spiky output is useful to flag, but automatic dynamics repair would imply mastering behavior and is outside this safe step. |
| 2026-06-19 | Keep thresholds local to peak-minus-RMS dynamics only. | The app can flag flat or spiky exports without claiming LUFS, true-peak, platform compliance, or professional mastering. |

## Progress

- [x] Created `codex/plan-412-mix-coach-dynamics-check` worktree.
- [x] Inspect Mix Coach check derivation and review routing.
- [x] Add read-only dynamics check.
- [x] Update docs/static QA.
- [x] Run validation and review.
- [x] Move plan to completed and create review mirror.
