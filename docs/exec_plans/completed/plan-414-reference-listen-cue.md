# plan-414-reference-listen-cue

## Status

Completed

## Goal

Add a read-only Reference Alignment Listen Cue card so experienced producers can quickly choose the right reference-comparison listening scope, and beginners can understand whether to compare the Pattern, Song, Full Mix, or Handoff posture before exporting.

## Scope

- Derive Listen Cue only from existing Session Brief text, Delivery Target, arrangement readiness, deterministic export analysis, deterministic stem analysis, and existing Reference Alignment card posture.
- Show the card in Reference Alignment and expose it through the existing Reference Alignment Focus buttons and Quick Actions card loop.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No reference audio import, waveform matching, audio analysis, sampling, sampler devices, remote AI, remote analysis, autoplay, cue playback, changed playback/export/render bytes, changed project schema, changed Session Brief fields, accounts, analytics, or cloud sync.

## Files

- `src/ui/workstationAnalysis.ts`
- `src/ui/workstationUiModel.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/completed/plan-414-reference-listen-cue.md`
- `docs/reviews/plan-414-reference-listen-cue-review.md`

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

No findings. The Listen Cue card is read-only, derives from existing Reference Alignment inputs, routes through existing Focus buttons and Quick Actions card loops, and does not import reference audio, trigger playback, change project schema, or change render/export output.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add Listen Cue as a read-only Reference Alignment card. | It improves reference-based workflow guidance without importing or analyzing reference audio. |
| 2026-06-19 | Keep Listen Cue as scope guidance, not playback automation. | Users still choose what to play; the app only points them to Pattern, Song, Full Mix, or Handoff comparison readiness. |

## Progress

- [x] Created `codex/plan-414-reference-listen-cue` worktree.
- [x] Inspect Reference Alignment derivation and routing.
- [x] Add read-only Listen Cue card.
- [x] Update docs/static QA.
- [x] Run validation and review.
- [x] Move plan to completed and create review mirror.
