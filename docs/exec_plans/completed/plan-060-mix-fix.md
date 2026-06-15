# plan-060-mix-fix

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족하고 작곡을 처음 해보는 사람도 쓰기 쉬운 데스크탑앱으로 완성시켜 달라는 장기 목표를 이어간다.

## Goal

Add explicit `Mix Fix` actions to Mix Coach so users can apply small, undoable rough-mix corrections after reading the deterministic mix checks. Beginners should get safe one-click fixes for headroom, stem spread, and low-end balance; working producers should get fast starting points that remain fully editable in the mixer.

## Non-Goals

- No automatic mastering or hidden background correction.
- No LUFS, true-peak, platform compliance, or release-readiness claims.
- No plugin hosting, remote analysis, remote AI, generated audio, accounts, analytics, or cloud sync.
- No sampling, imported audio, sampler track, or audio warping work.

## Context Map

- `src/ui/App.tsx`: Mix Coach, mixer/master update paths, export/stem analysis, undoable project updates.
- `src/styles.css`: Master panel and Mix Coach compact UI.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA wording for explicit mix fixes.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Mix Fix actions must run only after explicit user clicks and must route through undoable project update paths.
- Mix Coach suggestions remain deterministic, local, and honest about peak/RMS/headroom rather than platform loudness guarantees.

## Implementation Plan

- [x] Define `MixFixPreset` actions for headroom, stem balance, and low-end blend.
- [x] Add an `applyMixFixPreset` update path that changes only local mixer/master project state.
- [x] Add compact Mix Fix buttons to Mix Coach with deterministic labels and status.
- [x] Update product docs, QA rules, and static QA expectations.
- [x] Verify the UI and behavior in browser.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- Browser smoke test: verify Mix Fix buttons render, apply Headroom and Low End, undo is enabled, Mix Coach remains local/readable, no console errors, and no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Mix Fix actions are explicit, undoable, local-only, deterministic, limited to mixer/master state, honest about simplified processing, and free of sampling/remote AI/plugin scope drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add explicit Mix Fix buttons inside Mix Coach. | Current Mix Coach reads the mix but does not help beginners act; explicit rough-mix actions improve usability while preserving producer control. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added Headroom, Stem Balance, and Low End Mix Fix actions inside Mix Coach. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for explicit Mix Fix actions. |
| 2026-06-16 | quality_runner | `run_qa`, `run_quality_gate`, `npm run qa`, `npm run verify`, `git diff --check`, and browser smoke passed. |
| 2026-06-16 | review_judge | Reviewed Mix Fix for explicit-click behavior, undoable mixer/master updates, deterministic local analysis, and no sampling/remote-AI/plugin drift. |

## Completion Notes

Implemented. Mix Coach now offers explicit Headroom, Stem Balance, and Low End Mix Fix buttons. Browser smoke verified button rendering, Headroom and Low End value changes, undo enablement, no console errors, and no horizontal overflow.
