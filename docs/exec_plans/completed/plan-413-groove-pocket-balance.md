# plan-413-groove-pocket-balance

## Status

Completed

## Goal

Add a read-only Groove Compass Pocket Balance card so experienced producers can scan whether the selected Pattern leans early, late, flat, or moving, and beginners can understand groove pocket direction from existing drum timing and velocity data.

## Scope

- Derive Pocket Balance from selected Pattern drum hits, drum microtiming, and drum velocity values.
- Show the card in Groove Compass and expose it through existing Groove Compass focus and Quick Actions card loops.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No automatic groove correction, hidden humanization, new Drum Move action, changed swing/microtiming/velocity thresholds outside this read-only diagnostic, changed playback/export/render bytes, changed project schema, sampling, imported audio, remote AI, remote analysis, plugin hosting, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/completed/plan-413-groove-pocket-balance.md`
- `docs/reviews/plan-413-groove-pocket-balance-review.md`

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

No findings. The card is read-only, derives only from selected Pattern drum timing and velocity data, flows through the existing Groove Compass focus and Quick Actions card loops, and does not change project schema, playback, export, or drum edit behavior.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Keep Pocket Balance read-only inside Groove Compass. | It improves direct beat composition feedback without implying automatic groove repair or a genre-authenticity guarantee. |
| 2026-06-19 | Use early/late hit counts plus velocity spread, not style-authenticity scoring. | Producers can scan pocket direction and beginners can understand motion without turning Groove Compass into a correctness judge. |

## Progress

- [x] Created `codex/plan-413-groove-pocket-balance` worktree.
- [x] Inspect Groove Compass card derivation and Quick Actions routing.
- [x] Add Pocket Balance card.
- [x] Update docs/static QA.
- [x] Run validation and review.
- [x] Move plan to completed and create review mirror.
